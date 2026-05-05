import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Activity } from 'lucide-react';

const RegisterWithProfile = () => {
  const [step, setStep] = useState(1); // Track current step (1 = account, 2 = profile)
  const [formData, setFormData] = useState({
    // Step 1: Account credentials
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Health profile for BMR calculation
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activity_level: 'moderate',
    goal: 'maintain',
    target_date: '',
  });
  // Real-time validation states for username/email availability
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check username availability as user types (min 3 characters)
    if (name === 'username' && value.length >= 3) {
      checkUsernameAvailability(value);
    }

    // Check email availability as user types (must include @)
    if (name === 'email' && value.includes('@')) {
      checkEmailAvailability(value);
    }
  };

  // Call backend to check if username is already taken
  const checkUsernameAvailability = async (username) => {
    setCheckingUsername(true);
    try {
      const response = await api.get(`accounts/check-username/?username=${username}`);
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking username');
    }
    setCheckingUsername(false);
  };

  // Call backend to check if email is already registered
  const checkEmailAvailability = async (email) => {
    setCheckingEmail(true);
    try {
      const response = await api.get(`accounts/check-email/?email=${email}`);
      setEmailAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking email');
    }
    setCheckingEmail(false);
  };

  // Handle step 1 form submission (account details)
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check username availability before proceeding
    if (!usernameAvailable) {
      setError('Username is not available');
      return;
    }

    // Check email availability before proceeding
    if (!emailAvailable) {
      setError('Email is already in use');
      return;
    }

    // All validations passed, move to step 2
    setStep(2);
  };

  // Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
  // BMR = calories burned at rest per day
  const calculateBMR = (weight, height, age, gender) => {
    if (gender === 'male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };

  // Calculate target daily calories based on BMR, activity level, and goal
  const calculateTargetCalories = (bmr, activityLevel, goal) => {
    // Activity multipliers for TDEE (Total Daily Energy Expenditure)
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'very': 1.725,
      'extra': 1.9,
    };

    const dailyCalories = bmr * activityMultipliers[activityLevel];

    // Adjust calories based on goal (±300 cal deficit/surplus)
    if (goal === 'lose') {
      return dailyCalories - 300;
    } else if (goal === 'gain') {
      return dailyCalories + 300;
    } else {
      return dailyCalories;
    }
  };

  // Handle step 2 form submission (profile details) and complete registration
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Calculate BMR from user's physical data
      const bmr = calculateBMR(
        parseFloat(formData.weight),
        parseInt(formData.height),
        parseInt(formData.age),
        formData.gender
      );

      // Calculate personalised calorie target
      const targetCalories = calculateTargetCalories(
        bmr,
        formData.activity_level,
        formData.goal
      );

      // Step 1: Register user account
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // Step 2: Create user profile with health data
      await api.post('accounts/profile/', {
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

      // Registration complete, redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header with logo and title */}
        <div className="auth-header">
          <div className="auth-logo">
            <Activity size={40} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            {step === 1 ? 'Start your wellness journey' : 'Complete your profile'}
          </p>
        </div>

        {/* Progress indicator showing current step */}
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? 'auth-step-active' : ''}`}></div>
          <div className={`auth-step ${step >= 2 ? 'auth-step-active' : ''}`}></div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {step === 1 ? (
          // Step 1: Account creation form
          <form onSubmit={handleStep1Submit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength="3"
                className="form-input"
                placeholder="Choose a username"
              />
              {/* Real-time validation feedback */}
              {formData.username.length >= 3 && !checkingUsername && usernameAvailable !== null && (
                <div className={`auth-validation ${usernameAvailable ? 'auth-validation-success' : 'auth-validation-error'}`}>
                  {usernameAvailable ? '✓ Username available' : '✗ Username taken'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your email"
              />
              {/* Real-time validation feedback */}
              {formData.email.includes('@') && !checkingEmail && emailAvailable !== null && (
                <div className={`auth-validation ${emailAvailable ? 'auth-validation-success' : 'auth-validation-error'}`}>
                  {emailAvailable ? '✓ Email available' : '✗ Email already in use'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="form-input"
                placeholder="Create a password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large btn-full-width"
              disabled={!usernameAvailable || !emailAvailable}
            >
              Continue
            </button>
          </form>
        ) : (
          // Step 2: Health profile form (for BMR and calorie calculation)
          <form onSubmit={handleStep2Submit} className="auth-form">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="1"
                  max="120"
                  className="form-input"
                  placeholder="Your age"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender (assigned at birth)</label>
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
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  step="0.1"
                  min="1"
                  className="form-input"
                  placeholder="Your weight"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  min="1"
                  className="form-input"
                  placeholder="Your height"
                />
              </div>
            </div>

            {/* Activity level affects TDEE calculation */}
            <div className="form-group">
              <label className="form-label">Activity Level</label>
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

            {/* Goal affects calorie target (±300 cal) */}
            <div className="form-group">
              <label className="form-label">Goal</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="lose">Weight Loss</option>
                <option value="gain">Weight Gain</option>
                <option value="maintain">Maintain Weight</option>
              </select>
            </div>

            {/* Optional target date for goal */}
            <div className="form-group">
              <label className="form-label">Target Date (optional)</label>
              <input
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Back and submit buttons */}
            <div className="flex gap-12">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary btn-large"
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-large"
                style={{ flex: 1 }}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* Link to login page */}
        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterWithProfile;