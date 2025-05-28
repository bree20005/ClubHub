import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/feed" element={<Feed selectedClub={selectedClub} setSelectedClub={setSelectedClub} />} />
          <Route path="/create-profile" element={<CreateProfilePage />} />
          <Route path="/join-or-create-club" element={<JoinOrCreateClubPage />} />
          <Route path="/start-club" element={<StartClubPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/polls" element={<Polls />} />
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
