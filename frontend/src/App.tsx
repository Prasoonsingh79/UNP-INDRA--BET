import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar.tsx';
import Home from './components/Home.tsx';
import Login from './components/Login.tsx';
import Register from './components/Register.tsx';
import CreateBet from './components/CreateBet.tsx';
import ActivityTicker from './components/ActivityTicker.tsx';
import Admin from './pages/Admin.tsx';
import History from './pages/History.tsx';
import Leaderboard from './pages/Leaderboard.tsx';
import MarketDetail from './pages/MarketDetail.tsx';
import Portfolio from './pages/Portfolio.tsx';
import Profile from './pages/Profile.tsx';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <Router>
      {user && <Navbar />}
      {user && <ActivityTicker />}
      <div className={user ? 'app-wrapper' : ''}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreateBet /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/markets/:slug" element={<PrivateRoute><MarketDetail /></PrivateRoute>} />
          <Route path="/portfolio" element={<PrivateRoute><Portfolio /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
