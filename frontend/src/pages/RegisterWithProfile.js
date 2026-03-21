import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RegisterWithProfile = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Account
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Profile
    age: '',
    gender: '',
    weight: '',
    height: '',
    activity_level: '',
    goal: '',
    target_date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    try {
      const response = await api.get(`accounts/check-username/?username=${username}`);
      setUsernameAvailable(response.data.available);
    } catch (error) {
      setUsernameAvailable(null);
    }
    setUsernameChecking(false);
  };

  const checkEmailAvailability = async (email) => {
    if (!email || email.length < 5) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    try {
      const response = await api.get(`accounts/check-email/?email=${email}`);
      setEmailAvailable(response.data.available);
    } catch (error) {
      setEmailAvailable(null);
    }
    setEmailChecking(false);
  };

  // Debounce function to avoid checking on every keystroke
  let usernameTimeout;
  const handleUsernameChange = (e) => {
    const username = e.target.value;
    setFormData({ ...formData, username });
    
    clearTimeout(usernameTimeout);
    
    usernameTimeout = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);
  };

  let emailTimeout;
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    
    clearTimeout(emailTimeout);
    
    emailTimeout = setTimeout(() => {
      checkEmailAvailability(email);
    }, 500);
  };

  const calculateBMR = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);
    
    let bmr;
    if (formData.gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    // Apply activity level multiplier
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'very': 1.725,
      'extra': 1.9,
    };
    
    const dailyCalories = bmr * activityMultipliers[formData.activity_level];
    
    // Apply goal adjustment
    let targetCalories;
    if (formData.goal === 'lose') {
      targetCalories = dailyCalories - 300;
    } else if (formData.goal === 'gain') {
      targetCalories = dailyCalories + 300;
    } else {
      targetCalories = dailyCalories;
    }
    
    return {
      bmr: Math.round(bmr),
      target_calories: Math.round(targetCalories),
    };
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (usernameAvailable === false) {
      setError('Please choose an available username');
      return;
    }

    if (emailAvailable === false) {
      setError('Please use an available email address');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Calculate BMR and target calories
      const { bmr, target_calories } = calculateBMR();

      // Step 1: Register user
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (!result.success) {
        if (typeof result.error === 'object') {
          const errorMessages = Object.entries(result.error)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          setError(errorMessages);
        } else {
          setError(result.error);
        }
        setLoading(false);
        setStep(1);
        return;
      }

      // Step 2: Create user profile
      await api.post('accounts/profile/', {
        age: parseInt(formData.age),
        gender: formData.gender,
        weight: parseFloat(formData.weight),
        height: parseInt(formData.height),
        activity_level: formData.activity_level,
        bmr: bmr,
        goal: formData.goal,
        target_date: formData.target_date || null,
        target_calories: target_calories,
      });

      navigate('/dashboard');
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          setError(errorMessages);
        } else {
          setError(errorData);
        }
      } else {
        setError('Registration failed. Please try again.');
      }
      setLoading(false);
      setStep(1);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <h2>Register for MindFit</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Step {step} of 2
      </p>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px', whiteSpace: 'pre-line' }}>
          {error}
        </div>
      )}
      
      {step === 1 && (
        <form onSubmit={handleStep1Submit}>
          <h3 style={{ marginBottom: '15px' }}>Account Information</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleUsernameChange}
              required
              minLength="3"
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px', 
                border: `1px solid ${
                  usernameAvailable === false ? '#dc3545' : 
                  usernameAvailable === true ? '#28a745' : 
                  '#ddd'
                }` 
              }}
            />
            {usernameChecking && (
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                Checking availability...
              </small>
            )}
            {usernameAvailable === false && (
              <small style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>
                ❌ This username is already taken
              </small>
            )}
            {usernameAvailable === true && (
              <small style={{ color: '#28a745', display: 'block', marginTop: '5px' }}>
                ✓ Username available
              </small>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleEmailChange}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px', 
                border: `1px solid ${
                  emailAvailable === false ? '#dc3545' : 
                  emailAvailable === true ? '#28a745' : 
                  '#ddd'
                }` 
              }}
            />
            {emailChecking && (
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                Checking availability...
              </small>
            )}
            {emailAvailable === false && (
              <small style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>
                ❌ This email is already registered
              </small>
            )}
            {emailAvailable === true && (
              <small style={{ color: '#28a745', display: 'block', marginTop: '5px' }}>
                ✓ Email available
              </small>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <button 
            type="submit"
            disabled={usernameAvailable === false || emailAvailable === false}
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: (usernameAvailable === false || emailAvailable === false) ? '#ccc' : '#28a745', 
              color: 'white', 
              border: 'none', 
              cursor: (usernameAvailable === false || emailAvailable === false) ? 'not-allowed' : 'pointer',
              borderRadius: '4px'
            }}
          >
            Next: Profile Setup
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit}>
          <h3 style={{ marginBottom: '15px' }}>Profile & Goals</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Age:</label>
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Biological Sex (assigned at birth):
              <small style={{ display: 'block', color: '#666', fontWeight: 'normal' }}>
                Required for accurate BMR calculation
              </small>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Select...</option>
              <option value="male">Male (assigned at birth)</option>
              <option value="female">Female (assigned at birth)</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Current Weight (kg):</label>
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Height (cm):</label>
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Activity Level:</label>
            <select
              name="activity_level"
              value={formData.activity_level}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Select...</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Lightly active (1-3 days/week)</option>
              <option value="moderate">Moderately active (3-5 days/week)</option>
              <option value="very">Very active (6-7 days/week)</option>
              <option value="extra">Extra active (very intense exercise daily)</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Goal:</label>
            <select
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Select...</option>
              <option value="lose">Weight Loss (-300 calories/day)</option>
              <option value="gain">Weight Gain (+300 calories/day)</option>
              <option value="maintain">Maintain Weight</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Target Date (optional):
            </label>
            <input
              type="date"
              name="target_date"
              value={formData.target_date}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button"
              onClick={() => setStep(1)}
              style={{ 
                flex: 1,
                padding: '10px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Back
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{ 
                flex: 2,
                padding: '10px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: '4px'
              }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      )}

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default RegisterWithProfile;