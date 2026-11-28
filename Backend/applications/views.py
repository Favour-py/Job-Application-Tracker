import os
import json
import logging
import ipaddress
import socket
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Application
from .serializers import ApplicationSerializer
import requests
import google.genai as genai
from google.genai import types

logger = logging.getLogger(__name__)

ALLOWED_SCHEMES = {'http', 'https'}
BLOCKED_HOSTS = {'localhost', '127.0.0.1', '0.0.0.0'}


def _is_safe_url(url):
    """Block SSRF: reject private/loopback IPs and non-http(s) schemes."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ALLOWED_SCHEMES:
            return False
        hostname = parsed.hostname
        if not hostname:
            return False
        if hostname.lower() in BLOCKED_HOSTS:
            return False
        # Resolve to IP and check for private/loopback ranges
        ip = ipaddress.ip_address(socket.gethostbyname(hostname))
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
            return False
        return True
    except Exception:
        return False


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)


def _extract_structured(soup):
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(script.string)
            if isinstance(data, list):
                data = next((d for d in data if d.get('@type') == 'JobPosting'), {})
            if data.get('@type') == 'JobPosting':
                loc = data.get('jobLocation', {})
                if isinstance(loc, list):
                    loc = loc[0] if loc else {}
                address = loc.get('address', {})
                location = address.get('addressLocality') or address.get('addressRegion') or address.get('addressCountry')
                salary_data = data.get('baseSalary', {})
                salary = None
                if salary_data:
                    value = salary_data.get('value', {})
                    min_val = value.get('minValue')
                    max_val = value.get('maxValue')
                    currency = salary_data.get('currency', '')
                    if min_val and max_val:
                        salary = f"{currency} {min_val} - {max_val}"
                    elif min_val:
                        salary = f"{currency} {min_val}"
                return {
                    'title': data.get('title'),
                    'company': data.get('hiringOrganization', {}).get('name'),
                    'location': location,
                    'salary': salary,
                    'employment_type': data.get('employmentType'),
                    'description': data.get('description', '')[:500] if data.get('description') else None,
                }
        except Exception:
            continue
    return {}


def _extract_with_ai(text):
    prompt = f"""Extract job details from the text below and return ONLY a valid JSON object with these fields:
    title, company, location, salary, employment_type, description.
    If a field is not found, use null. Do not invent or estimate any values.

    Text: {text}

    Return only the JSON object, no markdown, no explanation."""

    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
    ai_response = client.models.generate_content(
        model='gemini-3.5-flash-lite',
        contents=prompt,
        config=types.GenerateContentConfig(max_output_tokens=512)
    )
    raw = ai_response.text.strip()
    if raw.startswith('```'):
        raw = raw.split('```')[1]
        if raw.startswith('json'):
            raw = raw[4:]
    return json.loads(raw.strip())


class ExtractJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        url = request.data.get('url', '').strip()
        if not url:
            return Response({'error': 'URL is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not _is_safe_url(url):
            return Response({'error': 'Invalid or disallowed URL.'}, status=status.HTTP_400_BAD_REQUEST)

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }

        try:
            response = requests.get(url, timeout=10, headers=headers, allow_redirects=False)
            if response.is_redirect:
                return Response({'error': 'Redirects are not allowed for job URLs.'}, status=status.HTTP_400_BAD_REQUEST)
            response.raise_for_status()
        except Exception:
            return Response({'error': 'Failed to fetch the job page. The site may block automated access.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(response.text) < 200:
            return Response({'error': 'Page returned no content. This site may block automated access.'}, status=status.HTTP_400_BAD_REQUEST)

        soup = BeautifulSoup(response.text, 'html.parser')

        structured = _extract_structured(soup)
        if structured.get('title') and structured.get('company'):
            return Response(structured, status=status.HTTP_200_OK)

        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()
        text = ' '.join(soup.get_text(separator=' ').split())[:4000]

        try:
            data = _extract_with_ai(text)
        except json.JSONDecodeError:
            return Response({'error': 'Could not parse job details from this page.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception:
            return Response({'error': 'AI extraction failed. Please fill in the details manually.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(data, status=status.HTTP_200_OK)
