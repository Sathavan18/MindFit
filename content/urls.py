from django.urls import path
from . import views

urlpatterns = [
    # List all articles - used for browsing by category
    path('articles/', views.ArticleListView.as_view(), name='article-list'),
    # Get personalised article recommendations based on mood ratings and journal keywords
    path('recommended/', views.get_recommended_articles, name='recommended-articles'),
]