import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './components/supabase';

import Feed from './components/Feed';
import Polls from './components/Polls';
import Profile from './components/Profile';
import Calendar from './components/Calendar';
import Register from './components/Register.js';
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
import LoginNew from './components/LoginNew.js';

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
    hoverTimeout = setTimeout(() => setHovered(false), 200);
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
                navigate('/loginnew', { replace: true });
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
        <li style={{ marginTop: '10px', marginBottom: '-10px', fontSize: '0.9rem' }}>
          <Link to="/club-stream">🔮 Club Stream</Link>
        </li>
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
//seeing if user has a profile so we can switch pages
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile || !profile.full_name) {
        // creating profile here
        setRedirectPath('/create-profile');
      } else {
        // joining clubs here
        const { data: memberships, error: membershipError } = await supabase
          .from('user_clubs')
          .select('club_id')
          .eq('user_id', userId)
          .limit(1);

        if (membershipError || !memberships || memberships.length === 0) {
          // User needs to join a club
          setRedirectPath('/join-or-create-club');
        } else {
          setRedirectPath('/club-stream');
        }
      }

      setLoading(false);
    };

    checkUserProfile();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
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

  if (loading) return <div>Loading...</div>;

  return loggedIn ? children : <Navigate to="/loginnew" replace />;
}

function Layout() {
  const location = useLocation();
  const [selectedClub, setSelectedClub] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const hideSidebar = location.pathname === '/' || location.pathname === '/loginnew' || location.pathname === '/register';

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="app-container">
      {!hideSidebar && <Sidebar selectedClub={selectedClub} onClubSelect={setSelectedClub} />}
      {!hideSidebar && (
        <ProfileDropdown
          avatarUrl={avatarUrl || 'https://via.placeholder.com/40'}
          onLogout={handleLogout}
        />
      )}
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <AuthRedirect>
                <LoginNew />
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

          <Route 
            path="/myevents" 
            element={
              <ProtectedRoute>
                <MyEvents />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/create-profile" 
            element={
              <ProtectedRoute>
                <CreateProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/join-or-create-club" 
            element={
              <ProtectedRoute>
                <JoinOrCreateClubPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/start-club" 
            element={
              <ProtectedRoute>
                <StartClubPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/polls" 
            element={
              <ProtectedRoute>
                <Polls />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/LikeButton" element={<LikeButton />} />
          
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreateContentPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/club-success" 
            element={
              <ProtectedRoute>
                <ClubSuccessPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/join-club" 
            element={
              <ProtectedRoute>
                <JoinClubPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/feed/:clubId" 
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/club-stream" 
            element={
              <ProtectedRoute>
                <ClubStream />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/register" element={<Register />} />
          <Route path="/loginNew" element={<LoginNew />} />
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