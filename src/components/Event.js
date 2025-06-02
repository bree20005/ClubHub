import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function Event({ content, eventTime, image, authorName, createdAt, id, clubId }) {
  const [rsvpCount, setRsvpCount] = useState(0);
  const [userHasRSVPd, setUserHasRSVPd] = useState(false);
  const [user, setUser] = useState(null);
  const [clubName, setClubName] = useState('');

  // Load current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('[User Fetch] Error:', error.message);
        return;
      }
      setUser(data.user);
    };
    fetchUser();
  }, []);

  // Log loaded user
  useEffect(() => {
    console.log('[Event Component] Loaded with user:', user);
  }, [user]);

  // Fetch club name
  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId) return;
      const { data, error } = await supabase
        .from('clubs')
        .select('name')
        .eq('id', clubId)
        .single();

      if (!error && data?.name) setClubName(data.name);
    };
    fetchClub();
  }, [clubId]);

  // Fetch RSVP status and count
  useEffect(() => {
    const fetchRSVPs = async () => {
      if (!user) return;

      const { data: rsvps, error } = await supabase
        .from('rsvps')
        .select('*')
        .eq('event_id', id);

      if (error) {
        console.error('[RSVP Fetch Error]:', error.message);
        return;
      }

      setRsvpCount(rsvps.length);
      setUserHasRSVPd(rsvps.some((r) => r.user_id === user.id));
    };

    fetchRSVPs();
  }, [user, id]);

  // Handle RSVP toggle
  const toggleRSVP = async () => {
    if (!user) {
      console.warn('[RSVP Toggle] User not loaded');
      return;
    }

    const payload = { event_id: id, user_id: user.id };

    if (userHasRSVPd) {
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('event_id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('[RSVP Cancel Error]:', error.message);
        return;
      }

      setUserHasRSVPd(false);
      setRsvpCount((prev) => prev - 1);
    } else {
      const { error } = await supabase
        .from('rsvps')
        .upsert([payload], { onConflict: ['event_id', 'user_id'] });

      if (error) {
        console.error('[RSVP Submit Error]:', error.message);
        return;
      }

      setUserHasRSVPd(true);
      setRsvpCount((prev) => prev + 1);
    }
  };

  return (
    <div className="post-card">
      <div className="post-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <strong>{authorName || 'Unknown'}</strong> • {new Date(createdAt).toLocaleString()}
        </div>
        {clubName && <div style={{ fontSize: '0.85rem', color: '#ccc' }}>{clubName}</div>}
      </div>

      <h2 style={{ marginTop: '0.5rem' }}>{content}</h2>
      <div className="event-time">📅 {new Date(eventTime).toLocaleString()}</div>

      {image && <img src={image} alt="event" className="preview-image" />}

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
        {user && (
          <button
            onClick={toggleRSVP}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.2rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#E0D8F6',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.9rem',
              fontWeight: 600,
              backdropFilter: 'blur(6px)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            {userHasRSVPd ? '✅ Going (Cancel)' : '🎟️ I’m Going'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Event;
