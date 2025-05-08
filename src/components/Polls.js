// src/components/Poll.js
// import React from 'react';
import React, { useState } from 'react';

function Poll({ question, options }) {
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Fake vote counts 
  const totalVotes = 100;
  const votes = options.map((opt, i) => (i === options.indexOf(selected) ? 40 : 30));
  const percentages = votes.map(v => Math.round((v / totalVotes) * 100));

  const handleVote = (opt) => {
      setSelected(opt);
      setHasVoted(true);
  };
  return (
    <div className="poll-card">
      <h3>{question}</h3>
      <ul>
        {options.map((opt, index) => (
          <li key={index}>
            <button 
              onClick={() => handleVote(opt)}
              className={selected === opt ? 'selected' : ''}
            >
              <span className="label">{opt}</span>
              {hasVoted && (
                <span className="percentage">{percentages[index]}%</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
  
}

export default Poll;
