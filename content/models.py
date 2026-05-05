"""
Article model for storing health and wellness resource links.
Supports personalized recommendations based on mood data and journal keywords.
"""
from django.db import models

class Article (models.Model):
    """
    Article represents a health/wellness resource (external link).
    Articles can be recommended to users based on:
    1. Mood triggers: anxiety/stress/mood thresholds
    2. Journal keywords: text matching from journal entries
    """
    # Article title
    title = models.CharField(max_length=200)
    # External link to article
    url = models.URLField()
    # Brief summary of article
    description = models.TextField(max_length=500, blank=True)

    # Article category for filtering and organisation
    CATEGORY_CHOICES = [
        ('anxiety', 'Anxiety Management'),
        ('stress', 'Stress Relief'),
        ('mood', 'Mood Improvement'),
        ('exercise', 'Physical Activity'),
        ('nutrition', 'Healthy Eating'),
        ('sleep', 'Sleep Quality'),
        ('mindfulness', 'Mindfulness & Meditation'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    # These fields determine when articles are recommended to users

    # Article recommended if user's anxiety level >= this value (1-10 scale)
    min_anxiety_trigger = models.IntegerField(null=True, blank=True)
    # Article recommended if user's stress level >= this value (1-10 scale)
    min_stress_trigger = models.IntegerField(null=True, blank=True)
    # Article recommended if user's overall mood <= this value (1-5 scale)
    max_mood_trigger = models.IntegerField(null=True, blank=True)
    
    # Keyword-based triggers, matched against jorunal text
    trigger_keywords = models.TextField(blank=True, help_text="Comma-separated keywords")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
