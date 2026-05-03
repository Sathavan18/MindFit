import { useState, useEffect } from 'react';
import api from '../services/api';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [latestMoodRating, setLatestMoodRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const articlesResponse = await api.get('content/articles/');
      setArticles(articlesResponse.data);

      const moodResponse = await api.get('mental/mood/');
      if (moodResponse.data.length > 0) {
        const latest = moodResponse.data[0];
        setLatestMoodRating(latest);
        
        const recommended = getRecommendedArticles(articlesResponse.data, latest);
        setRecommendedArticles(recommended);
      }
      
      setLoading(false);
    } catch (error) {
      setError('Failed to load articles');
      setLoading(false);
    }
  };

  const getRecommendedArticles = (allArticles, mood) => {
    return allArticles.filter(article => {
      if (article.min_anxiety_trigger && mood.anxiety_level >= article.min_anxiety_trigger) {
        return true;
      }
      
      if (article.min_stress_trigger && mood.stress_level >= article.min_stress_trigger) {
        return true;
      }
      
      if (article.max_mood_trigger && mood.overall_mood <= article.max_mood_trigger) {
        return true;
      }
      
      return false;
    });
  };

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

      {/* Recommended Articles Section */}
      {recommendedArticles.length > 0 && (
        <div className="articles-recommendations">
          <div className="articles-recommendations-banner">
            <h2>💡 Recommended For You</h2>
            <p>
              Based on your latest mood rating from {latestMoodRating && new Date(latestMoodRating.date).toLocaleDateString()}
            </p>
          </div>

          <div className="articles-grid">
            {recommendedArticles.map((article) => (
              <div key={article.id} className="article-card article-card-recommended">
                <div className="article-card-content">
                  <span className={`article-category-badge article-category-${article.category}`}>
                    {article.category}
                  </span>
                  
                  <h3 className="article-title">{article.title}</h3>
                  
                  {article.description && (
                    <p className="article-description">{article.description}</p>
                  )}
                  
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

      {/* Category Filter */}
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

      {/* All Articles */}
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