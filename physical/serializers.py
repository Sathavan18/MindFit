"""
Serializer for physical health tracking model.
Converts weight entries to/from JSON for API communication.
"""
from rest_framework import serializers
from .models import WeightEntry

class WeightEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for WeightEntry model.
    Handles weight, calorie intake, and date fields.
    """
    class Meta:
        model = WeightEntry
        fields = '__all__'
        read_only_fields = ['user']