import React, { useState } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

function JoinClubPage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [currentClub, setCurrentClub] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);

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
      .select('id, name, rules')
      .eq('code', code)
      .single();

    if (error || !club) {
      setMessage('Club not found. Please check your code.');
      return;
    }

    setCurrentClub(club);
    setShowAgreementModal(true);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
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
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Join a Club</h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          Enter the club code you received from a friend or group admin.
        </p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter club code"
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
          }}
        >
          Join Club
        </button>
        {message && (
          <p style={{ marginTop: '1.5rem', fontSize: '1rem', color: '#fff' }}>{message}</p>
        )}
      </div>

      {showAgreementModal && currentClub && (
        <div
          onClick={() => setShowAgreementModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1e1333',
              padding: '2rem',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '500px',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>{currentClub.name}</h3>
            <p style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
              Please confirm that you will follow the club rules set by the moderators.
            </p>
            <label style={{ fontSize: '1rem', display: 'block', marginBottom: '1.5rem' }}>
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              I agree to the rules: {currentClub.rules}
            </label>
            <button
              onClick={async () => {
                if (!agreementChecked) {
                  alert('Please check the box to continue.');
                  return;
                }

                const {
                  data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                  setMessage('You must be logged in.');
                  return;
                }

                const { error } = await supabase
                  .from('user_clubs')
                  .upsert(
                    {
                      user_id: user.id,
                      club_id: currentClub.id,
                      is_clicked: true,
                    },
                    { onConflict: 'user_id,club_id' }
                  );

                if (error) {
                  console.error('Failed to join club:', error.message);
                  setMessage('Could not join club. Try again.');
                  return;
                }

                setMessage('Successfully joined club!');
                setShowAgreementModal(false);
                //navigate('/feed');
                navigate(`/feed/${currentClub.id}`);
                window.location.reload();
              }}
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
              Confirm & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JoinClubPage;
