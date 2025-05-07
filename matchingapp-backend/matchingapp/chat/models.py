from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from django.utils import timezone

# Create your models here.
class Conversation(models.Model):
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations',
        verbose_name="participants"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created at"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Last active time"
    )
    
    class Meta:
        verbose_name = "Conversation"
        verbose_name_plural = "Conversation"
    
    def __str__(self):
        return f"Conversation {self.id}"
