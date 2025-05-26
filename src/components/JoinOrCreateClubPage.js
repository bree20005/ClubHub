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

    navigate('/feed');
  };

  return (
    <div>
      <h2>You’re not in any clubs yet.</h2>
      <p>Ask your club President for the code:</p>
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" />
      <button onClick={handleJoin}>Join Club</button>
      <p>or</p>
      <button onClick={() => navigate('/start-club')}>Start Your Own Club</button>
    </div>
  );
}

export default JoinOrCreateClubPage;
