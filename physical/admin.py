from django.contrib import admin
from .models import WeightEntry

# Register WeightEntry model for admin access
# Allows viewing and managing user weight tracking entries
admin.site.register(WeightEntry)
