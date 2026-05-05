import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lightbulb, Home, User, Scale, Smile, BookOpen, Wind, Book, TrendingUp, Activity } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items with icons for each page
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    { path: '/insights', label: 'Insights', icon: <Lightbulb size={20} /> },
    { path: '/weight-tracking', label: 'Weight', icon: <Scale size={20} /> },
    { path: '/mood', label: 'Mood', icon: <Smile size={20} /> },
    { path: '/journal', label: 'Journal', icon: <BookOpen size={20} /> },
    { path: '/meditation', label: 'Meditation', icon: <Wind size={20} /> },
    { path: '/articles', label: 'Articles', icon: <Book size={20} /> },
    { path: '/progress', label: 'Progress', icon: <TrendingUp size={20} /> },
  ];

  // check if the current page matches the path for active styling
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo - clicking on it returns to dashboard*/}
        <div 
          onClick={() => navigate('/dashboard')}
          className="navbar-logo"
        >
          <Activity/> MindFit
        </div>

        {/* Main navigation links */}
        <div className="navbar-links">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`navbar-link ${isActive(item.path) ? 'navbar-link-active' : ''}`}
            >
              <span className="navbar-icon">{item.icon}</span>
              <span className="navbar-label">{item.label}</span>
            </button>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="navbar-logout"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;