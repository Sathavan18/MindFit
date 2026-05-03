from rest_framework import serializers
from .models import JournalEntry, MoodRating, MeditationSession

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = '__all__'
        read_only_fields = ['user', 'date']

class MoodRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodRating
        fields = '__all__'
        read_only_fields = ['user', 'date']

class MeditationSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeditationSession
        fields = '__all__'
        read_only_fields = ['user', 'date']