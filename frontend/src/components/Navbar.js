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
    { path: '/weight-tracking', label: 'Weight', icon: '⚖️' },
    { path: '/mood', label: 'Mood', icon: '😊' },
    { path: '/journal', label: 'Journal', icon: '📝' },
    { path: '/meditation', label: 'Meditation', icon: '🧘' },
    { path: '/articles', label: 'Articles', icon: '📚' },
    { path: '/progress', label: 'Progress', icon: '📊' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: '#2c3e50',
      padding: '0 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px',
      }}>
        {/* Logo/Brand */}
        <div 
          onClick={() => navigate('/dashboard')}
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#fff',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          💪 MindFit
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: '8px 16px',
                backgroundColor: isActive(item.path) ? '#34495e' : 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = '#34495e';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ marginRight: '6px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              marginLeft: '10px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;