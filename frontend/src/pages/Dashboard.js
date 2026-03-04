import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Welcome to MindFit, {user?.username}!</h1>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <p>Your dashboard is coming soon! You'll be able to:</p>
        <ul>
          <li>Track your weight and calories</li>
          <li>Log your mood and journal entries</li>
          <li>Use the meditation timer</li>
          <li>View your progress graphs</li>
          <li>Get personalized article recommendations</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;