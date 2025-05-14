from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# Sample view that could be used if we need to expose any chat functionality via Django
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def message_list(request):
    """
    Placeholder for message list view.
    Since we're using Supabase for real-time messaging, this endpoint isn't needed.
    """
    return JsonResponse({
        'message': 'Chat functionality is handled by Supabase'
    })
