from django.urls import path
from .views import RunMatchingView

# Create your tests here.

urlpatterns = [
    path('run/', RunMatchingView.as_view(), name='run-matching'),
]
