from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import UserProfile
from .serializers import UserProfileSerializer

# Create your views here.

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for retrieving and updating the profile
    of the currently authenticated user.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated] # Must be logged in

    def get_object(self):
        """
        Override to return the profile associated with the request.user.
        Handles potential Profile.DoesNotExist cases gracefully.
        """
        try:
            # The related_name='profile' in the OneToOneField allows this lookup
            return self.request.user.profile
        except UserProfile.DoesNotExist:
            # This case should be rare due to the signal handler,
            # but good to handle defensively.
            # Option 1: Return 404 (uncomment below)
            # from django.http import Http404
            # raise Http404("Profile not found for this user.")
            # Option 2: Create profile on the fly (ensure signal works properly first)
            profile = UserProfile.objects.create(user=self.request.user)
            return profile

    def get_queryset(self):
        """
        Required by DRF, but get_object handles the actual instance retrieval.
        Just return all profiles, filtered implicitly by get_object.
        """
        return UserProfile.objects.all()
