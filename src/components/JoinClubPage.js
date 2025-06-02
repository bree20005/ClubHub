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
//join a club part
  return (
    <div>
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
  
      {showAgreementModal && currentClub && (
        <div
          onClick={() => setShowAgreementModal(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
              color: 'black'
            }}> 
            <h3>{currentClub.name}</h3> 
            <p> Please confirm that you will follow the club rules set by the moderators </p> 
            <label> 
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
              />
              {' '} I agree to the terms and conditions for the club {currentClub.name}: {currentClub.rules}
            </label>
            <br />
            
                    <button
          style={{ marginTop: '1rem' }}
          onClick={async () => {
            if (!agreementChecked) {
              alert('Please check the box to continue.');
              return;
            }

            const {
              data: { user }
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
                  is_clicked: true
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
            window.location.reload(); 
            navigate('/feed');            
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
