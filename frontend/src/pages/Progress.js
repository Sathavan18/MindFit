import { useState, useEffect } from 'react';
import api from '../services/api';
import { Flame, Star, Sparkles, Moon } from 'lucide-react';

const Progress = () => {
  const [stats, setStats] = useState({
    weightEntries: [],
    moodRatings: [],
    meditationSessions: [],
    journalEntries: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all tracking data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Load data from all tracking endpoints
  const fetchAllData = async () => {
    try {
      // Fetch all data in parallel for faster loading
      const [weight, mood, meditation, journal] = await Promise.all([
        api.get('physical/weight/'),
        api.get('mental/mood/'),
        api.get('mental/meditation/'),
        api.get('mental/journal/'),
      ]);

      setStats({
        weightEntries: weight.data,
        moodRatings: mood.data,
        meditationSessions: meditation.data,
        journalEntries: journal.data,
      });
      
      setLoading(false);
    } catch (error) {
      setError('Failed to load progress data');
      setLoading(false);
    }
  };

  // Calculate current streak (consecutive days from today backwards)
  const calculateStreak = (entries) => {
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort entries by date (most recent first)
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let currentDate = new Date(today);
    
    // Count consecutive days starting from today
    for (let entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      if (entryDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break; // Gap found, streak ends
      }
    }
    
    return streak;
  };

  // Calculate total unique days with entries (all-time activity)
  const calculateTotalDays = (entries) => {
    if (entries.length === 0) return 0;
    const uniqueDates = new Set(entries.map(e => e.date));
    return uniqueDates.size;
  };

  // Get icon based on streak length (gamification)
  const getStreakIcon = (streak) => {
    if (streak >= 7) return <Flame size={32} style={{ color: '#f59e0b' }} />; // 7+ days = fire
    if (streak >= 3) return <Star size={32} style={{ color: '#fbbf24' }} />; // 3-6 days = star
    if (streak >= 1) return <Sparkles size={32} style={{ color: '#60a5fa' }} />; // 1-2 days = sparkles
    return <Moon size={32} style={{ color: '#9ca3af' }} />; // 0 days = moon
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center">
          <p className="text-muted">Loading progress...</p>
        </div>
      </div>
    );
  }

  // Calculate streaks for each tracking feature
  const weightStreak = calculateStreak(stats.weightEntries);
  const moodStreak = calculateStreak(stats.moodRatings);
  const meditationStreak = calculateStreak(stats.meditationSessions);
  const journalStreak = calculateStreak(stats.journalEntries);

  // Calculate all-time activity days for each feature
  const totalWeightDays = calculateTotalDays(stats.weightEntries);
  const totalMoodDays = calculateTotalDays(stats.moodRatings);
  const totalMeditationDays = calculateTotalDays(stats.meditationSessions);
  const totalJournalDays = calculateTotalDays(stats.journalEntries);

  // Calculate overall statistics
  const totalEntries = stats.weightEntries.length + stats.moodRatings.length + 
                       stats.meditationSessions.length + stats.journalEntries.length;
  
  // Count unique days with any activity across all features
  const activeDays = new Set([
    ...stats.weightEntries.map(e => e.date),
    ...stats.moodRatings.map(e => e.date),
    ...stats.meditationSessions.map(e => e.date),
    ...stats.journalEntries.map(e => e.date),
  ]).size;

  return (
    <div className="page-container">
      <h1 className="mb-40">Your Progress</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Overall activity summary */}
      <div className="progress-section">
        <h2>Overall Activity</h2>
        <div className="progress-overall-stats">
          <div className="progress-stat-card">
            <div className="progress-stat-number">{totalEntries}</div>
            <div className="progress-stat-label">Total Entries</div>
          </div>

          <div className="progress-stat-card">
            <div className="progress-stat-number">{activeDays}</div>
            <div className="progress-stat-label">Active Days</div>
          </div>
        </div>
      </div>

      {/* Current streaks with visual indicators */}
      <div className="progress-section">
        <h2>
          <Flame className="inline-icon" style={{ color: '#f59e0b' }} />
          Current Streaks
        </h2>
        <div className="progress-streaks-grid">
          
          {/* Weight tracking streak */}
          <div className={`progress-streak-card ${weightStreak >= 3 ? 'progress-streak-card-active' : ''}`}>
            <span className="progress-streak-icon">{getStreakIcon(weightStreak)}</span>
            <div className="progress-streak-number">{weightStreak}</div>
            <div className="progress-streak-title">Weight Tracking</div>
            <div className="progress-streak-subtitle">
              {weightStreak === 0 ? 'Start today!' : `${weightStreak} day${weightStreak === 1 ? '' : 's'} in a row`}
            </div>
          </div>

          {/* Mood tracking streak */}
          <div className={`progress-streak-card ${moodStreak >= 3 ? 'progress-streak-card-active' : ''}`}>
            <span className="progress-streak-icon">{getStreakIcon(moodStreak)}</span>
            <div className="progress-streak-number">{moodStreak}</div>
            <div className="progress-streak-title">Mood Tracking</div>
            <div className="progress-streak-subtitle">
              {moodStreak === 0 ? 'Start today!' : `${moodStreak} day${moodStreak === 1 ? '' : 's'} in a row`}
            </div>
          </div>

          {/* Meditation streak */}
          <div className={`progress-streak-card ${meditationStreak >= 3 ? 'progress-streak-card-active' : ''}`}>
            <span className="progress-streak-icon">{getStreakIcon(meditationStreak)}</span>
            <div className="progress-streak-number">{meditationStreak}</div>
            <div className="progress-streak-title">Meditation</div>
            <div className="progress-streak-subtitle">
              {meditationStreak === 0 ? 'Start today!' : `${meditationStreak} day${meditationStreak === 1 ? '' : 's'} in a row`}
            </div>
          </div>

          {/* Journaling streak */}
          <div className={`progress-streak-card ${journalStreak >= 3 ? 'progress-streak-card-active' : ''}`}>
            <span className="progress-streak-icon">{getStreakIcon(journalStreak)}</span>
            <div className="progress-streak-number">{journalStreak}</div>
            <div className="progress-streak-title">Journaling</div>
            <div className="progress-streak-subtitle">
              {journalStreak === 0 ? 'Start today!' : `${journalStreak} day${journalStreak === 1 ? '' : 's'} in a row`}
            </div>
          </div>

        </div>
      </div>

      {/* All-time activity statistics */}
      <div className="progress-section">
        <h2>All-Time Activity</h2>
        <div className="progress-activity-grid">
          
          <div className="progress-activity-card">
            <div className="progress-activity-number" style={{ color: 'var(--success)' }}>
              {totalWeightDays}
            </div>
            <div className="progress-activity-label">Days Tracked Weight</div>
          </div>

          <div className="progress-activity-card">
            <div className="progress-activity-number" style={{ color: 'var(--info)' }}>
              {totalMoodDays}
            </div>
            <div className="progress-activity-label">Days Rated Mood</div>
          </div>

          <div className="progress-activity-card">
            <div className="progress-activity-number" style={{ color: 'var(--purple)' }}>
              {totalMeditationDays}
            </div>
            <div className="progress-activity-label">Days Meditated</div>
          </div>

          <div className="progress-activity-card">
            <div className="progress-activity-number" style={{ color: 'var(--warning)' }}>
              {totalJournalDays}
            </div>
            <div className="progress-activity-label">Days Journaled</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Progress;