import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
  
  const navigate = useNavigate();

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
      1: 'Not Anxious At All',
      2: 'Not Anxious',
      3: 'Slightly Anxious',
      4: 'Somewhat Anxious',
      5: 'Anxious',
      6: 'Moderately Anxious',
      7: 'Quite Anxious',
      8: 'Very Anxious',
      9: 'Super Anxious',
      10: 'Extremely Anxious',
    };
    return labels[level];
  };

  const getStressLabel = (level) => {
    const labels = {
      1: 'Not Stressed At All',
      2: 'Not Stressed',
      3: 'Slightly Stressed',
      4: 'Somewhat Stressed',
      5: 'Stressed',
      6: 'Moderately Stressed',
      7: 'Quite Stressed',
      8: 'Very Stressed',
      9: 'Super Stressed',
      10: 'Extremely Stressed',
    };
    return labels[level];
  };

  const getMoodLabel = (level) => {
    const labels = {
      1: 'Poor',
      2: 'Somewhat Poor',
      3: 'Okay',
      4: 'Somewhat Happy',
      5: 'Happy',
    };
    return labels[level];
  };

  const getAnxietyColor = (level) => {
    if (level <= 3) return '#28a745';
    if (level <= 6) return '#ffc107';
    return '#dc3545';
  };

  const getStressColor = (level) => {
    if (level <= 3) return '#28a745';
    if (level <= 6) return '#ffc107';
    return '#dc3545';
  };

  const getMoodColor = (level) => {
    if (level >= 4) return '#28a745';
    if (level >= 3) return '#ffc107';
    return '#dc3545';
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Mood Rating</h1>
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

      {/* Rating Form */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
        <h2>How are you feeling today?</h2>
        <form onSubmit={handleSubmit}>
          
          {/* Anxiety Level */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
              Anxiety Level: <span style={{ color: getAnxietyColor(formData.anxiety_level) }}>{getAnxietyLabel(formData.anxiety_level)}</span>
            </label>
            <input
              type="range"
              name="anxiety_level"
              min="1"
              max="10"
              value={formData.anxiety_level}
              onChange={handleChange}
              style={{ width: '100%', height: '8px', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px' }}>
              <span>1 (Not Anxious)</span>
              <span>10 (Extremely Anxious)</span>
            </div>
          </div>

          {/* Stress Level */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
              Stress Level: <span style={{ color: getStressColor(formData.stress_level) }}>{getStressLabel(formData.stress_level)}</span>
            </label>
            <input
              type="range"
              name="stress_level"
              min="1"
              max="10"
              value={formData.stress_level}
              onChange={handleChange}
              style={{ width: '100%', height: '8px', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px' }}>
              <span>1 (Not Stressed)</span>
              <span>10 (Extremely Stressed)</span>
            </div>
          </div>

          {/* Overall Mood */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
              Overall Mood: <span style={{ color: getMoodColor(formData.overall_mood) }}>{getMoodLabel(formData.overall_mood)}</span>
            </label>
            <input
              type="range"
              name="overall_mood"
              min="1"
              max="5"
              value={formData.overall_mood}
              onChange={handleChange}
              style={{ width: '100%', height: '8px', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px' }}>
              <span>1 (Poor)</span>
              <span>5 (Happy)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {submitting ? 'Saving...' : 'Save Mood Rating'}
          </button>
        </form>
      </div>

      {/* Past Ratings */}
      <div>
        <h2>Past Ratings ({entries.length})</h2>
        
        {entries.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: 0 }}>
              No mood ratings yet. Log your first rating above!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  border: '1px solid #ddd'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#17a2b8', marginBottom: '15px' }}>
                  {new Date(entry.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>Anxiety:</strong></span>
                    <span style={{ color: getAnxietyColor(entry.anxiety_level), fontWeight: 'bold' }}>
                      {entry.anxiety_level}/10 - {getAnxietyLabel(entry.anxiety_level)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>Stress:</strong></span>
                    <span style={{ color: getStressColor(entry.stress_level), fontWeight: 'bold' }}>
                      {entry.stress_level}/10 - {getStressLabel(entry.stress_level)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>Overall Mood:</strong></span>
                    <span style={{ color: getMoodColor(entry.overall_mood), fontWeight: 'bold' }}>
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