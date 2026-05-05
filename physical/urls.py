from django.urls import path
from .views import WeightEntryListCreateView

urlpatterns = [
    # Weight entries endpoint - create and list weight entries
    path('weight/', WeightEntryListCreateView.as_view(), name='weight-entries'),
]