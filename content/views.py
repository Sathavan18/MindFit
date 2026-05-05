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
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommended_articles(request):
    """
    Get article recommendations based on:
    1. Keywords from recent journal entries (HIGHEST PRIORITY)
    2. Mood rating triggers (SECOND PRIORITY - sorted by severity)
    
    Maximum 3 recommendations returned.
    """
    user = request.user
    recommended_articles = []  # List of tuples: (article, priority, reason)
    
    # 1. KEYWORD-BASED RECOMMENDATIONS (HIGHEST PRIORITY)
    try:
        # Get recent journal entries (last 7 days)
        week_ago = timezone.now().date() - timedelta(days=7)
        recent_journals = JournalEntry.objects.filter(
            user=user,
            date__gte=week_ago
        ).order_by('-date')[:5]  # Last 5 entries
        
        if recent_journals:
            # Combine all journal text
            journal_text = ' '.join([entry.content.lower() for entry in recent_journals])
            
            # Get all articles with keywords
            articles_with_keywords = Article.objects.exclude(trigger_keywords='')
            
            for article in articles_with_keywords:
                if not article.trigger_keywords:
                    continue
                
                # Split comma-separated keywords
                keywords = [kw.strip().lower() for kw in article.trigger_keywords.split(',') if kw.strip()]
                
                # Check if any keyword appears in journal text
                for keyword in keywords:
                    # Use word boundary to match whole words only
                    pattern = r'\b' + re.escape(keyword) + r'\b'
                    if re.search(pattern, journal_text):
                        recommended_articles.append((
                            article,
                            1,  # Priority 1 (highest)
                            f"Mentioned '{keyword}' in your journal"
                        ))
                        break  # One keyword match is enough
    
    except Exception as e:
        print(f"Error processing journal keywords: {e}")
    
    # 2. MOOD-BASED RECOMMENDATIONS (SECOND PRIORITY)
    try:
        recent_mood = MoodRating.objects.filter(user=user).order_by('-date').first()
        
        if recent_mood:
            # Find articles with mood triggers
            mood_articles = Article.objects.all()
            
            for article in mood_articles:
                # Skip if already recommended by journal keywords
                if any(art[0].id == article.id for art in recommended_articles):
                    continue
                
                # Check anxiety trigger
                if article.min_anxiety_trigger and recent_mood.anxiety_level >= article.min_anxiety_trigger:
                    # Priority based on how much above threshold
                    severity = recent_mood.anxiety_level - article.min_anxiety_trigger
                    recommended_articles.append((
                        article,
                        2 + (10 - severity),  # Priority 2-12 (lower number = higher priority)
                        f"Your anxiety level is {recent_mood.anxiety_level}"
                    ))
                    continue  # Don't check other triggers for this article
                
                # Check stress trigger
                if article.min_stress_trigger and recent_mood.stress_level >= article.min_stress_trigger:
                    severity = recent_mood.stress_level - article.min_stress_trigger
                    recommended_articles.append((
                        article,
                        2 + (10 - severity),
                        f"Your stress level is {recent_mood.stress_level}"
                    ))
                    continue
                
                # Check mood trigger (low mood)
                if article.max_mood_trigger and recent_mood.overall_mood <= article.max_mood_trigger:
                    severity = article.max_mood_trigger - recent_mood.overall_mood
                    recommended_articles.append((
                        article,
                        2 + (10 - severity),
                        f"Your mood level is {recent_mood.overall_mood}"
                    ))
    
    except Exception as e:
        print(f"Error processing mood triggers: {e}")
    
    # 3. SORT BY PRIORITY AND LIMIT TO 3
    recommended_articles.sort(key=lambda x: x[1])  # Sort by priority (lower number = higher priority)
    top_3 = recommended_articles[:3]  # Take top 3
    
    # 4. PREPARE RESPONSE
    if top_3:
        # Get just the article objects
        articles_to_return = [art[0] for art in top_3]
        reasons = {art[0].id: art[2] for art in top_3}
        
        serializer = ArticleSerializer(articles_to_return, many=True)
        
        # Add recommendation reasons
        articles_data = serializer.data
        for article in articles_data:
            article['recommendation_reason'] = reasons.get(article['id'], '')
        
        return Response({
            'count': len(articles_data),
            'articles': articles_data
        })
    else:
        return Response({
            'count': 0,
            'articles': []
        })