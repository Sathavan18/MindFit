import { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MoodRating = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    anxiety_level: 5,
    stress_level: 5,
    overall_mood: 3,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('mental/mood/');
      setEntries(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load mood ratings');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseInt(e.target.value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await api.post('mental/mood/', formData);
      setEntries([response.data, ...entries]);
      setSuccess('Mood rating saved!');
      setSubmitting(false);
    } catch (error) {
      setError('Failed to save mood rating');
      setSubmitting(false);
    }
  };

  const getAnxietyLabel = (level) => {
    const labels = {
      1: 'Not Anxious At All', 2: 'Not Anxious', 3: 'Slightly Anxious',
      4: 'Somewhat Anxious', 5: 'Anxious', 6: 'Moderately Anxious',
      7: 'Quite Anxious', 8: 'Very Anxious', 9: 'Super Anxious', 10: 'Extremely Anxious',
    };
    return labels[level];
  };

  const getStressLabel = (level) => {
    const labels = {
      1: 'Not Stressed At All', 2: 'Not Stressed', 3: 'Slightly Stressed',
      4: 'Somewhat Stressed', 5: 'Stressed', 6: 'Moderately Stressed',
      7: 'Quite Stressed', 8: 'Very Stressed', 9: 'Super Stressed', 10: 'Extremely Stressed',
    };
    return labels[level];
  };

  const getMoodLabel = (level) => {
    const labels = { 1: 'Poor', 2: 'Somewhat Poor', 3: 'Okay', 4: 'Somewhat Happy', 5: 'Happy' };
    return labels[level];
  };

  const getAnxietyColor = (level) => {
    if (level <= 3) return 'var(--success)';
    if (level <= 6) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getStressColor = (level) => {
    if (level <= 3) return 'var(--success)';
    if (level <= 6) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getMoodColor = (level) => {
    if (level >= 4) return 'var(--success)';
    if (level >= 3) return 'var(--warning)';
    return 'var(--danger)';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center">
          <p className="text-muted">Loading mood ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="mb-40">Mood Rating</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Rating Form */}
      <div className="mood-form-card">
        <h2>How are you feeling today?</h2>
        <form onSubmit={handleSubmit}>
          
          {/* Anxiety Level */}
          <div className="mood-slider-group">
            <label className="mood-slider-label">
              Anxiety Level:
              <span className="mood-slider-value" style={{ color: getAnxietyColor(formData.anxiety_level) }}>
                {getAnxietyLabel(formData.anxiety_level)}
              </span>
            </label>
            <input
              type="range"
              name="anxiety_level"
              min="1"
              max="10"
              value={formData.anxiety_level}
              onChange={handleChange}
              className="mood-slider"
            />
            <div className="mood-slider-range">
              <span>1 (Not Anxious)</span>
              <span>10 (Extremely Anxious)</span>
            </div>
          </div>

          {/* Stress Level */}
          <div className="mood-slider-group">
            <label className="mood-slider-label">
              Stress Level:
              <span className="mood-slider-value" style={{ color: getStressColor(formData.stress_level) }}>
                {getStressLabel(formData.stress_level)}
              </span>
            </label>
            <input
              type="range"
              name="stress_level"
              min="1"
              max="10"
              value={formData.stress_level}
              onChange={handleChange}
              className="mood-slider"
            />
            <div className="mood-slider-range">
              <span>1 (Not Stressed)</span>
              <span>10 (Extremely Stressed)</span>
            </div>
          </div>

          {/* Overall Mood */}
          <div className="mood-slider-group">
            <label className="mood-slider-label">
              Overall Mood:
              <span className="mood-slider-value" style={{ color: getMoodColor(formData.overall_mood) }}>
                {getMoodLabel(formData.overall_mood)}
              </span>
            </label>
            <input
              type="range"
              name="overall_mood"
              min="1"
              max="5"
              value={formData.overall_mood}
              onChange={handleChange}
              className="mood-slider"
            />
            <div className="mood-slider-range">
              <span>1 (Poor)</span>
              <span>5 (Happy)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-info btn-full-width btn-large"
          >
            {submitting ? 'Saving...' : 'Save Mood Rating'}
          </button>
        </form>
      </div>

      {/* Mood Trends Graph */}
      {entries.length > 0 && (
        <div className="mood-graph-card">
          <h2>Mood Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[...entries].reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="var(--text-secondary)"
              />
              <YAxis 
                domain={[0, 10]}
                label={{ value: 'Level', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
                stroke="var(--text-secondary)"
              />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="anxiety_level" 
                stroke="#ff3b30" 
                strokeWidth={3}
                dot={{ fill: '#ff3b30', r: 5 }}
                name="Anxiety"
              />
              <Line 
                type="monotone" 
                dataKey="stress_level" 
                stroke="#ff9500" 
                strokeWidth={3}
                dot={{ fill: '#ff9500', r: 5 }}
                name="Stress"
              />
              <Line 
                type="monotone" 
                dataKey="overall_mood" 
                stroke="#34c759" 
                strokeWidth={3}
                dot={{ fill: '#34c759', r: 5 }}
                name="Overall Mood"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mood-legend">
            <p><span style={{ color: '#ff3b30', fontWeight: 'bold' }}>Red (Anxiety)</span> & <span style={{ color: '#ff9500', fontWeight: 'bold' }}>Orange (Stress)</span>: Lower is better</p>
            <p><span style={{ color: '#34c759', fontWeight: 'bold' }}>Green (Overall Mood)</span>: Higher is better (scale 1-5)</p>
          </div>
        </div>
      )}

      {/* Past Ratings */}
      <div className="mood-history-card">
        <h2>Past Ratings ({entries.length})</h2>
        
        {entries.length === 0 ? (
          <div className="mood-empty-state">
            <p>No mood ratings yet. Log your first rating above!</p>
          </div>
        ) : (
          <div className="mood-history-grid">
            {entries.map((entry) => (
              <div key={entry.id} className="mood-history-item">
                <div className="mood-history-date">
                  {new Date(entry.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                
                <div className="mood-history-details">
                  <div className="mood-history-row">
                    <span className="mood-history-label">Anxiety:</span>
                    <span className="mood-history-value" style={{ color: getAnxietyColor(entry.anxiety_level) }}>
                      {entry.anxiety_level}/10 - {getAnxietyLabel(entry.anxiety_level)}
                    </span>
                  </div>
                  
                  <div className="mood-history-row">
                    <span className="mood-history-label">Stress:</span>
                    <span className="mood-history-value" style={{ color: getStressColor(entry.stress_level) }}>
                      {entry.stress_level}/10 - {getStressLabel(entry.stress_level)}
                    </span>
                  </div>
                  
                  <div className="mood-history-row">
                    <span className="mood-history-label">Overall Mood:</span>
                    <span className="mood-history-value" style={{ color: getMoodColor(entry.overall_mood) }}>
                      {entry.overall_mood}/5 - {getMoodLabel(entry.overall_mood)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodRating;