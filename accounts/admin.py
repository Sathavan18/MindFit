from django.contrib import admin
from .models import UserProfile

# Register UserProfile model to make it accessible
# in Django admin panel
# Allows admin to view and manage user profiles
admin.site.register(UserProfile)