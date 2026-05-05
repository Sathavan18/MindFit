"""
API views for article listing and personalised recommendations.
Implements dual recommendation system using mood data and journal text analysis.
"""
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Article
from .serializers import ArticleSerializer
from mental.models import MoodRating, JournalEntry
from datetime import timedelta
from django.utils import timezone
import re


class ArticleListView(generics.ListAPIView):
    """
    API endpoint to retrieve all articles.
    Used for browsing articles by category on the frontend.
    """
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    # Must be logged in to view articles
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommended_articles(request):
    """
    Get personalised article recommendations using a dual-trigger system.
    
    Recommendation logic:
    1. Keyword-based (HIGHEST PRIORITY): Matches journal text against article keywords
    2. Mood-based (SECOND PRIORITY): Matches mood ratings against article thresholds
    
    Prioritisation logic:
    - Priority 1: Journal keyword matches (qualitative data)
    - Priority 2-12: Mood threshold matches (quantitative data, sorted by severity)
    
    Returns a maximum of 3 recommendations ordered by priority.
    """
    user = request.user
    recommended_articles = []  # List of tuples: (article, priority, reason)
    
    # Analyse recent journal entries for keyword matches
    try:
        # Get recent journal entries (last 7 days, most recent 5 entries)
        week_ago = timezone.now().date() - timedelta(days=7)
        recent_journals = JournalEntry.objects.filter(
            user=user,
            date__gte=week_ago).order_by('-date')[:5]
        
        if recent_journals:
            # Combine all journal text into single string for analysis
            journal_text = ' '.join([entry.content.lower() for entry in recent_journals])
            
            # Get all articles with trigger keywords defined
            articles_with_keywords = Article.objects.exclude(trigger_keywords='')
            
            for article in articles_with_keywords:
                if not article.trigger_keywords:
                    continue
                
                # Split comma-separated keywords and make into lowercase, no whitespace
                keywords = [kw.strip().lower() for kw in article.trigger_keywords.split(',') if kw.strip()]
                
                # Check if any keyword appears in journal text
                for keyword in keywords:
                    # Use word boundary to match whole words only
                    # This prevent partial matches like work in workout
                    pattern = r'\b' + re.escape(keyword) + r'\b'
                    if re.search(pattern, journal_text):
                        recommended_articles.append((
                            article,
                            1,
                            f"Mentioned '{keyword}' in your journal"
                        ))
                        break  # One keyword match is enough per article
    
    except Exception as e:
        print(f"Error processing journal keywords: {e}")
    
    # Mood Based Recommendations
    try:
        # Get user's most recent mood rating
        recent_mood = MoodRating.objects.filter(user=user).order_by('-date').first()
        
        if recent_mood:
            # Find articles with mood triggers
            mood_articles = Article.objects.all()
            
            for article in mood_articles:
                # Skip if already recommended by journal keywords
                if any(art[0].id == article.id for art in recommended_articles):
                    continue
                
                # Check anxiety trigger threshold
                if article.min_anxiety_trigger and recent_mood.anxiety_level >= article.min_anxiety_trigger:
                    # Priority based on how much above threshold
                    # More above threshold, higher priority
                    severity = recent_mood.anxiety_level - article.min_anxiety_trigger
                    recommended_articles.append((
                        article,
                        2 + (10 - severity),  # Priority 2-12 (lower number = higher priority)
                        f"Your anxiety level is {recent_mood.anxiety_level}"
                    ))
                    continue  # Don't check other triggers for this article
                
                # Check stress trigger threshold
                if article.min_stress_trigger and recent_mood.stress_level >= article.min_stress_trigger:
                    severity = recent_mood.stress_level - article.min_stress_trigger
                    recommended_articles.append((
                        article,
                        2 + (10 - severity),
                        f"Your stress level is {recent_mood.stress_level}"
                    ))
                    continue
                
                # Check mood trigger threshold
                if article.max_mood_trigger and recent_mood.overall_mood <= article.max_mood_trigger:
                    severity = article.max_mood_trigger - recent_mood.overall_mood
                    recommended_articles.append((
                        article,
                        2 + (10 - severity),
                        f"Your mood level is {recent_mood.overall_mood}"
                    ))
    
    except Exception as e:
        print(f"Error processing mood triggers: {e}")
    
    # Sort by priority (lower number = higher priority)
    recommended_articles.sort(key=lambda x: x[1])
    # Take top 3 
    top_3 = recommended_articles[:3]
    
    # Prepare JSON response
    if top_3:
        # Extract article objects and reasons from tuples
        articles_to_return = [art[0] for art in top_3]
        reasons = {art[0].id: art[2] for art in top_3}
        
        #Serialise articles to JSON
        serializer = ArticleSerializer(articles_to_return, many=True)
        
        # Add recommendation reason to each article
        articles_data = serializer.data
        for article in articles_data:
            article['recommendation_reason'] = reasons.get(article['id'], '')
        
        return Response({
            'count': len(articles_data),
            'articles': articles_data
        })
    else:
        # No recommendations found
        return Response({
            'count': 0,
            'articles': []
        })