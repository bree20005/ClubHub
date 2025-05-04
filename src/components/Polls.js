// src/components/Poll.js
import React from 'react';

function Poll({ question, options }) {
  return (
    <div className="poll-card">
      <h3>{question}</h3>
      <ul>
        {options.map((opt, index) => (
          <li key={index}><button>{opt}</button></li>
        ))}
      </ul>
    </div>
  );
}

export default Poll;
