import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';
  const [hoveredCard, setHoveredCard] = useState(null);

  // All available features with images and descriptions
  const features = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your health profile, BMR calculations, and calorie targets',
      path: '/profile',
      image: '/images/dashboard/profile.jpg',
    },
    {
      id: 'insights',  
      title: 'Insights',
      description: 'Discover connections between your physical and mental health',
      path: '/insights',
      image: '/images/dashboard/insights.jpg',
    },
    {
      id: 'weight',
      title: 'Weight Tracking',
      description: 'Monitor your weight progress and daily calorie intake',
      path: '/weight-tracking',
      image: '/images/dashboard/weight.jpg',
    },
    {
      id: 'mood',
      title: 'Mood Rating',
      description: 'Track anxiety, stress levels, and overall mental wellbeing',
      path: '/mood',
      image: '/images/dashboard/mood.jpg',
    },
    {
      id: 'journal',
      title: 'Journal',
      description: 'Document your daily thoughts and reflections',
      path: '/journal',
      image: '/images/dashboard/journal.jpg',
    },
    {
      id: 'meditation',
      title: 'Meditation',
      description: 'Practice mindfulness and build your meditation streak',
      path: '/meditation',
      image: '/images/dashboard/meditation.jpg',
    },
    {
      id: 'articles',
      title: 'Health Resources',
      description: 'Access personalized wellness articles and recommendations',
      path: '/articles',
      image: '/images/dashboard/articles.jpg',
    },
    {
      id: 'progress',
      title: 'Progress',
      description: 'View your activity streaks and achievements',
      path: '/progress',
      image: '/images/dashboard/progress.jpg',
    },
  ];

  return (
    <div className="page-container">
      {/* Welcome header with username */}
      <div className="dashboard-header">
        <h1>Welcome back, {String(username)}</h1>
        <p className="dashboard-subtitle">Choose a feature to continue your wellness journey</p>
      </div>

      {/* Grid of feature cards with hover effects */}
      <div className="dashboard-grid">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="feature-card"
            onClick={() => navigate(feature.path)}
            onMouseEnter={() => setHoveredCard(feature.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Background image with blur effect on hover */}
            <div 
              className="feature-card-background"
              style={{
                backgroundImage: `url(${feature.image})`,
                // Increase blur and darken on hover to make text more readable
                filter: hoveredCard === feature.id ? 'blur(8px) brightness(0.4)' : 'blur(0px) brightness(0.6)',
              }}
            />
            
            {/* Card content overlay */}
            <div className="feature-card-content">
              <h3 className="feature-title">{feature.title}</h3>
              
              {/* Show description only when card is hovered */}
              {hoveredCard === feature.id && (
                <p className="feature-description fade-up">
                  {feature.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;