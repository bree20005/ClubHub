import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate 
} from 'react-router-dom';
import Feed from './components/Feed';
import Polls from './components/Polls';
import Profile from './components/Profile';
import Calendar from './components/Calendar';
import CreateContentPage from './components/CreateContent';
import Login from './components/Login';
import './index.css';
import logo from './assets/logo.png';


const Logo = ({ logo }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/'); // Navigate to the home page
  };

  return <img src={logo} alt="Logo" className="logo" onClick={handleClick}/>;
};

function Layout() {
  const location = useLocation();
  const hideSidebar = location.pathname === '/login';

  return (
    <div className="app-container">
      {!hideSidebar && (
        <nav className="sidebar">
          <Logo logo={logo} className="logo"/>
          <ul>
            <li><Link to="/profile">My Profile</Link></li>
            <li><Link to="/">Feed</Link></li>
            <li><Link to="/calendar">Calendar</Link></li>
            <li><Link to="/create">Create Content</Link></li>
          </ul>
        </nav>
      )}

      <div className="profile-btn-container">
        <Link to="/profile" className="profile-btn">
          <i className="fas fa-user"></i> {/* FontAwesome Person Icon */}
        </Link>
      </div>

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Feed />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/create" element={<CreateContentPage />} />
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
