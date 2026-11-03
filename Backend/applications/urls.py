from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ApplicationViewSet, ExtractJobView

router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = router.urls + [
    path('extract-job/', ExtractJobView.as_view(), name='extract-job'),
]