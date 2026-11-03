from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UserProfile(models.Model):
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=200) 
    image = models.ImageField(upload_to='profile_images/', blank=True)
    
    def __str__(self):
        return self.title