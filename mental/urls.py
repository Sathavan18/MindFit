from django.urls import path
from .views import JournalEntryListCreateView, MoodRatingListCreateView, MeditationSessionListCreateView

urlpatterns = [
    path('journal/', JournalEntryListCreateView.as_view(), name='journal-entries'),
    path('mood/', MoodRatingListCreateView.as_view(), name='mood-ratings'),
    path('meditation/', MeditationSessionListCreateView.as_view(), name='meditation-sessions'),
]