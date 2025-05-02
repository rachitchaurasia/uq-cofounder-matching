from django.urls import path
from .views import UserProfileView

app_name = 'userprofile'

urlpatterns = [
    # URL for the current user's profile (GET to retrieve, PUT/PATCH to update)
    path('me/', UserProfileView.as_view(), name='profile-me'),
    # Add other profile-related URLs here if needed (e.g., public profile view?)
    # path('<int:user_id>/', PublicProfileView.as_view(), name='profile-public'),
]
