from django.db import models
from django.contrib.auth.models import User

# Create your models here.



class Application(models.Model):

    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ('Interview', 'Interview'),
        ('Pending', 'Pending'),
        ('Declined', 'Declined'),
        ('Offer', 'Offer'),
    ]
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )
    application_date = models.DateField()
    url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    job_description = models.TextField(blank=True)

    def __str__(self):
        return self.title