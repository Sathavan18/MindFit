from django.urls import path
from .views import RegisterView, UserProfileView, check_username, check_email

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('check-username/', check_username, name='check-username'),
    path('check-email/', check_email, name='check-email'),
]