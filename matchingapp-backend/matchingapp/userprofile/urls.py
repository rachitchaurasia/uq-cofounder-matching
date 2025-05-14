from django.urls import path
from .views import UserProfileView, generate_stream_chat_token, PublicProfileView

app_name = 'userprofile'

urlpatterns = [
    # URL for the current user's profile (GET to retrieve, PUT/PATCH to update)
    path('me/', UserProfileView.as_view(), name='profile-me'),
    # Add other profile-related URLs here if needed (e.g., public profile view?)
    path('<int:user_id>/', PublicProfileView.as_view(), name='profile-public'),
    path('api/chat/token/', generate_stream_chat_token, name='stream-chat-token'),
]
