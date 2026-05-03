import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/insights', label: 'Insights', icon: '💡' },
    { path: '/weight-tracking', label: 'Weight', icon: '⚖️' },
    { path: '/mood', label: 'Mood', icon: '😊' },
    { path: '/journal', label: 'Journal', icon: '📝' },
    { path: '/meditation', label: 'Meditation', icon: '🧘' },
    { path: '/articles', label: 'Articles', icon: '📚' },
    { path: '/progress', label: 'Progress', icon: '📊' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="navbar-logo"
        >
          💪 MindFit
        </div>

        {/* Navigation Links */}
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