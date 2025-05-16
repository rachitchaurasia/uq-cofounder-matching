from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import UserProfile
from .serializers import UserProfileSerializer
import hmac
import hashlib
import time
import json
from django.http import JsonResponse
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_stream_chat_token(request):
    """Generate a Stream Chat token for the current user"""
    user = request.user
    
    # Extract data from request
    data = json.loads(request.body)
    user_id = data.get('user_id', str(user.id))
    
    # Stream Chat credentials
    api_key = '6wdyjtcp4ssp'
    api_secret = 'hfa5ad5wt2w8ks2w8ufjffhhawzdm74fxzm43kk9gqpe9bjn7bkuyn5c7mg4mn9u'
    
    # Token payload
    header = {'alg': 'HS256', 'typ': 'JWT'}
    payload = {
        'user_id': user_id,
        'iat': int(time.time()),  # issued at time
        'exp': int(time.time() + 60 * 60),  # expiration time: 1 hour
    }
    
    # Convert to JSON strings and encode
    header_bytes = json.dumps(header).encode('utf-8')
    payload_bytes = json.dumps(payload).encode('utf-8')
    
    # Base64 encode
    import base64
    header_base64 = base64.urlsafe_b64encode(header_bytes).rstrip(b'=').decode('utf-8')
    payload_base64 = base64.urlsafe_b64encode(payload_bytes).rstrip(b'=').decode('utf-8')
    
    # Create signature
    signature_message = f"{header_base64}.{payload_base64}"
    signature = hmac.new(
        api_secret.encode('utf-8'),
        signature_message.encode('utf-8'),
        hashlib.sha256
    ).digest()
    signature_base64 = base64.urlsafe_b64encode(signature).rstrip(b'=').decode('utf-8')
    
    # Combine to form token
    token = f"{header_base64}.{payload_base64}.{signature_base64}"
    
    return JsonResponse({'token': token})

class PublicProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            profile = UserProfile.objects.get(user_id=user_id)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)
