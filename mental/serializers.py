"""
Serializers for mental health tracking models.
Converts journal entries, mood ratings, and meditation sessions to/from JSON.
"""
from rest_framework import serializers
from .models import JournalEntry, MoodRating, MeditationSession

class JournalEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for JournalEntry model.
    Handles journal content and date fields.
    """
    class Meta:
        model = JournalEntry
        fields = '__all__'
        read_only_fields = ['user']

class MoodRatingSerializer(serializers.ModelSerializer):
    """
    Serializer for MoodRating model.
    Handles anxiety, stress, and overall mood ratings with date.
    """
    class Meta:
        model = MoodRating
        fields = '__all__'
        read_only_fields = ['user']

class MeditationSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for MeditationSession model.
    Handles meditation duration and date fields.
    """
    class Meta:
        model = MeditationSession
        fields = '__all__'
        read_only_fields = ['user']