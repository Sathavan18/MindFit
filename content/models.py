from django.db import models

class Article (models.Model):
    title = models.CharField(max_length=200)
    url = models.URLField()
    description = models.TextField(max_length=500, blank=True)

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

    min_anxiety_trigger = models.IntegerField(null=True, blank=True) 
    min_stress_trigger = models.IntegerField(null=True, blank=True)
    max_mood_trigger = models.IntegerField(null=True, blank=True)
    
    trigger_keywords = models.TextField(blank=True, help_text="Comma-separated keywords")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
