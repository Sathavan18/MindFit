from django.db import models
from django.contrib.auth.models import User

class UserProfile (models.Model):
    # Link to Django's User Model
    # CASCADE so that if profile is deleted, user account is deleted
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # BMR calculation fields
    # User's age in years
    age = models.IntegerField()

    # Biological sex affects BMR formula
    GENDER_CHOICES = [
        ('male', 'Male (assigned at birth)'),
        ('female', 'FEMALE (assigned at birth)')
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    # Current weight in kilograms
    weight = models.FloatField()
    # Height in centimeters
    height = models.IntegerField()
    # Activity levels affect Total Daily Energy Expenditure (TDEE)
    ACTIVITY_CHOICES = [
        ('sedentary', 'Sedentary (little or no exercise)'),
        ('light', 'Lightly active (1-3 days/week)'),
        ('moderate', 'Moderately active (3-5 days/week)'),
        ('very', 'Very active (6-7 days/week)'),
        ('extra', 'Extra active (very intense exercise daily)'),
    ]
    # TDEE = BMR * activity multiplier
    activity_level = models.CharField(max_length=10, choices=ACTIVITY_CHOICES)
    #Calculated BMR stored for reference
    bmr = models.FloatField()

    #Goals and Targets
    GOAL_CHOICES = [
        ('lose', 'Weight Loss'),
        ('gain', 'Weight Gain'),
        ('maintain', 'Maintain Weight')]
    # Optional target date for achieving goal
    goal = models.CharField(max_length=10, choices = GOAL_CHOICES) 
    target_date = models.DateField(blank=True, null=True)
    # Lose = TDEE - 300, Gain = TDEE + 300, Maintain = TDEE
    target_calories =  models.IntegerField()

    def __str__(self):
        return f"{self.user.username}'s profile"