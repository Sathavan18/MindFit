from django.db import models
from django.contrib.auth.models import User

class WeightEntry (models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    weight = models.FloatField()
    date = models.DateField(auto_now_add=True)
    calorie_intake = models.IntegerField()

    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.username} - {self.weight}kg on {self.date}"
