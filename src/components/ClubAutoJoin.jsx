import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

function ClubAutoJoin({ user, onClubJoined }) {
  const [search, setSearch] = useState('');
  const [matchedClubs, setMatchedClubs] = useState([]);
  const [joinedClubIds, setJoinedClubIds] = useState([]);

  useEffect(() => {
    const fetchJoined = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_clubs')
        .select('club_id')
        .eq('user_id', user.id);
      setJoinedClubIds(data.map((d) => d.club_id));
    };
    fetchJoined();
  }, [user]);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.length < 2) {
      setMatchedClubs([]);
      return;
    }

    const { data } = await supabase
      .from('clubs')
      .select('*')
      .ilike('name', `%${value}%`);

    const filtered = data.filter((club) => !joinedClubIds.includes(club.id));
    setMatchedClubs(filtered);
  };

  const handleJoin = async (club) => {
    if (!user) return alert('Please log in');

    const { error } = await supabase.from('user_clubs').insert({
      user_id: user.id,
      club_id: club.id,
    });

    if (error) {
      alert('Could not join club.');
      console.error(error.message);
    } else {
      alert(`Joined ${club.name}!`);
      setSearch('');
      setMatchedClubs([]);
      setJoinedClubIds([...joinedClubIds, club.id]);
      if (onClubJoined) await onClubJoined();
    }
  };

  return (
    <div className="club-autojoin">
      <h3>➕ Add a Club</h3>
      <input
        type="text"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search for a club"
        style={{ padding: '8px', width: '100%', marginBottom: '8px' }}
      />
      {matchedClubs.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {matchedClubs.map((club) => (
            <li key={club.id} style={{ marginBottom: '6px' }}>
              <button
                onClick={() => handleJoin(club)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ae9cc3',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Join "{club.name}"
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ClubAutoJoin;
