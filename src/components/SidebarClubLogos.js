import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

function SidebarClubLogos() {
  const [clubs, setClubs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadClubs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('user_clubs')
        .select('club_id, clubs!inner(name, logo_url)')
        .eq('user_id', user.id);

      if (!error && data) {
        const mapped = data.map((entry) => ({
          id: entry.club_id,
          name: entry.clubs.name,
          logo: entry.clubs.logo_url,
        }));
        setClubs(mapped);
      }
    };

    loadClubs();
  }, []);

  return (
    <div className="sidebar-club-logos">
      {clubs.map((club) => (
        <img
          key={club.name}
          src={club.logo}
          alt={club.name}
          title={club.name}
          className="club-logo-sidebar"
          onClick={() => navigate('/feed')} // Or navigate to a club-specific route
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'cover',
            borderRadius: '6px',
            marginBottom: '10px',
            border: '2px solid transparent',
            cursor: 'pointer',
          }}
        />
      ))}
    </div>
  );
}

export default SidebarClubLogos;

