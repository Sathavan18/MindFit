from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    """
    Serializer for Article model.
    Handles all article fields including title, URL, category, and recommendation triggers.
    Used by both article listing and recommendation endpoints.
    """
    class Meta:
        model = Article
        fields = '__all__'