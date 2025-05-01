from django.contrib import admin
from .models import UserProfile

# Register your models here.

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'city', 'country_code', 'position', 'updated_at') # Fields to show in the list view
    search_fields = ('user__email', 'user__username', 'city', 'country_code', 'position') # Enable searching by these fields
    list_filter = ('country_code', 'city', 'experience_level') # Add filters to the sidebar
    readonly_fields = ('created_at', 'updated_at') # Make timestamps read-only

    fieldsets = (
        (None, {'fields': ('user',)}),
        ('Location', {'fields': ('city', 'region', 'country_code')}),
        ('Professional', {'fields': ('position', 'current_company_name', 'experience_details', 'experience_level')}),
        # Add other sections as needed
    )
