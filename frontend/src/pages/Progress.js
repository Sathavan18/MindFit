import { useState, useEffect } from 'react';
import api from '../services/api';

const Progress = () => {
  const [stats, setStats] = useState({
    weightEntries: [],
    moodRatings: [],
    meditationSessions: [],
    journalEntries: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
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

  const calculateStreak = (entries) => {
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let currentDate = new Date(today);
    
    for (let entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      if (entryDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    return streak;
  };

  const calculateTotalDays = (entries) => {
    if (entries.length === 0) return 0;
    const uniqueDates = new Set(entries.map(e => e.date));
    return uniqueDates.size;
  };

  const getStreakIcon = (streak) => {
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⭐';
    if (streak >= 1) return '✨';
    return '💤';
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

  const weightStreak = calculateStreak(stats.weightEntries);
  const moodStreak = calculateStreak(stats.moodRatings);
  const meditationStreak = calculateStreak(stats.meditationSessions);
  const journalStreak = calculateStreak(stats.journalEntries);

  const totalWeightDays = calculateTotalDays(stats.weightEntries);
  const totalMoodDays = calculateTotalDays(stats.moodRatings);
  const totalMeditationDays = calculateTotalDays(stats.meditationSessions);
  const totalJournalDays = calculateTotalDays(stats.journalEntries);

  const totalEntries = stats.weightEntries.length + stats.moodRatings.length + 
                       stats.meditationSessions.length + stats.journalEntries.length;
  
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

      {/* Overall Stats */}
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

      {/* Current Streaks */}
      <div className="progress-section">
        <h2>Current Streaks 🔥</h2>
        <div className="progress-streaks-grid">
          
          {/* Weight Tracking Streak */}
          <div className={`progress-streak-card ${weightStreak >= 3 ? 'progress-streak-card-active' : ''}`}>
            <span className="progress-streak-icon">{getStreakIcon(weightStreak)}</span>
            <div className="progress-streak-number">{weightStreak}</div>
            <div className="progress-streak-title">Weight Tracking</div>
            <div className="progress-streak-subtitle">
              {weightStreak === 0 ? 'Start today!' : `${weightStreak} day${weightStreak === 1 ? '' : 's'} in a row`}
            </div>
          </div>

          {/* Mood Rating Streak */}
          <div className={`progress-streak-card ${moodStreak >= 3 ? 'progress-streak-card-active' : ''}`}>
            <span className="progress-streak-icon">{getStreakIcon(moodStreak)}</span>
            <div className="progress-streak-number">{moodStreak}</div>
            <div className="progress-streak-title">Mood Tracking</div>
            <div className="progress-streak-subtitle">
              {moodStreak === 0 ? 'Start today!' : `${moodStreak} day${moodStreak === 1 ? '' : 's'} in a row`}
            </div>
          </div>

          {/* Meditation Streak */}
          <div className={`progress-streak-card ${meditationStreak >= 3 ? 'progress-streak-card-active' : ''}`}>
            <span className="progress-streak-icon">{getStreakIcon(meditationStreak)}</span>
            <div className="progress-streak-number">{meditationStreak}</div>
            <div className="progress-streak-title">Meditation</div>
            <div className="progress-streak-subtitle">
              {meditationStreak === 0 ? 'Start today!' : `${meditationStreak} day${meditationStreak === 1 ? '' : 's'} in a row`}
            </div>
          </div>

          {/* Journal Streak */}
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

      {/* All-Time Activity */}
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