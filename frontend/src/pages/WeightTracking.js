import { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const WeightTracking = () => {
  const [entries, setEntries] = useState([]);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    weight: '',
    calorie_intake: '',
    date: new Date().toISOString().split('T')[0],  // ← ADD THIS
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileResponse = await api.get('accounts/profile/');
      setProfile(profileResponse.data);

      const entriesResponse = await api.get('physical/weight/');
      setEntries(entriesResponse.data);
      
      setLoading(false);
    } catch (error) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await api.post('physical/weight/', {
        weight: parseFloat(formData.weight),
        calorie_intake: parseInt(formData.calorie_intake),
        date: formData.date,  // ← ADD THIS
      });

      setEntries([response.data, ...entries]);
      
      setFormData({
        weight: '',
        calorie_intake: '',
        date: new Date().toISOString().split('T')[0],  // ← RESET TO TODAY
      });
      
      setSuccess('Weight entry logged successfully!');
      setSubmitting(false);
    } catch (error) {
      setError('Failed to log weight entry');
      setSubmitting(false);
    }
  };

  const getCalorieDifference = (intake) => {
    if (!profile) return 0;
    return intake - profile.target_calories;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center">
          <p className="text-muted">Loading weight data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="mb-40">Weight Tracking</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Target Calories Banner */}
      {profile && (
        <div className="weight-target-banner">
          <p><strong>Your Daily Target:</strong> {profile.target_calories} calories</p>
        </div>
      )}

      {/* Log New Entry Form */}
      <div className="weight-form-card">
        <h2>Log Weight Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="weight-form-grid">
            {/* ← ADD DATE PICKER HERE */}
            <div className="form-group">
              <label className="form-label">Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weight (kg):</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                step="0.1"
                min="1"
                placeholder="e.g., 75.5"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Calorie Intake:</label>
              <input
                type="number"
                name="calorie_intake"
                value={formData.calorie_intake}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g., 2000"
                className="form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-success btn-full-width btn-large"
          >
            {submitting ? 'Logging...' : 'Log Entry'}
          </button>
        </form>
      </div>

      {/* Weight Progress Graph */}
      {entries.length > 0 && (
        <div className="weight-graph-card">
          <h2>Weight Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[...entries].reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="var(--text-secondary)"
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']}
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
                stroke="var(--text-secondary)"
              />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`${value} kg`, 'Weight']}
                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="var(--success)" 
                strokeWidth={3}
                dot={{ fill: 'var(--success)', r: 5 }}
                name="Weight"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Calorie Adherence Graph */}
      {entries.length > 0 && profile && (
        <div className="weight-graph-card">
          <h2>Calorie Adherence</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[...entries].reverse().map(entry => ({
              ...entry,
              fill: entry.calorie_intake > profile.target_calories ? '#ff3b30' : '#34c759'
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="var(--text-secondary)"
              />
              <YAxis 
                label={{ value: 'Calories', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
                stroke="var(--text-secondary)"
              />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const intake = payload[0].payload.calorie_intake;
                    const diff = intake - profile.target_calories;
                    return (
                      <div style={{ 
                        backgroundColor: 'var(--surface)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        <p style={{ margin: 0, color: 'var(--text)', fontWeight: 'bold' }}>
                          {intake} cal
                        </p>
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          fontSize: '13px',
                          color: diff > 0 ? 'var(--danger)' : diff < 0 ? 'var(--success)' : 'var(--muted)'
                        }}>
                          {diff > 0 ? '+' : ''}{diff} cal vs target
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <ReferenceLine 
                y={profile.target_calories} 
                stroke="var(--primary)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: `Target: ${profile.target_calories}`, position: 'right', fill: 'var(--primary)' }}
              />
              <Bar 
                dataKey="calorie_intake" 
                name="Calorie Intake"
                radius={[8, 8, 0, 0]}
              >
                {[...entries].reverse().map((entry, index) => (
                  <rect
                    key={`bar-${index}`}
                    fill={entry.calorie_intake > profile.target_calories ? '#ff3b30' : '#34c759'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-16 text-small text-muted text-center">
            <p><span style={{ color: 'var(--primary)' }}>Blue dashed line</span> = Your target ({profile.target_calories} cal/day)</p>
            <p><span style={{ color: 'var(--success)' }}>Green bars</span> = Under/at target | <span style={{ color: 'var(--danger)' }}>Red bars</span> = Over target</p>
          </div>
        </div>
      )}

      {/* Weight History */}
      <div className="weight-history-card">
        <h2>Weight History</h2>
        
        {entries.length === 0 ? (
          <div className="weight-empty-state">
            <p>No entries yet. Log your first entry above!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Calories</th>
                  <th>vs Target</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const diff = getCalorieDifference(entry.calorie_intake);
                  return (
                    <tr key={entry.id}>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>
                        <strong>{entry.weight} kg</strong>
                        {index > 0 && (
                          <span className={`weight-change-indicator ${
                            entry.weight < entries[index - 1].weight ? 'weight-change-down' :
                            entry.weight > entries[index - 1].weight ? 'weight-change-up' :
                            'weight-change-same'
                          }`}>
                            {entry.weight < entries[index - 1].weight ? '↓' : 
                             entry.weight > entries[index - 1].weight ? '↑' : '→'}
                            {' '}
                            {Math.abs(entry.weight - entries[index - 1].weight).toFixed(1)} kg
                          </span>
                        )}
                      </td>
                      <td>{entry.calorie_intake} cal</td>
                      <td className={
                        diff < 0 ? 'calorie-diff-negative' :
                        diff > 0 ? 'calorie-diff-positive' :
                        'calorie-diff-zero'
                      }>
                        {diff > 0 ? '+' : ''}{diff} cal
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightTracking;