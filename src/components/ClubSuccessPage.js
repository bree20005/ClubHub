import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ClubSuccessPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { clubCode, clubName } = state || {};
  const [copied, setCopied] = useState(false);

  if (!clubCode || !clubName) {
    return (
      <div className="feed-container">
        <h2>Missing club info.</h2>
        <button onClick={() => navigate('/feed')}>Go Back</button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(clubCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="feed-container">
      <h2>🎉 Club <span style={{ color: '#64ffda' }}>{clubName}</span> Created!</h2>
      <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
        Share this club code to let others join:
      </p>

      <div
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#64ffda',
          background: '#112240',
          padding: '1rem',
          borderRadius: '10px',
          marginTop: '1rem',
          display: 'inline-block',
        }}
      >
        {clubCode}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button
          className="upload-button"
          onClick={handleCopy}
        >
          📋 {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      <button
        style={{ marginTop: '2rem' }}
        onClick={() => navigate('/feed')}
        className="gallery-button"
      >
        Go to Club Feed
      </button>
    </div>
  );
}

export default ClubSuccessPage;
