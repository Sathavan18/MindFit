from django.contrib import admin
from .models import Article

# Register Article model to make it accessible
# in Django admin panel
# Allows admin to set mood and keyword for article recommendations
admin.site.register(Article)