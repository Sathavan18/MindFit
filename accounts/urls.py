"""
URL routing for accounts app endpoints.
Maps URLs to their corresponding view functions for user authentication and profiles.
"""

from django.urls import path
from .views import RegisterView, UserProfileView, check_username, check_email

urlpatterns = [
    # User registration endpoint - creates new user account
    path('register/', RegisterView.as_view(), name='register'),
    # User profile endpoint - create/retrieve/update health profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    # Username availability checker - validates uniqueness during registration
    path('check-username/', check_username, name='check-username'),
    # Email availability checker - validates uniqueness during registration
    path('check-email/', check_email, name='check-email'),
]