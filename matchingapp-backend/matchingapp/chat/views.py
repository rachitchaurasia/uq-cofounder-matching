from django.shortcuts import render
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from stream_chat import StreamChat

# Initialize Stream Chat client with API key and secret
stream_client = StreamChat(api_key='6wdyjtcp4ssp', 
                         api_secret='hfa5ad5wt2w8ks2w8ufjffhhawzdm74fxzm43kk9gqpe9bjn7bkuyn5c7mg4mn9u')

class StreamChatTokenView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Create/update the user in Stream Chat
        stream_client.upsert_user({
            "id": str(user.id),
            "name": f"{user.first_name} {user.last_name}".strip() or user.username,
            "email": user.email,
        })
        
        # Generate token for the user
        token = stream_client.create_token(str(user.id))
        
        return Response({
            "token": token,
            "api_key": '6wdyjtcp4ssp',
            "user_id": str(user.id)
        })

class CreateChatChannelView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        current_user_id = str(request.user.id)
        other_user_id = request.data.get('user_id')
        
        if not other_user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert to string if it's not already
        other_user_id = str(other_user_id)
        
        # Sort IDs to ensure consistent channel naming
        member_ids = sorted([current_user_id, other_user_id])
        channel_id = f"messaging_{'_'.join(member_ids)}"
        
        try:
            # Create a messaging channel between the two users
            channel = stream_client.channel('messaging', channel_id, {
                'members': member_ids,
                'created_by_id': current_user_id
            })
            
            # Create the channel
            response = channel.create()
            
            return Response({
                "channel_id": channel_id,
                "channel_type": "messaging",
                "members": member_ids
            })
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
