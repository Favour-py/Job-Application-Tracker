from django.conf import settings
import os
from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import UserProfile
from .serializers import UserProfileSerializer, RegisterSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
# Create your views here.

User = get_user_model()


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()

        if user:
            uid_value = urlsafe_base64_encode(force_bytes(user.pk))
            uid = uid_value.decode() if isinstance(uid_value, bytes) else uid_value
            token = default_token_generator.make_token(user)
            uid_for_url = uid.rstrip('=')
            reset_link = f"{os.getenv('FRONTEND_URL', 'http://192.168.1.122:5173')}/reset-password?uid={uid_for_url}&token={token}"
            print("RAW RESET LINK:", reset_link)
            print("RAW RESET LINK repr:", repr(reset_link))

            try:
                send_mail(
                    subject='Reset your password',
                    message=f'Use this link to reset your password: {reset_link}',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
            except Exception as exc:
                print(f"Password reset email failed for {email}: {exc}")
                return Response({
                    'error': 'Unable to send password reset email right now. Please try again later.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'message': 'If an account with that email exists, a password reset link has been sent.'
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    def post(self, request):
        data = request.data.copy()
        if 'uid' not in data and 'ui' in data:
            data['uid'] = data['ui']

        serializer = PasswordResetConfirmSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']

        try:
            uid_with_padding = uid + '=' * (-len(uid) % 4)
            user_id = urlsafe_base64_decode(uid_with_padding).decode()
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)
    
class LoginView(APIView):
    
    @swagger_auto_schema(
        request_body=TokenObtainPairSerializer
    )

    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)

        if serializer.is_valid():
            refresh = serializer.validated_data['refresh']
            access = serializer.validated_data['access']

            response = Response({
                'access': access
            })

            is_production = not settings.DEBUG
            response.set_cookie(
                key='refresh_token',
                value=refresh,
                httponly=True,
                samesite='None' if is_production else 'Lax',
                path='/',
                secure=is_production,
            )

            return response

        return Response(
            serializer.errors,
            status=status.HTTP_401_UNAUTHORIZED
        )
        
class RefreshTokenView(APIView):

    def post(self, request):
        refresh = request.COOKIES.get("refresh_token")

        if not refresh:
            return Response(
                {"error": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        try:
            refresh_token = RefreshToken(refresh)
            access = refresh_token.access_token
            
            return Response({
                "access": str(access)
            })
            
        except TokenError:
            return Response(
                {"error": "Refresh token is invalid or expired."},
                status=status.HTTP_401_UNAUTHORIZED
            )

class LogoutView(APIView):
    def post(self, request):
        refresh = request.COOKIES.get("refresh_token")
        if refresh:
            try:
                token = RefreshToken(refresh)
                token.blacklist()
            except TokenError:
                pass
        response = Response({"message": "Logged out successfully."})
        is_production = not settings.DEBUG
        response.delete_cookie("refresh_token", samesite="None" if is_production else "Lax", path="/")
        return response