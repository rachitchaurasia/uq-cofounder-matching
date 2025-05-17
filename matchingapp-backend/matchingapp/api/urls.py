from django.urls import path
from .views import get_user, create_user, WebLoginView, WebLogoutView, CheckAuthStatusView, DashboardAnalyticsView

urlpatterns = [ 
    path('users/', get_user, name='get_user'),
    path('users/create/', create_user, name = 'create_user'),
    path('webadmin/login/', WebLoginView.as_view(), name='web_admin_login'),
    path('webadmin/logout/', WebLogoutView.as_view(), name='web_admin_logout'),
    path('webadmin/status/', CheckAuthStatusView.as_view(), name='web_admin_auth_status'),
    path('analytics/dashboard/', DashboardAnalyticsView.as_view(), name='dashboard_analytics'),
]   