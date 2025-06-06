import React, { useState } from "react";
import supabase from "../helper/supabaseclient";
import { Link, useNavigate } from "react-router-dom";

function LoginNew() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(error.message);
      setEmail("");
      setPassword("");
      return;
    }

    if (data) {
      navigate("/club-stream");
      window.location.reload();
    }
  };

  return (
    <div className="login-page">
      {/* Logo */}
      <img src={'components/assets/logo.png'} alt="ClubHub Logo" className="login-logo" />
      <h1 style={{marginBottom: '40px'}}>Join Your Community</h1>
      {/* <h2>@ ClubHub</h2> */}

      {message && <span className="error-message">{message}</span>}

      <form onSubmit={handleSubmit} className="login-form">
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder="Email"
          required
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit">Log in</button>
      </form>

      <div className="register-link">
        <span>Don't have an account? </span>
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
}

export default LoginNew;
