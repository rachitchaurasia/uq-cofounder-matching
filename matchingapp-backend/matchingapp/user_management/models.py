from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):
    class UserType(models.TextChoices):
        VENTRUE = 'Venture', 'venture'
        COFOUNDER = 'Co-founder', 'co-founder'
        ADMIN = 'Admin', 'admin'

    user_type = models.CharField(
        max_length=10,
        choices=UserType.choices,
        default=UserType.COFOUNDER,
        verbose_name="User Type"
    )

    created_time = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date Created"
    )

    last_active = models.DateTimeField(
        auto_now=True,
        verbose_name="Last Active"
    )

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "User"
    
    def __str__(self):
        return f"{self.username}, {self.user_type}"