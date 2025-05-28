import React, { useState } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

function JoinClubPage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage('Please log in to join a club.');
      return;
    }

    const { data: club, error } = await supabase
      .from('clubs')
      .select('id')
      .eq('code', code)
      .single();

    if (error || !club) {
      setMessage('Club not found. Please check your code.');
      return;
    }

    const { error: joinError } = await supabase.from('user_clubs').insert({
      user_id: user.id,
      club_id: club.id,
    });

    if (joinError) {
      setMessage('You are already a member of this club.');
    } else {
      setMessage('Successfully joined the club!');
      setTimeout(() => navigate('/feed'), 1500);
    }
  };

  return (
    <div className="feed-container">
      <h2>🔑 Join a Club</h2>
      <p>Enter the club code you received from a friend or group admin.</p>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter club code"
        className="comment-input"
      />
      <button onClick={handleJoin} className="comment-submit" style={{ marginTop: '1rem' }}>
        Join Club
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#64ffda' }}>{message}</p>}
    </div>
  );
}

export default JoinClubPage;
