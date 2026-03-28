import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [latestMoodRating, setLatestMoodRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all articles
      const articlesResponse = await api.get('content/articles/');
      setArticles(articlesResponse.data);

      // Fetch latest mood rating for recommendations
      const moodResponse = await api.get('mental/mood/');
      if (moodResponse.data.length > 0) {
        const latest = moodResponse.data[0]; // Assumes sorted by date desc
        setLatestMoodRating(latest);
        
        // Filter recommended articles based on mood
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
      // Check anxiety trigger
      if (article.min_anxiety_trigger && mood.anxiety_level >= article.min_anxiety_trigger) {
        return true;
      }
      
      // Check stress trigger
      if (article.min_stress_trigger && mood.stress_level >= article.min_stress_trigger) {
        return true;
      }
      
      // Check mood trigger (recommend if mood is low)
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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading articles...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Health Resources</h1>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#ffe6e6', color: 'red', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Recommended Articles Section */}
      {recommendedArticles.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '15px', 
            borderRadius: '8px', 
            border: '2px solid #ffc107',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#856404' }}>
              💡 Recommended For You
            </h2>
            <p style={{ margin: 0, color: '#856404' }}>
              Based on your latest mood rating from {latestMoodRating && new Date(latestMoodRating.date).toLocaleDateString()}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {recommendedArticles.map((article) => (
              <div 
                key={article.id}
                style={{ 
                  backgroundColor: '#fff3cd',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '2px solid #ffc107',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: '#ffc107',
                  color: '#000',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  alignSelf: 'flex-start',
                  textTransform: 'capitalize'
                }}>
                  {article.category}
                </div>
                
                <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>{article.title}</h3>
                
                {article.description && (
                  <p style={{ margin: '0 0 15px 0', color: '#856404', flex: 1 }}>
                    {article.description}
                  </p>
                )}
                
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#856404',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  Read Article →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              style={{
                padding: '8px 16px',
                backgroundColor: activeCategory === category.value ? '#007bff' : '#f8f9fa',
                color: activeCategory === category.value ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: activeCategory === category.value ? 'bold' : 'normal',
              }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* All Articles */}
      <div>
        <h2>{activeCategory === 'all' ? 'All Articles' : `${categories.find(c => c.value === activeCategory)?.label} Articles`} ({filteredArticles.length})</h2>
        
        {filteredArticles.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: 0 }}>
              No articles in this category yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredArticles.map((article) => (
              <div 
                key={article.id}
                style={{ 
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: '#e7f3ff',
                  color: '#007bff',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  alignSelf: 'flex-start',
                  textTransform: 'capitalize'
                }}>
                  {article.category}
                </div>
                
                <h3 style={{ margin: '0 0 10px 0' }}>{article.title}</h3>
                
                {article.description && (
                  <p style={{ margin: '0 0 15px 0', color: '#666', flex: 1 }}>
                    {article.description}
                  </p>
                )}
                
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  Read Article →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;