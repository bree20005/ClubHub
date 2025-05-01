import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Feed from './components/Feed';
import Polls from './components/Polls';
import Calendar from './components/Calendar';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <h2>Club Hub</h2>
          <ul>
            <li><Link to="/">Feed</Link></li>
            <li><Link to="/polls">Polls</Link></li>
            <li><Link to="/calendar">Calendar</Link></li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/polls" element={<Polls />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
