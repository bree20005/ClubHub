import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function MyEvents() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadUserAndEvents = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) return console.error('User error:', error.message);
      setUser(user);

      const { data: rsvps } = await supabase
        .from('rsvps')
        .select('event_id')
        .eq('user_id', user.id);

      const eventIds = rsvps.map((r) => r.event_id);

      const { data: eventsData } = await supabase
        .from('posts')
        .select('*')
        .in('id', eventIds)
        .eq('type', 'event')
        .gte('event_time', new Date().toISOString())
        .order('event_time', { ascending: true });

      setEvents(eventsData);
    };

    loadUserAndEvents();
  }, []);

  return (
    <div className="my-events-page">
      <h1>Welcome back, {user?.user_metadata?.full_name || 'Friend'}!</h1>
      <p>You have {events.length} upcoming events.</p>

      <div className="filter-bar">
        <button className="active">Upcoming</button>
        <button>Hosting</button>
        <button>Open invite</button>
        <button>Attended</button>
        <button>All past events</button>
      </div>

      <div className="event-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card-grid">
            <div className="event-time-tag">
              {new Date(event.event_time).toLocaleDateString('en-US', {
                weekday: 'short',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </div>
            <img src={event.image_urls?.[0]} className="event-poster" alt="poster" />
            <div className="event-footer">
              <strong>{event.content}</strong>
              <p>👍 Going</p>
            </div>
          </div>
        ))}
        <div className="event-card-grid new-event-placeholder">
          <span>＋ NEW EVENT</span>
        </div>
      </div>
    </div>
  );
}

export default MyEvents;