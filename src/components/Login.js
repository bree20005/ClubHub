// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Fake login logic
    navigate('/'); // Redirect to main page
  };

  return (
    <div className="login-page">
      <h1>Welcome to Club Hub</h1>
      <form onSubmit={handleLogin} className="login-form">
        <label>
          Email:
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@club.com"
          />
        </label>

        <label>
          Password:
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login;
