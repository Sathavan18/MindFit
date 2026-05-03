from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=2000)
    date = models.DateField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.date}"

class MoodRating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)
    ANXIETY_CHOICES = [
        (1, 'Not Anxious At All'),
        (2, 'Not Anxious'),
        (3, 'Slightly Anxious'),
        (4, 'Somewhat Anxious'),
        (5, 'Anxious'),
        (6, 'Moderately Anxious'),
        (7, 'Quite Anxious'),
        (8, 'Very Anxious'),
        (9, 'Super Anxious'),
        (10, 'Extremely Anxious'),
    ]
    anxiety_level = models.IntegerField(choices=ANXIETY_CHOICES)

    STRESS_CHOICES = [
        (1, 'Not Stressed At All'),
        (2, 'Not Stressed'),
        (3, 'Slightly Stressed'),
        (4, 'Somewhat Stressed'),
        (5, 'Stressed'),
        (6, 'Moderately Stressed'),
        (7, 'Quite Stressed'),
        (8, 'Very Stressed'),
        (9, 'Super Stressed'),
        (10, 'Extremely Stressed'),
    ]

    stress_level = models.IntegerField(choices=STRESS_CHOICES)
    OVERALL_MOOD_CHOICES = [
        (1, 'Poor'),
        (2, 'Somewhat Poor'),
        (3, 'Okay'),
        (4, 'Somewhat Happy'),
        (5, 'Happy'),
    ]
    overall_mood = models.IntegerField(choices=OVERALL_MOOD_CHOICES)
    
    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.date}"
class MeditationSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    duration = models.IntegerField()

    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.username} - {self.date}"