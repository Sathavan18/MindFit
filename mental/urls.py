"""
URL routing for mental health tracking endpoints.
Maps URLs to views for journal entries, mood ratings, and meditation sessions.
"""
from django.urls import path
from .views import JournalEntryListCreateView, MoodRatingListCreateView, MeditationSessionListCreateView

urlpatterns = [
    # Journal entries endpoint - create and list journal entries
    path('journal/', JournalEntryListCreateView.as_view(), name='journal-entries'),
    # Mood ratings endpoint - create and list mood ratings
    path('mood/', MoodRatingListCreateView.as_view(), name='mood-ratings'),
    # Meditation sessions endpoint - create and list meditation sessions
    path('meditation/', MeditationSessionListCreateView.as_view(), name='meditation-sessions'),
]