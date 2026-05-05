"""
API views for mental health tracking features.
Handles CRUD operations for journal entries, mood ratings, and meditation sessions.
"""
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import JournalEntry, MoodRating, MeditationSession
from .serializers import JournalEntrySerializer, MoodRatingSerializer, MeditationSessionSerializer

class JournalEntryListCreateView(generics.ListCreateAPIView):
    """
    API endpoint for journal entry management.
    Lists all journal entries for authenticated user (most recent first).
    Creates new journal entries linked to authenticated user.
    """
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Returns only journal entries belonging to the authenticated user
        return JournalEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Automatically links new journal entry to user
        serializer.save(user=self.request.user)

class MoodRatingListCreateView(generics.ListCreateAPIView):
    """
    API endpoint for mood rating management.
    Lists all mood ratings for authenticated user (most recent first).
    Creates new mood ratings linked to authenticated user.
    """
    serializer_class = MoodRatingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return only mood ratings belonging to the authenticated user
        return MoodRating.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Automatically link new mood rating to user
        serializer.save(user=self.request.user)

class MeditationSessionListCreateView(generics.ListCreateAPIView):
    """
    API endpoint for meditation session management.
    Lists all meditation sessions for authenticated user (most recent first).
    Creates new meditation sessions linked to authenticated user.
    """

    serializer_class = MeditationSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return only meditation sessions belonging to the authenticated user
        return MeditationSession.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Automatically link new meditation session to authenticated user
        serializer.save(user=self.request.user)