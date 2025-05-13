from django.db import models
from django.conf import settings
from django.utils import timezone

# Create your models here.
class Conversation(models.Model):
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        verbose_name="participants"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="created at"
    )

    send_time = models.DateTimeField(
        auto_now=True,
        verbose_name="sent time"
    )
    
    class Meta:
        verbose_name = "Conversation"
        verbose_name_plural = "Conversation"
    
    def __str__(self):
        return f"Conversation {self.id}"


class Chat(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        verbose_name="Chat"
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="sender"
    )

    content = models.TextField(
        verbose_name="content"
    )

    send_time = models.DateTimeField(
        auto_now_add=True,
        verbose_name="sent time"
    )
    
    class Meta:
        verbose_name = "message"
        verbose_name_plural = "message"
    
    def __str__(self):
        return f"{self.sender} message in chat {self.conversation.id}"
