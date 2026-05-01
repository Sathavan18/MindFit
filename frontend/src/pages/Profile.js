import { useState, useEffect } from 'react';
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

  const calculateTDEE = (bmr, activityLevel) => {
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'very': 1.725,
      'extra': 1.9,
    };
    return bmr * activityMultipliers[activityLevel];
  };

  const calculateTargetCalories = (bmr, activityLevel, goal) => {
    const dailyCalories = calculateTDEE(bmr, activityLevel);
    
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
      <div className="page-container">
        <div className="text-center">
          <p className="text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container">
        <div className="card">
          <h2>No Profile Found</h2>
          <p className="text-muted">Please complete your profile setup.</p>
        </div>
      </div>
    );
  }

  const tdee = Math.round(calculateTDEE(profile.bmr, profile.activity_level));

  return (
    <div className="page-container">
      <h1 className="mb-40">My Profile</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Summary Cards */}
      <div className="profile-summary">
        <div className="profile-summary-card">
          <div className="profile-summary-label">BMR</div>
          <div className="profile-summary-value">{profile.bmr}</div>
          <div className="profile-summary-sublabel">cal/day at rest</div>
        </div>

        <div className="profile-summary-card">
          <div className="profile-summary-label">TDEE</div>
          <div className="profile-summary-value">{tdee}</div>
          <div className="profile-summary-sublabel">total daily expenditure</div>
        </div>

        <div className="profile-summary-card" style={{ background: 'rgba(0, 113, 227, 0.15)', borderColor: 'var(--primary)' }}>
          <div className="profile-summary-label" style={{ color: 'var(--primary)' }}>Target Calories</div>
          <div className="profile-summary-value" style={{ color: 'var(--primary)' }}>{profile.target_calories}</div>
          <div className="profile-summary-sublabel" style={{ color: 'var(--primary)' }}>your daily goal</div>
        </div>

        <div className="profile-summary-card">
          <div className="profile-summary-label">Current Weight</div>
          <div className="profile-summary-value">{profile.weight}</div>
          <div className="profile-summary-sublabel">kg</div>
        </div>

        <div className="profile-summary-card">
          <div className="profile-summary-label">Goal</div>
          <div className="profile-summary-value" style={{ fontSize: '20px', textTransform: 'capitalize' }}>
            {profile.goal === 'lose' ? 'Lose Weight' : profile.goal === 'gain' ? 'Gain Weight' : 'Maintain'}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="profile-details">
        <div className="profile-details-header">
          <h2 style={{ margin: 0 }}>Profile Details</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-primary">
              Edit Profile
            </button>
          )}
        </div>

        {!editing ? (
          // View Mode
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-label">Age:</span>
              <span className="profile-info-value">{profile.age} years</span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Gender:</span>
              <span className="profile-info-value">{profile.gender === 'male' ? 'Male' : 'Female'} (assigned at birth)</span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Height:</span>
              <span className="profile-info-value">{profile.height} cm</span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Activity Level:</span>
              <span className="profile-info-value">
                {profile.activity_level === 'sedentary' && 'Sedentary (little or no exercise)'}
                {profile.activity_level === 'light' && 'Lightly active (1-3 days/week)'}
                {profile.activity_level === 'moderate' && 'Moderately active (3-5 days/week)'}
                {profile.activity_level === 'very' && 'Very active (6-7 days/week)'}
                {profile.activity_level === 'extra' && 'Extra active (very intense exercise daily)'}
              </span>
            </div>

            {profile.target_date && (
              <div className="profile-info-item">
                <span className="profile-info-label">Target Date:</span>
                <span className="profile-info-value">{new Date(profile.target_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit}>
            <div className="profile-form-grid">
              <div className="form-group">
                <label className="form-label">Age:</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="1"
                  max="120"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biological Sex (assigned at birth):</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
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
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Height (cm):</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  min="1"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Activity Level:</label>
                <select
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Lightly active (1-3 days/week)</option>
                  <option value="moderate">Moderately active (3-5 days/week)</option>
                  <option value="very">Very active (6-7 days/week)</option>
                  <option value="extra">Extra active (very intense exercise daily)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Goal:</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="lose">Weight Loss (-300 calories/day)</option>
                  <option value="gain">Weight Gain (+300 calories/day)</option>
                  <option value="maintain">Maintain Weight</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Date (optional):</label>
                <input
                  type="date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="profile-form-actions">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-success"
                style={{ flex: 1 }}
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