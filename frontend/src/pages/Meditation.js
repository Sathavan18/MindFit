import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const Meditation = () => {
  const [sessions, setSessions] = useState([]);
  const [duration, setDuration] = useState(10);
  const [selectedSound, setSelectedSound] = useState('none');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const audioRef = useRef(null);

  const soundOptions = [
    { id: 'none', label: 'Silent', icon: '🔇', file: null },
    { id: 'rain', label: 'Rain', icon: '🌧️', file: '/sounds/meditation/rain.mp3' },
    { id: 'nature', label: 'Nature', icon: '🌲', file: '/sounds/meditation/nature.mp3' },
    { id: 'whitenoise', label: 'White Noise', icon: '💨', file: '/sounds/meditation/whitenoise.mp3' },
  ];

  useEffect(() => {
    // ... timer logic
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft]);

  // Timer logic
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
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
    setTimeLeft(duration * 60);
    setIsActive(true);
    setError('');
    setSuccess('');
    
    // Start audio if selected
    if (selectedSound !== 'none' && audioRef.current) {
      const sound = soundOptions.find(s => s.id === selectedSound);
      if (sound?.file) {
        audioRef.current.src = sound.file;
        audioRef.current.load();
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resumeTimer = () => {
    setIsActive(true);
    if (selectedSound !== 'none' && audioRef.current) {
      audioRef.current.play();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = ''; // Clear the source
    }
  };

  const handleSessionComplete = async () => {
    try {
      const response = await api.post('mental/meditation/', {
        duration: duration,
      });
      
      setSessions([response.data, ...sessions]);
      setSuccess(`Great job! ${duration} minute meditation completed! 🧘`);
      setTimeLeft(null);
      
      // Stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = ''; // Clear the source
      }
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
      <div className="page-container">
        <div className="text-center">
          <p className="text-muted">Loading meditation sessions...</p>
        </div>
      </div>
    );
  }

  const currentStreak = calculateStreak();

  return (
    <div className="page-container">
      <h1 className="mb-40">Meditation</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Streak Display */}
      <div className="meditation-streak-banner">
        <div className="meditation-streak-content">
          <span className="meditation-streak-icon">🔥</span>
          <p className="meditation-streak-text">
            {currentStreak} Day Streak
          </p>
        </div>
      </div>

      {/* Audio element (hidden) - single element that updates source */}
      <audio ref={audioRef} loop />

      {/* Timer Section */}
      <div className="meditation-timer-card">
        <h2>Meditation Timer</h2>
        
        {timeLeft === null ? (
          // Setup view
          <div className="meditation-setup">
            {/* Sound Selector */}
            <div className="meditation-sound-selector">
              <label className="meditation-sound-label">Choose Your Sound:</label>
              <div className="meditation-sound-options">
                {soundOptions.map((sound) => (
                  <button
                    key={sound.id}
                    onClick={() => setSelectedSound(sound.id)}
                    className={`meditation-sound-btn ${selectedSound === sound.id ? 'meditation-sound-btn-active' : ''}`}
                    type="button"
                  >
                    <span className="meditation-sound-icon">{sound.icon}</span>
                    <span>{sound.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="meditation-duration-selector">
              <label className="meditation-duration-label">Duration:</label>
              <div className="meditation-duration-value">{duration} minutes</div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                disabled={isActive}
                className="mood-slider"
              />
              <div className="mood-slider-range">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>
            
            <button
              onClick={startTimer}
              className="btn btn-success btn-large btn-full-width"
            >
              Start Meditation
            </button>
          </div>
        ) : (
          // Timer view
          <>
            <div className={`meditation-timer-display ${timeLeft <= 60 ? 'meditation-timer-warning' : 'meditation-timer-active'}`}>
              {formatTime(timeLeft)}
            </div>
            
            <div className="meditation-controls">
              {isActive ? (
                <button
                  onClick={pauseTimer}
                  className="btn btn-warning btn-large"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  className="btn btn-success btn-large"
                >
                  Resume
                </button>
              )}
              
              <button
                onClick={resetTimer}
                className="btn btn-danger btn-large"
              >
                Reset
              </button>
            </div>
          </>
        )}
      </div>

      {/* Session History */}
      <div className="meditation-history-card">
        <h2>Session History ({sessions.length})</h2>
        
        {sessions.length === 0 ? (
          <div className="meditation-empty-state">
            <p>No meditation sessions yet. Start your first session above!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      {new Date(session.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td><strong>{session.duration} minutes</strong></td>
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