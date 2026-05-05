"""
API views for physical health tracking features.
Handles CRUD operations for weight entries with calorie intake.
"""
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import WeightEntry
from .serializers import WeightEntrySerializer

class WeightEntryListCreateView(generics.ListCreateAPIView):
    """
    API endpoint for weight entry management.
    Lists all weight entries for authenticated user (most recent first).
    Creates new weight entries linked to authenticated user.
    """
    serializer_class = WeightEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return only weight entries belonging to the authenticated user
        return WeightEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Automatically link new weight entry to authenticated user
        serializer.save(user=self.request.user)