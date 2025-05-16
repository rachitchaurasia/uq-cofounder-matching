from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    # Fields from CSV (adjust types and null/blank as needed)
    # Basic Info
    city = models.CharField(max_length=100, blank=True, null=True)
    country_code = models.CharField(max_length=10, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    avatar = models.URLField(max_length=500, blank=True, null=True) # Or ImageField if storing locally
    url = models.URLField(max_length=500, blank=True, null=True) # LinkedIn URL?

    # Professional Info
    position = models.CharField(max_length=255, blank=True, null=True)
    current_company_name = models.CharField(max_length=255, blank=True, null=True)
    current_company_id = models.CharField(max_length=100, blank=True, null=True) # Assuming this is an external ID
    # 'experience' could be text, or structured data (JSONField, or separate models)
    experience_details = models.TextField(blank=True, null=True, help_text="Detailed work experience")
    experience_level = models.CharField(max_length=50, blank=True, null=True) # e.g., Entry, Mid, Senior

    # Education
    education_summary = models.CharField(max_length=255, blank=True, null=True, help_text="e.g., BSc Computer Science")
    education_details = models.TextField(blank=True, null=True, help_text="Detailed education history")

    # Skills & Interests
    skills = models.TextField(blank=True, null=True, help_text="Comma-separated skills or JSON")
    skill_categories = models.TextField(blank=True, null=True, help_text="Comma-separated or JSON")
    languages = models.CharField(max_length=255, blank=True, null=True, help_text="e.g., English, Spanish")
    interests = models.TextField(blank=True, null=True, help_text="General interests")
    startup_industries = models.TextField(blank=True, null=True, help_text="Industries of interest for startups")
    startup_goals = models.TextField(blank=True, null=True)

    # Other (consider if needed or how to represent)
    certifications = models.TextField(blank=True, null=True)
    courses = models.TextField(blank=True, null=True)
    recommendations_count = models.PositiveIntegerField(default=0)
    volunteer_experience = models.TextField(blank=True, null=True)

    #  Fields from Onboarding ---
    role = models.CharField(max_length=100, blank=True, null=True) 
    show_role_on_profile = models.BooleanField(default=False)
    looking_for = models.TextField(blank=True, null=True)
    offers = models.TextField(blank=True, null=True, help_text="Comma-separated things user can offer") # From OfferScreen
    
    # Add this field to your UserProfile model
    phone = models.CharField(max_length=20, blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.email or self.user.username}"

# Signal receiver to automatically create/update UserProfile when User is created/saved
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    try:
        # Avoid recursive save loop if profile update triggered user save
        if hasattr(instance, '_profile_saved'):
            return
        instance.profile.save()
    except UserProfile.DoesNotExist:
         # If profile doesn't exist (e.g., for users created before this signal was added), create it.
         UserProfile.objects.create(user=instance)
