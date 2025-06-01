import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function Event({ id, content, eventTime, image, authorName, createdAt, user }) {
  const [goingCount, setGoingCount] = useState(0);
  const [userIsGoing, setUserIsGoing] = useState(false);

  // Fetch RSVP status and count
  useEffect(() => {
    const fetchRsvps = async () => {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .eq('event_id', id);

      if (!error && data) {
        setGoingCount(data.length);
        if (user) {
          setUserIsGoing(data.some(r => r.user_id === user.id));
        }
      }
    };

    fetchRsvps();
  }, [id, user]);

  // Handle RSVP toggle
  const toggleRsvp = async () => {
    if (!user) return;

    if (userIsGoing) {
      // remove RSVP
      await supabase
        .from('rsvps')
        .delete()
        .eq('event_id', id)
        .eq('user_id', user.id);
      setGoingCount(prev => prev - 1);
      setUserIsGoing(false);
    } else {
      // add RSVP
      await supabase.from('rsvps').insert({
        event_id: id,
        user_id: user.id,
      });
      setGoingCount(prev => prev + 1);
      setUserIsGoing(true);
    }
  };

  return (
    <div className="post-card"> {/* Same styling as posts */}
      <div className="post-meta">
        <strong>{authorName}</strong> • {new Date(createdAt).toLocaleString()}
      </div>

      <h2 style={{ marginBottom: '0.5rem' }}>{content}</h2>

      <p style={{ color: '#d3d3d3', marginBottom: '0.5rem' }}>
        📅 {new Date(eventTime).toLocaleString()}
      </p>

      {image && (
        <img
          src={image}
          alt="Event poster"
          className="preview-image"
          style={{ maxWidth: '100%', borderRadius: '10px', marginTop: '1rem' }}
        />
      )}

      <button onClick={toggleRsvp} className="rsvp-button">
        {userIsGoing ? '✅ Going' : '👍 I’m Going'} • {goingCount}
      </button>
    </div>
  );
}

export default Event;