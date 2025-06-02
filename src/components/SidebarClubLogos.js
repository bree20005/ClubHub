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
    <div
      className="sidebar-club-logos"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px', // ADD space between logos
        padding: '1rem 0'
      }}
    >
      {clubs.map((club) => (
        <img
          key={club.name}
          src={club.logo}
          alt={club.name}
          title={club.name}
          className="club-logo-sidebar"
          onClick={() => navigate(`/feed/${club.id}`)}
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '10px',
            border: '2px solid transparent',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      ))}
    </div>
  );
}

export default SidebarClubLogos;

