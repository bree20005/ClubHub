import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const RSVPButton = ({ eventId }) => {
  const [userId, setUserId] = useState(null);
  const [going, setGoing] = useState(false);
  const [goingCount, setGoingCount] = useState(0);

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setUserId(data.user?.id);
      }
    };
    fetchUser();
  }, []);

  // Fetch RSVP state
  useEffect(() => {
    const fetchRSVPs = async () => {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .eq('event_id', eventId);

      if (!error && data) {
        setGoingCount(data.length);
        setGoing(data.some(r => r.user_id === userId));
      }
    };

    if (userId) fetchRSVPs();
  }, [eventId, userId]);

  const handleRSVP = async () => {
    if (!userId) return;

    if (!going) {
      const { error } = await supabase
        .from('rsvps')
        .insert([{ event_id: eventId, user_id: userId }]);

      if (error) {
        console.error('RSVP insert error:', error.message);
      } else {
        setGoing(true);
        setGoingCount(prev => prev + 1);
      }
    } else {
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) {
        console.error('RSVP delete error:', error.message);
      } else {
        setGoing(false);
        setGoingCount(prev => prev - 1);
      }
    }
  };

  return (
    <button onClick={handleRSVP} className="flex items-center gap-2">
      {going ? '✅ Going' : '📅 RSVP'} <span>{goingCount}</span>
    </button>
  );
};

export default RSVPButton;