import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function Poll({ id, question, options }) {
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
  const [responses, setResponses] = useState([]);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setUser(user);
      }
    };

    fetchUser();
  }, []);

  // Fetch poll responses and user's vote
  useEffect(() => {
    const fetchResponses = async () => {
      const { data, error } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('poll_id', id);

      if (error) {
        console.error('Error fetching responses:', error.message);
      } else {
        setResponses(data || []);

        const userVote = data?.find((r) => r.user_id === user?.id);
        if (userVote) {
          setSelected(userVote.selected_option);
        }
      }
    };

    if (user) {
      fetchResponses();
    }
  }, [id, user]);

  const handleVote = async (opt) => {
    if (!user) return;

    const { error } = await supabase.from('poll_responses').upsert(
      {
        poll_id: id,
        user_id: user.id,
        selected_option: opt,
      },
      { onConflict: ['poll_id', 'user_id'] } // ensures update if exists
    );

    if (error) {
      console.error('Error submitting vote:', error.message);
    } else {
      setSelected(opt);

      // Re-fetch updated responses
      const { data: updatedResponses, error: fetchError } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('poll_id', id);

      if (fetchError) {
        console.error('Error re-fetching responses:', fetchError.message);
      } else {
        setResponses(updatedResponses || []);
      }
    }
  };

  // Compute vote counts and percentages
  const counts = {};
  responses.forEach((r) => {
    counts[r.selected_option] = (counts[r.selected_option] || 0) + 1;
  });
  const totalVotes = responses.length;

  const percentages = options.map((opt) => {
    const count = counts[opt] || 0;
    const percent = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
    return { opt, percent };
  });

  return (
    <div className="poll-card">
      <h3>{question}</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {options.map((opt) => {
          const percentageObj = percentages.find((p) => p.opt === opt);
          return (
            <li key={opt} style={{ marginBottom: '8px' }}>
              <button
                onClick={() => handleVote(opt)}
                className={`poll-option ${selected === opt ? 'selected' : ''}`}
              >
                <span>{opt}</span>
                {selected && (
                  <span style={{ marginLeft: '10px' }}>
                    {percentageObj?.percent}%
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {selected && <p style={{ marginTop: '8px' }}>You voted for: <strong>{selected}</strong></p>}
    </div>
  );
}

export default Poll;
