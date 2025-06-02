import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function MyEvents() {
  const [user, setUser] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);

  useEffect(() => {
    const loadUserAndEvents = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('User error:', error.message);
        return;
      }

      setUser(user);

      const { data: rsvps, error: rsvpError } = await supabase
        .from('rsvps')
        .select('event_id')
        .eq('user_id', user.id);

      if (rsvpError || !rsvps?.length) return;

      const eventIds = rsvps.map((r) => r.event_id);

      const { data: eventsData, error: eventsError } = await supabase
        .from('posts')
        .select('*')
        .in('id', eventIds)
        .eq('type', 'event');

      if (eventsError) {
        console.error('Event fetch error:', eventsError.message);
        return;
      }

      const now = new Date();
      const upcomingEvents = eventsData
        .filter((event) => new Date(event.event_time) >= now)
        .sort((a, b) => new Date(a.event_time) - new Date(b.event_time));
      const pastEvents = eventsData
        .filter((event) => new Date(event.event_time) < now)
        .sort((a, b) => new Date(b.event_time) - new Date(a.event_time));

      setUpcoming(upcomingEvents);
      setPast(pastEvents);
    };

    loadUserAndEvents();
  }, []);

  const renderEventCard = (event) => (
    <div key={event.id} className="event-card post-card">
      <div className="post-meta" style={{ marginBottom: '0.5rem' }}>
        <strong>{event.author_name || 'Unknown'}</strong> •{' '}
        {new Date(event.created_at).toLocaleString()}
      </div>

      <h2>{event.content}</h2>
      <p>📆 {new Date(event.event_time).toLocaleString()}</p>

      {event.image_urls?.[0] && (
        <img
          src={event.image_urls[0]}
          alt="event poster"
          className="preview-image"
          style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '1rem' }}
        />
      )}

      <p style={{ marginTop: '0.5rem' }}>✅ RSVP’d</p>
    </div>
  );

  return (
    <div className="my-events-page">
      <h1>Welcome back, {user?.user_metadata?.full_name || 'Friend'}!</h1>
      <p>
        You have {upcoming.length} upcoming event{upcoming.length !== 1 ? 's' : ''} RSVP’d to.
      </p>

      {upcoming.length > 0 && (
        <>
          <h2 className="section-heading">Upcoming Events</h2>
          <div className="event-grid">{upcoming.map(renderEventCard)}</div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 className="section-heading">Past Events</h2>
          <div className="event-grid">{past.map(renderEventCard)}</div>
        </>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <p>No RSVP’d events yet. Check out the Feed!</p>
      )}
    </div>
  );
}

export default MyEvents;