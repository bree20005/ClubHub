import React, { useState } from "react";
import supabase from "../helper/supabaseclient";
import { Link } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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
    }

    setEmail("");
    setPassword("");
  };

  return (
    <div>
      <h2>Register</h2>
      <br></br>
      {message && <span>{message}</span>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Create Account</button>
      </form>
      <span>Already have an account?</span>
      <Link to="/loginnew">Log in.</Link>

      <>
      <div className="register-page">
        <h1
          style={{
            color: 'white',
            fontSize: '48px',
            marginBottom: '8px',
            textShadow: '0 0 6px rgba(155, 89, 182, 0.5)',
          }}
        >
          Welcome to ClubHub
        </h1>
        <h2
          style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: 'normal',
            marginTop: 0,
            marginBottom: '20px',
            textShadow: '0 0 4px rgba(0, 0, 0, 0.5)',
          }}
        >
          Register to join Your Community
        </h2>

      </div>
    </>
    </div>

    

    
  );
}

export default Register;