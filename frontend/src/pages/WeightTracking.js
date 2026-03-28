import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const WeightTracking = () => {
  const [entries, setEntries] = useState([]);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    weight: '',
    calorie_intake: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch profile for target calories
      const profileResponse = await api.get('accounts/profile/');
      setProfile(profileResponse.data);

      // Fetch weight entries
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
      });

      // Add new entry to the beginning of the list
      setEntries([response.data, ...entries]);
      
      // Reset form
      setFormData({
        weight: '',
        calorie_intake: '',
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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Weight Tracking</h1>
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

      {/* Target Calories Reminder */}
      {profile && (
        <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px', border: '1px solid #007bff' }}>
          <p style={{ margin: 0, color: '#007bff' }}>
            <strong>Your Daily Target:</strong> {profile.target_calories} calories
          </p>
        </div>
      )}

      {/* Log New Entry Form */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
        <h2>Log Today's Entry</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Weight (kg):
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                step="0.1"
                min="1"
                placeholder="e.g., 75.5"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Calorie Intake (today):
              </label>
              <input
                type="number"
                name="calorie_intake"
                value={formData.calorie_intake}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g., 2000"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {submitting ? 'Logging...' : 'Log Entry'}
          </button>
        </form>
      </div>

      {/* Weight Progress Graph */}
      {entries.length > 0 && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
          <h2>Weight Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[...entries].reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']}
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`${value} kg`, 'Weight']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#28a745" 
                strokeWidth={2}
                dot={{ fill: '#28a745', r: 4 }}
                name="Weight"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Calorie Adherence Graph */}
      {entries.length > 0 && profile && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
          <h2>Calorie Adherence</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[...entries].reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                label={{ value: 'Calories', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`${value} cal`, 'Intake']}
              />
              <Legend />
              <ReferenceLine 
                y={profile.target_calories} 
                stroke="#007bff" 
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: `Target: ${profile.target_calories}`, position: 'right', fill: '#007bff' }}
              />
              <Bar 
                dataKey="calorie_intake" 
                fill="#28a745"
                name="Calorie Intake"
              />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            <p style={{ margin: '5px 0' }}>
              <span style={{ color: '#007bff', fontWeight: 'bold' }}>Blue dashed line</span> = Your target ({profile.target_calories} cal/day)
            </p>
            <p style={{ margin: '5px 0' }}>
              Bars above the line = over target | Bars below the line = under target
            </p>
          </div>
        </div>
      )}
      {/* Weight History */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2>Weight History</h2>
        
        {entries.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            No entries yet. Log your first entry above!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Weight</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Calories</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>vs Target</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const diff = getCalorieDifference(entry.calorie_intake);
                  return (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>
                        {entry.weight} kg
                        {index > 0 && (
                          <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '12px',
                            color: entry.weight < entries[index - 1].weight ? '#28a745' : entry.weight > entries[index - 1].weight ? '#dc3545' : '#666'
                          }}>
                            {entry.weight < entries[index - 1].weight ? '↓' : entry.weight > entries[index - 1].weight ? '↑' : '→'}
                            {' '}
                            {Math.abs(entry.weight - entries[index - 1].weight).toFixed(1)} kg
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>{entry.calorie_intake} cal</td>
                      <td style={{ 
                        padding: '12px',
                        color: diff < 0 ? '#28a745' : diff > 0 ? '#dc3545' : '#666',
                        fontWeight: 'bold'
                      }}>
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