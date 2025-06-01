import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function ProfileHeader() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [clubs, setClubs] = useState([]);
  
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
  
      if (!user) {
        console.error('User is not logged in');
        return;
      }
  
      // Load profile info
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
  
      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || '');
      }
  
      // Load user club memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('user_clubs')
        .select('club_id, clubs(name, logo_url)')
        .eq('user_id', user.id);
  
      if (membershipError) {
        console.error('Error fetching clubs:', membershipError.message);
        return;
      }
  
      // Load admin clubs
      const { data: adminClubs, error: adminError } = await supabase
        .from('club_admins')
        .select('club_id')
        .eq('user_id', user.id);
  
      if (adminError) {
        console.error('Error fetching admin clubs:', adminError.message);
        return;
      }
  
      const adminClubIds = new Set(adminClubs.map(entry => entry.club_id));
  
      // Add admin status to each club
      const clubsWithStatus = memberships.map(m => ({
        ...m.clubs,
        id: m.club_id,
        isAdmin: adminClubIds.has(m.club_id)
      }));
  
      setClubs(clubsWithStatus);
    };
  
    loadProfile();
  }, []);
  

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
    } else {
      const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl.publicUrl);
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl.publicUrl });
    }
  };
// this is for the checkmark to confirm that the user agrees with terms and conditions

  //the header 3 needs to be fixed but it wont let me directly comment next to it
  console.log('clubs:', clubs);
  return (
    <div className="profile-page" style={{ textAlign: 'center', color: 'white'}}>
      <h1 style={{ fontSize: '2.8rem' }}>Welcome, {fullName || 'User'}!</h1>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '150px', 
          marginTop: '40px', 
        }}
      >
        {/* Profile Picture */}
        <div style={{ flexShrink: 0, marginTop: '20px' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              style={{
                borderRadius: '50%',
                width: '160px', // bigger size
                height: '160px',
                objectFit: 'cover', // prevent squishing
                display: 'block',
                margin: '0 auto',
              }}
            />
          ) : (
            <div
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                backgroundColor: '#ccc',
                margin: '0 auto',
                lineHeight: '160px',
                color: '#555',
                fontSize: '16px',
                textAlign: 'center',
              }}
            />
          )}
          <label
            htmlFor="avatar-upload"
            className="edit-picture"
            style={{
              display: 'block',
              marginTop: '10px',
              color: '#121212',
              fontSize: '1rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Edit Picture
          </label>
          <input
            id="avatar-upload"
            type="file"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Clubs List */}
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '10px',
          }}
        >
          <h3 style={{ marginBottom: '1.5rem', color: '#222', fontSize: '1.5rem', fontWeight: 500,}}>My Clubs:</h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              width: '100%',
            }}
          >
            {clubs.map((club, index) => (
              <li
                key={index}
                className="club-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  minHeight: '100px',
                  borderBottom: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  marginBottom: '24px',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
              >
                {/* Left side: logo + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '22px', fontWeight: '200',}}>
                  {club.logo_url ? (
                    <img
                      src={club.logo_url}
                      alt={`${club.name} logo`}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '8px',
                        backgroundColor: '#ccc',
                      }}
                    />
                  )}

                  <span
                    style={{
                      fontSize: '1.5rem',
                      color: '#222',
                      fontWeight: '500',
                    }}
                  >
                    {club.name}
                  </span>
                </div>

                {/* Right side: pill badge */}
                <span
                  style={{
                    padding: '10px 20px',
                    borderRadius: '999px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    backgroundColor: club.isAdmin ? '#1e3a8a' : '#dc2626',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    transform: 'scale(0.9)'
                  }}
                >
                  {club.isAdmin ? 'Admin' : 'Member'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;