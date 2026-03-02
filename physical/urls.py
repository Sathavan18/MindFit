from django.urls import path
from .views import WeightEntryListCreateView

urlpatterns = [
    path('weight/', WeightEntryListCreateView.as_view(), name='weight-entries'),
]