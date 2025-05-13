from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.management import call_command
from io import StringIO
import sys

class RunMatchingView(APIView):
    """
    API endpoint that runs the matching algorithm for the current user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, format=None):
        # Get the user ID from the request
        user_id = request.user.id
        
        # Capture the command output
        out = StringIO()
        sys.stdout = out
        
        try:
            # Call the command with the user ID
            call_command('run_matching', user_id)
            sys.stdout = sys.__stdout__  # Reset stdout
            
            # Extract results from the command output
            output = out.getvalue()
            
            # Return success response
            return Response({
                'message': 'Matching algorithm executed successfully',
                'output': output
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            sys.stdout = sys.__stdout__  # Reset stdout
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
