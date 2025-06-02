import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function Event({ content, eventTime, image, authorName, createdAt, id }) {
  const [rsvpCount, setRsvpCount] = useState(0);
  const [userHasRSVPd, setUserHasRSVPd] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  // Fetch RSVP data
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
        console.error('RSVP fetch error:', rsvpError?.message || postError?.message);
      }
    };

    if (user) fetchRSVPs();
  }, [user, id]);

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
        await supabase.from('posts').update({ rsvp_count: rsvpCount - 1 }).eq('id', id);
      } else {
        console.error('Error removing RSVP:', error.message);
      }
    } else {
      const { error } = await supabase
        .from('rsvps')
        .insert([{ event_id: id, user_id: user.id }]);

      if (!error) {
        setRsvpCount((prev) => prev + 1);
        setUserHasRSVPd(true);
        await supabase.from('posts').update({ rsvp_count: rsvpCount + 1 }).eq('id', id);
      } else {
        console.error('Error adding RSVP:', error.message);
      }
    }
  };

  return (
    <div className="post-card">
      <div className="post-meta">
        <strong>{authorName || 'Unknown'}</strong> • {new Date(createdAt).toLocaleString()}
      </div>

      <h2 style={{ marginTop: '0.5rem' }}>{content}</h2>

      <div className="event-time">📅 {new Date(eventTime).toLocaleString()}</div>

      {image && (
        <img
          src={image}
          alt="event poster"
          className="preview-image"
        />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <p style={{ margin: 0 }}>{rsvpCount} going</p>
        <button className="rsvp-button" onClick={toggleRSVP}>
          {userHasRSVPd ? '✅ Going (Cancel)' : '🎟️ I’m Going'}
        </button>
      </div>
    </div>
  );
}

export default Event;