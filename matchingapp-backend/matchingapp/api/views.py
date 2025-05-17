from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .serializer import UserSerializer
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Avg, Case, When, IntegerField, Q
from userprofile.models import UserProfile

User = get_user_model()

# Create your views here.
@api_view(['GET'])  
def get_user(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

#@csrf_exempt
@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        User.objects.create_user(
            username = serializer.data['username'],
            email = serializer.data['email'],
            password = serializer.data['password']
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WebLoginView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request, *args, **kwargs):
        return Response({"message": "Please POST your credentials."}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.is_active:
                login(request, user)
                return Response({
                    'success': True, 
                    'message': 'Login successful.',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'is_superuser': user.is_superuser 
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'This account is inactive.'}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

class WebLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response({'success': True, 'message': 'Logout successful.'}, status=status.HTTP_200_OK)

class CheckAuthStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({
            'isAuthenticated': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_superuser': user.is_superuser
            }
        }, status=status.HTTP_200_OK)

class DashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        total_users = User.objects.count()

        seven_days_ago = timezone.now() - timedelta(days=7)
        new_users_last_7_days = User.objects.filter(date_joined__gte=seven_days_ago).count()
        
        essential_profile_fields = [
            'about', 'city', 'region', 'position', 'current_company_name', 
            'skills', 'interests', 'startup_industries', 'role', 'looking_for'
        ]
        
        profiles = UserProfile.objects.all()
        total_profiles = profiles.count()
        completed_profiles_count = 0
        completion_percentages = []

        if total_profiles > 0:
            for profile in profiles:
                filled_fields = 0
                for field_name in essential_profile_fields:
                    if getattr(profile, field_name, None):
                        filled_fields += 1
                
                completion_percentage = (filled_fields / len(essential_profile_fields)) * 100 if len(essential_profile_fields) > 0 else 0
                completion_percentages.append(completion_percentage)
                if completion_percentage >= 100:
                    completed_profiles_count += 1
            
            average_profile_completion = sum(completion_percentages) / len(completion_percentages) if completion_percentages else 0
        else:
            average_profile_completion = 0

        users_by_region = UserProfile.objects.filter(region__isnull=False).exclude(region__exact='') \
            .values('region') \
            .annotate(count=Count('id')) \
            .order_by('-count')[:5]

        users_by_role = UserProfile.objects.filter(role__isnull=False).exclude(role__exact='') \
            .values('role') \
            .annotate(count=Count('id')) \
            .order_by('-count')[:5]

        data = {
            'total_users': total_users,
            'new_users_last_7_days': new_users_last_7_days,
            'average_profile_completion': round(average_profile_completion, 2),
            'fully_completed_profiles': completed_profiles_count,
            'total_profiles_with_data': total_profiles,
            'users_by_region': list(users_by_region),
            'users_by_role': list(users_by_role),
        }
        return Response(data, status=status.HTTP_200_OK)
