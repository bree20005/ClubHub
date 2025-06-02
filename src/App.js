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
import MyEvents from './components/MyEvents';
import ClubStream from './components/ClubStream';

import './index.css';
import logo from './components/assets/logo.png';

const Logo = ({ logo }) => {
  const navigate = useNavigate();
  const handleClick = () => navigate('/');
  return <img src={logo} alt="Logo" className="logo" onClick={handleClick} />;
};

function ProfileDropdown({ avatarUrl, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
let hoverTimeout;

const handleMouseEnter = () => {
  clearTimeout(hoverTimeout);
  setHovered(true);
};

const handleMouseLeave = () => {
  hoverTimeout = setTimeout(() => setHovered(false), 200); // Delay to allow movement
};

  return (
    <div
  style={{
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 1000,
  }}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
  <div
    style={{
      position: 'relative',
      display: 'inline-block',
    }}
  >
    <img
      src={avatarUrl}
      alt="Avatar"
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover',
        boxShadow: '0 0 5px rgba(0,0,0,0.1)',
        cursor: 'pointer',
      }}
    />

{hovered && (
  <div
    style={{
      position: 'absolute',
      top: '110%',
      right: 0,
      backgroundColor: '#1f0c44',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      padding: '0.25rem 0.5rem',
      textAlign: 'left',
      color: '#FFFFFF',
      width: '140px',
      fontSize: '0.85rem',
    }}
  >
    <div
      className="profile-option"
      onClick={() => navigate('/profile')}
      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
    >
      Profile
    </div>
    <div
      className="profile-option"
      onClick={() => {
        navigate('/myevents');
        setOpen(false);
      }}
      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
    >
      My Events
    </div>
    <div
      className="profile-option"
      onClick={() => {
        onLogout();
        navigate('/login', { replace: true });
      }}
    >
      Logout
    </div>
  </div>
)}
  </div>
</div>
  );
}

function Sidebar({ onClubSelect, selectedClub }) {
  return (
    <nav className="sidebar">
      <Logo logo={logo} />
      <ul>
        {/* <li><Link to="/feed">Feed (remove when club-feed done)</Link></li> */}
        {/* <li><Link to="/myevents">My Events</Link></li> */}
        {/* <li><Link to="/calendar">Calendar</Link></li> */}
        {/* <li><Link to="/create">Create Content</Link></li> */}
        <li style={{marginTop: '10px', marginBottom: '-10px', fontSize: '0.9rem'}}><Link to="/club-stream">🔮 Club Stream</Link></li>
      </ul>
      <SidebarClubLogos selectedClub={selectedClub} onClubSelect={onClubSelect} />
      <div className="plus-menu">
        <div className="plus-icon">＋</div>
        <div className="plus-options">
          <Link to="/join-club">Join Club</Link>
          <Link to="/start-club">Start Club</Link>
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

function ConditionalFeedRedirect({ selectedClub, setSelectedClub }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedClub) {
      navigate('/club-stream', { replace: true });
    }
  }, [selectedClub]);

  if (!selectedClub) return null;

  return <Feed selectedClub={selectedClub} setSelectedClub={setSelectedClub} />;
}

function Layout() {
  const location = useLocation();
  const [selectedClub, setSelectedClub] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const hideSidebar = location.pathname === '/' || location.pathname === '/login';

  useEffect(() => {
    const fetchAvatar = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();

        setAvatarUrl(profile?.avatar_url || '');
      }
    };
    fetchAvatar();
  }, []);

  return (
    <div className="app-container">
      {!hideSidebar && <Sidebar selectedClub={selectedClub} onClubSelect={setSelectedClub} />}
      {!hideSidebar && (
        <ProfileDropdown
          avatarUrl={avatarUrl || 'https://via.placeholder.com/40'}
          onLogout={async () => {
            await supabase.auth.signOut();
            window.location.reload();
          }}
        />
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
          {/* <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed selectedClub={selectedClub} setSelectedClub={setSelectedClub} />
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <ConditionalFeedRedirect
                  selectedClub={selectedClub}
                  setSelectedClub={setSelectedClub}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/myevents"
            element={
              <ProtectedRoute>
                <MyEvents />
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
          <Route path="/feed/:clubId" element={<Feed />} />
          <Route path="/club-stream" element={<ClubStream />} />
          
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
