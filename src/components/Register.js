import React, { useState } from "react";
import supabase from "../helper/supabaseclient";
import { Link, useNavigate } from "react-router-dom";
import logo from './assets/logo.png';

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) {
      setMessage("User account created!");
      setTimeout(() => {
        navigate("/create-profile");
        window.location.reload();
      }, 1500);
    }

    setEmail("");
    setPassword("");
  };

  return (
    <div className="login-page">

      {/* Heading */}
      <h1 style={{ marginBottom: "40px" }}>Register</h1>

      {/* Feedback Message */}
      {message && <span className="error-message">{message}</span>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          style={{color: 'white'}}
          placeholder="Email"
          required
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="Password"
          style={{color: 'white'}}
          required
        />
        <button type="submit">Create Account</button>
      </form>

      {/* Log In Link */}
      <div className="register-link">
        <span>Already have an account?</span>
        <Link to="/loginnew">Log in</Link>
      </div>
    </div>
  );
}

export default Register;
