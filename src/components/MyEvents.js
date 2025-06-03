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
    <div key={event.id} style={cardStyle}>
      <div style={metaStyle}>
        <strong>{event.author_name || 'Unknown'}</strong> •{' '}
        {new Date(event.created_at).toLocaleString()}
      </div>

      <h2 style={eventTitleStyle}>{event.content}</h2>
      <p style={eventDateStyle}>📆 {new Date(event.event_time).toLocaleString()}</p>

      {event.image_urls?.[0] && (
        <img
          src={event.image_urls[0]}
          alt="event poster"
          style={imageStyle}
        />
      )}

      <p style={rsvpStyle}>✅ RSVP’d</p>
    </div>
  );

  return (
    <div style={pageWrapperStyle}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', color: 'black' }}>
        <h1 style={mainHeadingStyle}>
          Welcome back, {user?.user_metadata?.full_name || 'Friend'}!
        </h1>
        <p style={subTextStyle}>
          You have RSVP’d to {upcoming.length} upcoming event{upcoming.length !== 1 ? 's' : ''}. Check your feed for more!
        </p>
      </div>

      {(upcoming.length > 0 || past.length > 0) ? (
        <div style={twoColGridStyle}>
          <div>
            <h2 style={sectionHeadingStyle}>🗓️ Upcoming Events</h2>
            {upcoming.length > 0 ? (
              <div style={gridStyle}>{upcoming.map(renderEventCard)}</div>
            ) : (
              <p style={emptyStateStyle}>No upcoming events yet.</p>
            )}
          </div>

          <div>
            <h2 style={sectionHeadingStyle}>✔️ Past Events</h2>
            {past.length > 0 ? (
              <div style={gridStyle}>{past.map(renderEventCard)}</div>
            ) : (
              <p style={emptyStateStyle}>No past events yet.</p>
            )}
          </div>
        </div>
      ) : (
        <p style={emptyStateStyle}>No RSVP’d events yet. Check out the Feed!</p>
      )}
    </div>
  );
}

// === Styles ===

const pageWrapperStyle = {
  padding: '4rem 2rem',
  fontFamily: 'Inter, sans-serif',
};

const twoColGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '3rem',
  maxWidth: '1200px',
  margin: '0 auto',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '2rem',
};

const cardStyle = {
  padding: '2rem',
  borderRadius: '16px',
  border: '1px solid #ddd',
  backgroundColor: '#f9f9ff',
};

const mainHeadingStyle = {
  fontSize: '2.75rem',
  fontWeight: '700',
  color: 'black',
};

const subTextStyle = {
  fontSize: '1.4rem',
  color: '#333',
};

const sectionHeadingStyle = {
  fontSize: '2rem',
  fontWeight: '600',
  marginTop: '1rem',
  marginBottom: '1.5rem',
  textAlign: 'center',
};

const eventTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  marginTop: '0.75rem',
  color: '#FFB6C1',
};

const eventDateStyle = {
  fontSize: '1.2rem',
  marginTop: '0.25rem',
  color: '#444',
};

const metaStyle = {
  fontSize: '1rem',
  color: '#777',
  marginBottom: '0.5rem',
};

const rsvpStyle = {
  fontSize: '1.1rem',
  marginTop: '1rem',
  color: '#008000',
};

const imageStyle = {
  maxWidth: '100%',
  borderRadius: '12px',
  marginTop: '1rem',
};

const emptyStateStyle = {
  fontSize: '1.3rem',
  textAlign: 'center',
  marginTop: '2rem',
  color: 'black',
};

export default MyEvents;