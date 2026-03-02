from django.db import models
from django.contrib.auth.models import User

class UserProfile (models.Model):
    # Django's User Model
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    #BMR calculation
    age = models.IntegerField()
    GENDER_CHOICES = [
        ('male', 'Male (assigned at birth)'),
        ('female', 'FEMALE (assigned at birth)')
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    weight = models.FloatField()
    height = models.IntegerField()
    ACTIVITY_CHOICES = [
        ('sedentary', 'Sedentary (little or no exercise)'),
        ('light', 'Lightly active (1-3 days/week)'),
        ('moderate', 'Moderately active (3-5 days/week)'),
        ('very', 'Very active (6-7 days/week)'),
        ('extra', 'Extra active (very intense exercise daily)'),
    ]
    activity_level = models.CharField(max_length=10, choices=ACTIVITY_CHOICES)
    bmr = models.FloatField()

    #Goals and Targets
    GOAL_CHOICES = [
        ('lose', 'Weight Loss'),
        ('gain', 'Weight Gain'),
        ('maintain', 'Maintain Weight')]
    goal = models.CharField(max_length=10, choices = GOAL_CHOICES) 
    target_date = models.DateField(blank=True, null=True)
    target_calories =  models.IntegerField()

    def __str__(self):
        return f"{self.user.username}'s profile"