from django.urls import path
from . import views

urlpatterns = [
    path('articles/', views.ArticleListView.as_view(), name='article-list'),
    path('recommended/', views.get_recommended_articles, name='recommended-articles'),
]