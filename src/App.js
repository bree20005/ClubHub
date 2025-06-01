import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './components/supabase';

import Feed from './components/Feed';
import Polls from './components/Polls';
import Profile from './components/Profile';
import Calendar from './components/Calendar';
import CreateContentPage from './components/CreateContent';
import LoginPage from './components/Login';
import CreateProfilePage from './components/CreateProfilePage';
import JoinOrCreateClubPage from './components/JoinOrCreateClubPage';
import StartClubPage from './components/StartClubPage';
import ClubSuccessPage from './components/ClubSuccessPage';
import JoinClubPage from './components/JoinClubPage';
import SidebarClubLogos from './components/SidebarClubLogos';
import LikeButton from './components/LikeButton.js';

import './index.css';
import logo from './assets/logo.png';

const Logo = ({ logo }) => {
  const navigate = useNavigate();
  const handleClick = () => navigate('/');
  return <img src={logo} alt="Logo" className="logo" onClick={handleClick} />;
};

function Sidebar({ onClubSelect, selectedClub }) {
  return (
    <nav className="sidebar">
      <Logo logo={logo} />
      <ul>
        <li><Link to="/profile">My Profile</Link></li>
        <li><Link to="/feed">Feed</Link></li>
        <li><Link to="/calendar">Calendar</Link></li>
        <li><Link to="/create">Create Content</Link></li>
      </ul>
      <SidebarClubLogos selectedClub={selectedClub} onClubSelect={onClubSelect} />
      <div className="plus-menu">
        <div className="plus-icon">＋</div>
        <div className="plus-options">
          <Link to="/join-club">Join a Club</Link>
          <Link to="/start-club">Start a Club</Link>
        </div>
      </div>
    </nav>
  );
}

function AuthRedirect({ children }) {
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      // Check if user has a profile in the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        setRedirectPath('/create-profile');
      } else {
        setRedirectPath('/feed');
      }

      setLoading(false);
    };

    checkUserProfile();
  }, []);

  if (loading) return null;

  if (redirectPath && (location.pathname === '/' || location.pathname === '/login')) {
    return <Navigate to={redirectPath} />;
  }

  return children;
}


function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setLoggedIn(!!session);
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) return null;

  return loggedIn ? children : <Navigate to="/login" />;
}

function Layout() {
  const location = useLocation();
  const [selectedClub, setSelectedClub] = useState('');
  const hideSidebar = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="app-container">
      {!hideSidebar && <Sidebar selectedClub={selectedClub} onClubSelect={setSelectedClub} />}
      {!hideSidebar && (
        <div className="profile-btn-container">
          <Link to="/profile" className="profile-btn">
            <i className="fas fa-user"></i>
          </Link>
        </div>
      )}
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <AuthRedirect>
                <LoginPage />
              </AuthRedirect>
            }
          />
          <Route
            path="/login"
            element={
              <AuthRedirect>
                <LoginPage />
              </AuthRedirect>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed selectedClub={selectedClub} setSelectedClub={setSelectedClub} />
              </ProtectedRoute>
            }
          />
          <Route path="/create-profile" element={<CreateProfilePage />} />
          <Route path="/join-or-create-club" element={<JoinOrCreateClubPage />} />
          <Route path="/start-club" element={<StartClubPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/LikeButton" element={<LikeButton />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/create" element={<CreateContentPage />} />
          <Route path="/club-success" element={<ClubSuccessPage />} />
          <Route path="/join-club" element={<JoinClubPage />} />
          
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
