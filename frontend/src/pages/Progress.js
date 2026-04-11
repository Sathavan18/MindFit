import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  const navigate = useNavigate();

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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading progress...</p>
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

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>Your Progress</h1>

      {error && (
        <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#ffe6e6', color: 'red', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Overall Stats */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Overall Activity</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {stats.weightEntries.length + stats.moodRatings.length + stats.meditationSessions.length + stats.journalEntries.length}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#666' }}>Total Entries</div>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {new Set([
                ...stats.weightEntries.map(e => e.date),
                ...stats.moodRatings.map(e => e.date),
                ...stats.meditationSessions.map(e => e.date),
                ...stats.journalEntries.map(e => e.date),
              ]).size}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#666' }}>Active Days</div>
          </div>
        </div>
      </div>

      {/* Streaks Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Current Streaks 🔥</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          
          {/* Weight Tracking Streak */}
          <div style={{ 
            backgroundColor: weightStreak >= 3 ? '#d4edda' : 'white',
            padding: '20px', 
            borderRadius: '8px', 
            border: `2px solid ${weightStreak >= 3 ? '#28a745' : '#ddd'}`
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {getStreakIcon(weightStreak)} {weightStreak}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              Weight Tracking
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {weightStreak === 0 ? 'Start today!' : `${weightStreak} day${weightStreak === 1 ? '' : 's'} in a row`}
            </div>
          </div>

          {/* Mood Rating Streak */}
          <div style={{ 
            backgroundColor: moodStreak >= 3 ? '#d4edda' : 'white',
            padding: '20px', 
            borderRadius: '8px', 
            border: `2px solid ${moodStreak >= 3 ? '#28a745' : '#ddd'}`
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {getStreakIcon(moodStreak)} {moodStreak}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              Mood Tracking
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {moodStreak === 0 ? 'Start today!' : `${moodStreak} day${moodStreak === 1 ? '' : 's'} in a row`}
            </div>
          </div>

          {/* Meditation Streak */}
          <div style={{ 
            backgroundColor: meditationStreak >= 3 ? '#d4edda' : 'white',
            padding: '20px', 
            borderRadius: '8px', 
            border: `2px solid ${meditationStreak >= 3 ? '#28a745' : '#ddd'}`
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {getStreakIcon(meditationStreak)} {meditationStreak}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              Meditation
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {meditationStreak === 0 ? 'Start today!' : `${meditationStreak} day${meditationStreak === 1 ? '' : 's'} in a row`}
            </div>
          </div>

          {/* Journal Streak */}
          <div style={{ 
            backgroundColor: journalStreak >= 3 ? '#d4edda' : 'white',
            padding: '20px', 
            borderRadius: '8px', 
            border: `2px solid ${journalStreak >= 3 ? '#28a745' : '#ddd'}`
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {getStreakIcon(journalStreak)} {journalStreak}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              Journaling
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {journalStreak === 0 ? 'Start today!' : `${journalStreak} day${journalStreak === 1 ? '' : 's'} in a row`}
            </div>
          </div>

        </div>
      </div>

      {/* Total Activity Section */}
      <div>
        <h2>All-Time Activity</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745', marginBottom: '10px' }}>
              {totalWeightDays}
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>Days Tracked Weight</div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#17a2b8', marginBottom: '10px' }}>
              {totalMoodDays}
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>Days Rated Mood</div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#6f42c1', marginBottom: '10px' }}>
              {totalMeditationDays}
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>Days Meditated</div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffc107', marginBottom: '10px' }}>
              {totalJournalDays}
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>Days Journaled</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Progress;