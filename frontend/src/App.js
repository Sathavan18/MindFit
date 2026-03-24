import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterWithProfile from './pages/RegisterWithProfile';
import Profile from './pages/Profile';
import WeightTracking from './pages/WeightTracking';
import Journal from './pages/Journal';
import MoodRating from './pages/MoodRating';
import Meditation from './pages/Meditation';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterWithProfile />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/weight-tracking" 
              element={
                <PrivateRoute>
                  <WeightTracking />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/journal" 
              element={
                <PrivateRoute>
                  <Journal />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mood" 
              element={
                <PrivateRoute>
                  <MoodRating />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/meditation" 
              element={
                <PrivateRoute>
                  <Meditation />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;