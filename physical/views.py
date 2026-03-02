from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import WeightEntry
from .serializers import WeightEntrySerializer

class WeightEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = WeightEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WeightEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)