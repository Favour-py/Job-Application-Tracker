from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import UserProfileViewSet, RegisterView, LoginView, RefreshTokenView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView



router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')

urlpatterns = router.urls + [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
    path("logout/", LogoutView.as_view(), name="logout"),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]