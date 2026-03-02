from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import JournalEntry, MoodRating, MeditationSession
from .serializers import JournalEntrySerializer, MoodRatingSerializer, MeditationSessionSerializer

class JournalEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MoodRatingListCreateView(generics.ListCreateAPIView):
    serializer_class = MoodRatingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MoodRating.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MeditationSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = MeditationSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MeditationSession.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)