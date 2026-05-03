import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterWithProfile from './pages/RegisterWithProfile';
import Profile from './pages/Profile';
import WeightTracking from './pages/WeightTracking';
import Journal from './pages/Journal';
import MoodRating from './pages/MoodRating';
import Meditation from './pages/Meditation';
import Articles from './pages/Articles';
import Progress from './pages/Progress';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterWithProfile />} />
            
            {/* Protected Routes with Navbar */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Dashboard />
                  </>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Profile />
                  </>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/weight-tracking" 
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <WeightTracking />
                  </>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mood" 
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <MoodRating />
                  </>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/journal" 
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Journal />
                  </>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/meditation" 
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Meditation />
                  </>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/articles" 
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Articles />
                  </>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/progress" 
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Progress />
                  </>
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