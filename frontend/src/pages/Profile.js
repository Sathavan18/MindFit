import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    activity_level: '',
    goal: '',
    target_date: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('accounts/profile/');
      setProfile(response.data);
      setFormData({
        age: response.data.age,
        gender: response.data.gender,
        weight: response.data.weight,
        height: response.data.height,
        activity_level: response.data.activity_level,
        goal: response.data.goal,
        target_date: response.data.target_date || '',
      });
      setLoading(false);
    } catch (error) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateBMR = (weight, height, age, gender) => {
    if (gender === 'male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };

  const calculateTargetCalories = (bmr, activityLevel, goal) => {
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'very': 1.725,
      'extra': 1.9,
    };
    
    const dailyCalories = bmr * activityMultipliers[activityLevel];
    
    if (goal === 'lose') {
      return dailyCalories - 300;
    } else if (goal === 'gain') {
      return dailyCalories + 300;
    } else {
      return dailyCalories;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Calculate new BMR and target calories
      const bmr = calculateBMR(
        parseFloat(formData.weight),
        parseInt(formData.height),
        parseInt(formData.age),
        formData.gender
      );

      const targetCalories = calculateTargetCalories(
        bmr,
        formData.activity_level,
        formData.goal
      );

      // Update profile
      const response = await api.put('accounts/profile/', {
        age: parseInt(formData.age),
        gender: formData.gender,
        weight: parseFloat(formData.weight),
        height: parseInt(formData.height),
        activity_level: formData.activity_level,
        bmr: Math.round(bmr),
        goal: formData.goal,
        target_date: formData.target_date || null,
        target_calories: Math.round(targetCalories),
      });

      setProfile(response.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setSaving(false);
    } catch (error) {
      setError('Failed to update profile');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current profile data
    setFormData({
      age: profile.age,
      gender: profile.gender,
      weight: profile.weight,
      height: profile.height,
      activity_level: profile.activity_level,
      goal: profile.goal,
      target_date: profile.target_date || '',
    });
    setEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>No Profile Found</h2>
        <p>Please complete your profile setup.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Profile</h1>
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

    {/* Summary Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>BMR</h3>
        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{profile.bmr} cal/day</p>
        <small style={{ color: '#666', fontSize: '12px' }}>Basal Metabolic Rate</small>
    </div>
    
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>TDEE</h3>
        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
        {Math.round(profile.bmr * (
            profile.activity_level === 'sedentary' ? 1.2 :
            profile.activity_level === 'light' ? 1.375 :
            profile.activity_level === 'moderate' ? 1.55 :
            profile.activity_level === 'very' ? 1.725 :
            1.9
        ))} cal/day
        </p>
        <small style={{ color: '#666', fontSize: '12px' }}>Total Daily Energy Expenditure</small>
    </div>
    
    <div style={{ padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px', border: '2px solid #007bff' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#007bff' }}>Target Calories</h3>
        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{profile.target_calories} cal/day</p>
        <small style={{ color: '#007bff', fontSize: '12px' }}>Your daily goal</small>
    </div>
    
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Current Weight</h3>
        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{profile.weight} kg</p>
    </div>
    
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Goal</h3>
        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', textTransform: 'capitalize' }}>
        {profile.goal === 'lose' ? 'Lose Weight' : profile.goal === 'gain' ? 'Gain Weight' : 'Maintain'}
        </p>
    </div>
    </div>

      {/* Profile Details */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Profile Details</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {!editing ? (
          // View Mode
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <strong>Age:</strong> {profile.age} years
            </div>
            <div>
              <strong>Gender:</strong> {profile.gender === 'male' ? 'Male' : 'Female'} (assigned at birth)
            </div>
            <div>
              <strong>Height:</strong> {profile.height} cm
            </div>
            <div>
              <strong>Activity Level:</strong>{' '}
              {profile.activity_level === 'sedentary' && 'Sedentary (little or no exercise)'}
              {profile.activity_level === 'light' && 'Lightly active (1-3 days/week)'}
              {profile.activity_level === 'moderate' && 'Moderately active (3-5 days/week)'}
              {profile.activity_level === 'very' && 'Very active (6-7 days/week)'}
              {profile.activity_level === 'extra' && 'Extra active (very intense exercise daily)'}
            </div>
            {profile.target_date && (
              <div>
                <strong>Target Date:</strong> {new Date(profile.target_date).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Age:</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="1"
                  max="120"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Biological Sex (assigned at birth):
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Weight (kg):</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  step="0.1"
                  min="1"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Height (cm):</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  min="1"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Activity Level:</label>
                <select
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Lightly active (1-3 days/week)</option>
                  <option value="moderate">Moderately active (3-5 days/week)</option>
                  <option value="very">Very active (6-7 days/week)</option>
                  <option value="extra">Extra active (very intense exercise daily)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Goal:</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="lose">Weight Loss (-300 calories/day)</option>
                  <option value="gain">Weight Gain (+300 calories/day)</option>
                  <option value="maintain">Maintain Weight</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Target Date (optional):</label>
                <input
                  type="date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;