import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Meditation = () => {
  const [sessions, setSessions] = useState([]);
  const [duration, setDuration] = useState(10); // minutes
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer completed
      handleSessionComplete();
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const fetchSessions = async () => {
    try {
      const response = await api.get('mental/meditation/');
      setSessions(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load meditation sessions');
      setLoading(false);
    }
  };

  const startTimer = () => {
    setTimeLeft(duration * 60); // Convert minutes to seconds
    setIsActive(true);
    setError('');
    setSuccess('');
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resumeTimer = () => {
    setIsActive(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(null);
  };

  const handleSessionComplete = async () => {
    try {
      const response = await api.post('mental/meditation/', {
        duration: duration,
      });
      
      setSessions([response.data, ...sessions]);
      setSuccess(`Great job! ${duration} minute meditation completed! 🧘`);
      setTimeLeft(null);
    } catch (error) {
      setError('Failed to save meditation session');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateStreak = () => {
    if (sessions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort sessions by date (newest first)
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let currentDate = new Date(today);
    
    for (let session of sortedSessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    return streak;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  const currentStreak = calculateStreak();

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Meditation</h1>
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

      {success && (
        <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
          {success}
        </div>
      )}

      {/* Streak Display */}
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '20px', 
        borderRadius: '8px', 
        border: '2px solid #ffc107',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#856404' }}>🔥 Current Streak</h2>
        <p style={{ fontSize: '48px', fontWeight: 'bold', margin: 0, color: '#856404' }}>
          {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
        </p>
      </div>

      {/* Timer Section */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px', textAlign: 'center' }}>
        <h2>Meditation Timer</h2>
        
        {timeLeft === null ? (
          // Setup view
          <>
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                Duration: {duration} minutes
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                disabled={isActive}
                style={{ width: '100%', height: '8px', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px' }}>
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>
            
            <button
              onClick={startTimer}
              style={{
                padding: '15px 40px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              Start Meditation
            </button>
          </>
        ) : (
          // Timer view
          <>
            <div style={{ 
              fontSize: '72px', 
              fontWeight: 'bold', 
              margin: '30px 0',
              color: timeLeft <= 60 ? '#dc3545' : '#28a745'
            }}>
              {formatTime(timeLeft)}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {isActive ? (
                <button
                  onClick={pauseTimer}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: '#ffc107',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  Resume
                </button>
              )}
              
              <button
                onClick={resetTimer}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                Reset
              </button>
            </div>
          </>
        )}
      </div>

      {/* Session History */}
      <div>
        <h2>Session History ({sessions.length})</h2>
        
        {sessions.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: 0 }}>
              No meditation sessions yet. Start your first session above!
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      {new Date(session.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {session.duration} minutes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meditation;