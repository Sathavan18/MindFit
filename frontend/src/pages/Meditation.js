import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Flame, Volume2, VolumeX, CloudRain, TreePine, Wind } from 'lucide-react';

const Meditation = () => {
  const [sessions, setSessions] = useState([]);
  const [duration, setDuration] = useState(10);
  const [selectedSound, setSelectedSound] = useState('none');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Audio element for ambient sounds
  const audioRef = useRef(null);

  // Available ambient sounds for meditation
  const soundOptions = [
    { id: 'none', label: 'Silent', icon: <VolumeX size={20} />, file: null },
    { id: 'rain', label: 'Rain', icon: <CloudRain size={20} />, file: '/sounds/meditation/rain.mp3' },
    { id: 'nature', label: 'Nature', icon: <TreePine size={20} />, file: '/sounds/meditation/nature.mp3' },
    { id: 'whitenoise', label: 'White Noise', icon: <Wind size={20} />, file: '/sounds/meditation/whitenoise.mp3' },
  ];

  // Fetch meditation history on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Timer countdown logic
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      // Countdown every second
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer finished, save session
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
    
    // Play selected ambient sound
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
    // Stop and clear audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
  };

  // Save completed meditation session to backend
  const handleSessionComplete = async () => {
    try {
      const response = await api.post('mental/meditation/', {
        duration: duration,
      });
      
      // Add new session to list
      setSessions([response.data, ...sessions]);
      setSuccess(`Great job! ${duration} minute meditation completed!`);
      setTimeLeft(null);
      
      // Stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      }
    } catch (error) {
      setError('Failed to save meditation session');
    }
  };

  // Format seconds into MM:SS display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate current streak (consecutive days from today backwards)
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
        break; // Gap found, streak ends
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

      {/* Streak banner */}
      <div className="meditation-streak-banner">
        <div className="meditation-streak-content">
          <Flame size={32} className="meditation-streak-icon" style={{ color: '#f59e0b' }} />
          <p className="meditation-streak-text">
            {currentStreak} Day Streak
          </p>
        </div>
      </div>

      {/* Hidden audio element for ambient sounds */}
      <audio ref={audioRef} loop />

      {/* Main timer interface */}
      <div className="meditation-timer-card">
        <h2>Meditation Timer</h2>
        
        {timeLeft === null ? (
          // Setup mode - choose sound and duration
          <div className="meditation-setup">
            {/* Sound selection */}
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

            {/* Duration selection */}
            <div className="meditation-duration-selector">
              <label className="meditation-duration-label">Duration:</label>
              
              {/* Quick select buttons */}
              <div className="meditation-quick-select">
                {[3, 5, 10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`meditation-quick-btn ${duration === mins ? 'meditation-quick-btn-active' : ''}`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
              
              {/* Custom duration input */}
              <div className="meditation-custom-input">
                <label className="form-label">Or enter custom duration:</label>
                <input
                  type="number"
                  min="3"
                  max="120"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(3, parseInt(e.target.value) || 3))}
                  className="form-input"
                  placeholder="Minutes"
                  style={{ textAlign: 'center', maxWidth: '200px', margin: '8px auto' }}
                />
                <span className="text-muted text-small">minutes (3-120)</span>
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
          // Timer active mode
          <>
            {/* Countdown display */}
            <div className={`meditation-timer-display ${timeLeft <= 60 ? 'meditation-timer-warning' : 'meditation-timer-active'}`}>
              {formatTime(timeLeft)}
            </div>
            
            {/* Timer controls */}
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

      {/* Session history table */}
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