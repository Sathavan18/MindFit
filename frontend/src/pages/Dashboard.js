import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  return (
    <div className="page-container">
      <h1 className="mb-30">Welcome to MindFit, {String(username)}!</h1>

      <div className="card mb-30">
        <h2>Track Your Health Journey</h2>
        <p>MindFit helps you monitor both physical and mental wellness:</p>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Track your weight and calories</li>
          <li>Log your mood and journal entries</li>
          <li>Use the meditation timer</li>
          <li>View your progress graphs</li>
          <li>Get personalized article recommendations</li>
        </ul>
      </div>

      <h2 className="mb-15">Quick Access</h2>
      <div className="grid-auto">
        <button onClick={() => navigate('/profile')} className="btn btn-primary">
          👤 View My Profile
        </button>
        
        <button onClick={() => navigate('/weight-tracking')} className="btn btn-success">
          ⚖️ Track Weight
        </button>
        
        <button onClick={() => navigate('/journal')} className="btn btn-purple">
          📝 Journal
        </button>
        
        <button onClick={() => navigate('/mood')} className="btn btn-info">
          😊 Mood Rating
        </button>
        
        <button onClick={() => navigate('/meditation')} className="btn btn-success">
          🧘 Meditation
        </button>
        
        <button onClick={() => navigate('/articles')} className="btn btn-warning">
          📚 Health Resources
        </button>
        
        <button onClick={() => navigate('/progress')} className="btn btn-success">
          📊 View Progress & Streaks
        </button>
      </div>
    </div>
  );
};

export default Dashboard;