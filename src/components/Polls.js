import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; 

function Poll({ id, question, options }) {
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
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

  // Fetch poll responses and check if user has voted
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

        const alreadyVoted = data?.some((r) => r.user_id === user?.id);
        if (alreadyVoted) {
          const userVote = data.find((r) => r.user_id === user.id);
          setSelected(userVote.selected_option);
          setHasVoted(true);
        }
      }
    };

    if (user) {
      fetchResponses();
    }
  }, [id, user]);

  const handleVote = async (opt) => {
    if (!user || hasVoted) return;

    const { error } = await supabase.from('poll_responses').insert([
      {
        poll_id: id,
        user_id: user.id,
        selected_option: opt,
      },
    ]);

    if (error) {
      console.error('Error submitting vote:', error.message);
    } else {
      setSelected(opt);
      setHasVoted(true);
      setResponses([...responses, { poll_id: id, user_id: user.id, selected_option: opt }]);
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
                disabled={hasVoted}
                className={`poll-option ${selected === opt ? 'selected' : ''}`}
              >
                <span>{opt}</span>
                {hasVoted && <span style={{ marginLeft: '10px' }}>{percentageObj?.percent}%</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {hasVoted && <p style={{ marginTop: '8px' }}>Thanks for voting!</p>}
    </div>
  );
}

export default Poll;
