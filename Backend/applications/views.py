from django.shortcuts import render
from django.conf import settings
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Application
from .serializers import ApplicationSerializer
import requests
import os
import json
from bs4 import BeautifulSoup
import google.genai as genai

# Create your views here.


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)


class ExtractJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        url = request.data.get('url', '').strip()
        if not url:
            return Response({'error': 'URL is required.'}, status=status.HTTP_400_BAD_REQUEST)

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }

        try:
            response = requests.get(url, timeout=10, headers=headers)
            response.raise_for_status()
        except Exception as e:
            return Response({'error': f'Failed to fetch URL: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        soup = BeautifulSoup(response.text, 'html.parser')

        # Try JSON-LD structured data first (most job boards embed this for SEO)
        structured = {}
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
                    structured = {
                        'title': data.get('title'),
                        'company': data.get('hiringOrganization', {}).get('name'),
                        'location': location,
                        'salary': salary,
                        'employment_type': data.get('employmentType'),
                        'description': data.get('description', '')[:500] if data.get('description') else None,
                    }
                    break
            except Exception:
                continue

        # If structured data found and has at least title and company, return it
        if structured.get('title') and structured.get('company'):
            return Response(structured, status=status.HTTP_200_OK)

        # Fall back to Gemini extraction from page text
        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()
        text = ' '.join(soup.get_text(separator=' ').split())[:4000]

        prompt = f"""
        Extract job details from the text below and return ONLY a valid JSON object with these fields:
        title, company, location, salary, employment_type, description.
        If a field is not found, use null. Do not invent or estimate any values.

        Text: {text}

        Return only the JSON object, no markdown, no explanation.
        """

        try:
            client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
            ai_response = client.models.generate_content(model='gemini-1.5-flash', contents=prompt)
            raw = ai_response.text.strip().strip('```json').strip('```').strip()
            data = json.loads(raw)
        except Exception as e:
            return Response({'error': f'AI extraction failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(data, status=status.HTTP_200_OK)
