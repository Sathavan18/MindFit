from django.contrib import admin
from .models import JournalEntry, MoodRating, MeditationSession

# Register JournalEntry model for admin access
# Allows viewing and managing user journal entries
admin.site.register(JournalEntry)
# Register MoodRating model for admin access
# Allows viewing and managing mood/anxiety/stress ratings
admin.site.register(MoodRating)
# Register MeditationSession model for admin access
# Allows viewing and managing meditation session records
admin.site.register(MeditationSession)