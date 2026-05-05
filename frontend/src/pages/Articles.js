import { useState, useEffect } from 'react';
import api from '../services/api';
import { Lightbulb } from 'lucide-react';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Fetch all articles and personalized recommendations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all available articles
        const articlesResponse = await api.get('content/articles/');
        setArticles(articlesResponse.data);

        // Get personalized recommendations based on mood and journal keywords
        const recommendedResponse = await api.get('content/recommended/');
        setRecommendedArticles(recommendedResponse.data.articles || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading articles:', error);
        setError('Failed to load articles');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Available article categories for filtering
  const categories = [
    { value: 'all', label: 'All Articles' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'stress', label: 'Stress' },
    { value: 'mood', label: 'Mood' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'mindfulness', label: 'Mindfulness' },
  ];

  // Filter articles by selected category
  const filteredArticles = activeCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === activeCategory);

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center">
          <p className="text-muted">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-wide">
      <h1 className="mb-40">Health Resources</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Personalized recommendations section (shown only if there are recommendations) */}
      {recommendedArticles.length > 0 && (
        <div className="articles-recommendations">
          <div className="articles-recommendations-banner">
            <h2>
              <Lightbulb className="inline-icon" />
              Recommended For You
            </h2>
            <p>Based on your recent mood and journal entries</p>
          </div>

          {/* Grid of recommended articles with special highlighting */}
          <div className="articles-grid">
            {recommendedArticles.map((article) => (
              <div key={article.id} className="article-card article-card-recommended">
                <div className="article-card-content">
                  <span className={`article-category-badge article-category-${article.category}`}>
                    {article.category}
                  </span>

                  {/* Show why this article was recommended (from backend logic) */}
                  {article.recommendation_reason && (
                    <div className="article-recommendation-reason">
                      <Lightbulb size={16} className="recommendation-icon" />
                      {article.recommendation_reason}
                    </div>
                  )}
                  
                  <h3 className="article-title">{article.title}</h3>
                  
                  {article.description && (
                    <p className="article-description">{article.description}</p>
                  )}
                  
                  {/* External link to article (opens in new tab) */}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-link"
                  >
                    Read Article →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filter buttons */}
      <div className="articles-categories">
        <h2>Browse by Category</h2>
        <div className="articles-category-buttons">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`articles-category-btn ${activeCategory === category.value ? 'articles-category-btn-active' : ''}`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* All articles grid (filtered by selected category) */}
      <div>
        <h2 className="mb-24">
          {activeCategory === 'all' ? 'All Articles' : `${categories.find(c => c.value === activeCategory)?.label} Articles`} ({filteredArticles.length})
        </h2>
        
        {filteredArticles.length === 0 ? (
          <div className="articles-empty-state">
            <p>No articles in this category yet.</p>
          </div>
        ) : (
          <div className="articles-grid">
            {filteredArticles.map((article) => (
              <div key={article.id} className="article-card">
                <div className="article-card-content">
                  <span className={`article-category-badge article-category-${article.category}`}>
                    {article.category}
                  </span>
                  
                  <h3 className="article-title">{article.title}</h3>
                  
                  {article.description && (
                    <p className="article-description">{article.description}</p>
                  )}
                  
                  {/* External link to article */}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-link"
                  >
                    Read Article →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;