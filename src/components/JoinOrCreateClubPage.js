import React, { useState } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

function JoinOrCreateClubPage() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: club } = await supabase
      .from('clubs')
      .select('*')
      .eq('code', code)
      .single();

    if (!club) {
      alert('Invalid code.');
      return;
    }

    await supabase.from('user_clubs').insert({
      user_id: user.id,
      club_id: club.id,
    });

    //navigate('/feed');
    navigate(`/feed/${club.id}`);
    window.location.reload();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: '#1e1333',
      }}
    >
      <div
        style={{
          backgroundColor: '#1e1333',
          borderRadius: '16px',
          padding: '3rem',
          width: '100%',
          maxWidth: '600px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          fontFamily: 'Inter, sans-serif',
          color: '#fff',
        }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
          You’re not in any clubs yet.
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          Ask your club President for the code:
        </p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          style={{
            padding: '1rem',
            fontSize: '1.1rem',
            borderRadius: '10px',
            border: '1px solid #ccc',
            width: '100%',
            marginBottom: '1.5rem',
            backgroundColor: '#2c1f48',
            color: '#fff',
          }}
        />
        <button
          onClick={handleJoin}
          style={{
            backgroundColor: '#fff',
            color: '#1e1333',
            padding: '1rem',
            fontSize: '1.1rem',
            borderRadius: '10px',
            width: '100%',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          Join Club
        </button>
        <p style={{ textAlign: 'center', margin: '1.5rem 0', color: '#fff' }}>or</p>
        <button
          onClick={() => navigate('/start-club')}
          style={{
            backgroundColor: '#fff',
            color: '#1e1333',
            padding: '1rem',
            fontSize: '1.1rem',
            borderRadius: '10px',
            width: '100%',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Start Your Own Club
        </button>
      </div>
    </div>
  );
}

export default JoinOrCreateClubPage;
