import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ClubSuccessPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { clubCode, clubName } = state || {};
  const [copied, setCopied] = useState(false);

  // if (!clubCode || !clubName) {
  //   return (
  //     <div style={containerStyle}>
  //       <div style={cardStyle}>
  //         <h2 style={{ marginBottom: '1.5rem' }}>Missing club info.</h2>
  //         <button style={buttonStyle} onClick={() => navigate('/feed')}>
  //           Go Back
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  const handleCopy = () => {
    navigator.clipboard.writeText(clubCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '1rem', fontSize: '2rem', color: offWhite }}>
          Club{' '}
          <span style={{ color: offWhite, fontWeight: 'bold' }}>{clubName}</span>{' '}
          Created!
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: offWhite }}>
          Share this club code to let others join:
        </p>

        <div style={codeBoxStyle}>{clubCode}</div>

        <button style={{ ...buttonStyle, marginTop: '1.5rem', width: '100%' }} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy Code'}
        </button>

        <button
          style={subtleTextButtonStyle}
          onClick={() => navigate('/feed')}
          onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
        >
          Go to Club Feed
        </button>
      </div>
    </div>
  );
}

const offWhite = '#ddd';

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
  backgroundColor: 'transparent',
  fontFamily: 'Inter, sans-serif',
};

const cardStyle = {
  backgroundColor: '#1e1333',
  borderRadius: '16px',
  padding: '3rem',
  width: '100%',
  maxWidth: '500px',
  color: 'white',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  textAlign: 'center',
};

const codeBoxStyle = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: offWhite,
  background: '#2b224b',
  padding: '1rem',
  borderRadius: '10px',
  marginBottom: '1rem',
  userSelect: 'all',
};

const buttonStyle = {
  backgroundColor: 'white',
  color: '#1e1333',
  fontSize: '1.1rem',
  padding: '1rem',
  borderRadius: '10px',
  border: 'none',
  cursor: 'pointer',
};

const subtleTextButtonStyle = {
  marginTop: '2rem',
  background: 'none',
  border: 'none',
  color: '#aaa',
  fontSize: '1rem',
  cursor: 'pointer',
  textDecoration: 'none',
  padding: 0,
  fontWeight: 'normal',
};

export default ClubSuccessPage;
