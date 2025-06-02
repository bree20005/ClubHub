import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function Event({ content, eventTime, image, authorName, createdAt, id, user }) {
  const [rsvpCount, setRsvpCount] = useState(0);
  const [userHasRSVPd, setUserHasRSVPd] = useState(false);

  useEffect(() => {
    const fetchRSVPs = async () => {
      const { data: rsvps, error: rsvpError } = await supabase
        .from('rsvps')
        .select('*')
        .eq('event_id', id);

      const { data: postMeta, error: postError } = await supabase
        .from('posts')
        .select('rsvp_count')
        .eq('id', id)
        .single();

      if (!rsvpError && !postError) {
        setRsvpCount(postMeta?.rsvp_count || 0);
        setUserHasRSVPd(rsvps.some((r) => r.user_id === user?.id));
      } else {
        console.error('Error fetching RSVP data:', rsvpError?.message || postError?.message);
      }
    };

    if (user) fetchRSVPs();
  }, [id, user]);

  const toggleRSVP = async () => {
    if (!user) return;

    if (userHasRSVPd) {
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('event_id', id)
        .eq('user_id', user.id);

      if (!error) {
        setRsvpCount((prev) => prev - 1);
        setUserHasRSVPd(false);

        await supabase
          .from('posts')
          .update({ rsvp_count: rsvpCount - 1 })
          .eq('id', id);
      }
    } else {
      const { error } = await supabase.from('rsvps').insert([
        {
          event_id: id,
          user_id: user.id,
        },
      ]);

      if (!error) {
        setRsvpCount((prev) => prev + 1);
        setUserHasRSVPd(true);

        await supabase
          .from('posts')
          .update({ rsvp_count: rsvpCount + 1 })
          .eq('id', id);
      }
    }
  };

  return (
    <div className="event-card">
      <div className="event-meta">
        <strong>{authorName}</strong> • {new Date(createdAt).toLocaleString()}
      </div>

      <h2 style={{ marginTop: '0.5rem' }}>{content}</h2>
      <p>📆 {new Date(eventTime).toLocaleString()}</p>

      {image && (
        <img
          src={image}
          alt="event poster"
          className="preview-image"
          style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '1rem' }}
        />
      )}

      <button className="rsvp-button" onClick={toggleRSVP}>
        {userHasRSVPd ? '✅ Going (Click to Cancel)' : '🎟️ I’m Going'}
      </button>

      <p style={{ marginTop: '0.5rem' }}>{rsvpCount} going</p>
    </div>
  );
}

export default Event;