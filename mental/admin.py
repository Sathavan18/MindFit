from django.contrib import admin
from .models import JournalEntry, MoodRating, MeditationSession

admin.site.register(JournalEntry)
admin.site.register(MoodRating)
admin.site.register(MeditationSession)