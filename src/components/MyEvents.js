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
    <div key={event.id} className="event-card post-card" style={{ marginBottom: '1rem' }}>
      <div className="post-meta" style={{ marginBottom: '0.5rem' }}>
        <strong>{event.author_name || 'Unknown'}</strong> •{' '}
        {new Date(event.created_at).toLocaleString()}
      </div>

      <h3>{event.content}</h3>
      <p>📆 {new Date(event.event_time).toLocaleString()}</p>

      {event.image_urls?.[0] && (
        <img
          src={event.image_urls[0]}
          alt="event poster"
          className="preview-image"
          style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '0.75rem' }}
        />
      )}

      <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#7f7f7f' }}>✅ RSVP’d</p>
    </div>
  );

  return (
    <div className="my-events-page" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>
        Welcome back, {user?.user_metadata?.full_name || 'Friend'}!
      </h1>

      <p style={{ marginBottom: '2rem' }}>
        You have RSVP’d to {upcoming.length + past.length} event
        {(upcoming.length + past.length) !== 1 ? 's' : ''}.
      </p>

      <div className="event-columns" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Upcoming */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ marginBottom: '0.25rem' }}>🎉 Upcoming Events</h2>
          <p style={{ color: '#964ad4', marginBottom: '1rem' }}>Get excited for what’s ahead!</p>
          {upcoming.length > 0 ? (
            upcoming.map(renderEventCard)
          ) : (
            <p style={{ fontStyle: 'italic', color: '#888' }}>
              You haven’t RSVP’d to any upcoming events yet. Go check your feed!
            </p>
          )}
        </div>

        {/* Past */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ marginBottom: '0.25rem' }}>📸 Past Events</h2>
          <p style={{ color: '#964ad4', marginBottom: '1rem' }}>Relive great memories.</p>
          {past.length > 0 ? (
            past.map(renderEventCard)
          ) : (
            <p style={{ fontStyle: 'italic', color: '#888' }}>
              No past events yet — stay tuned!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyEvents;