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

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || '');  // Start blank
      }

      const { data: memberships, error: membershipError } = await supabase
        .from('user_clubs')
        .select('clubs(name)')
        .eq('user_id', user.id);

      if (membershipError) {
        console.error('Error fetching clubs:', membershipError.message);
      } else {
        setClubs(memberships.map((m) => m.clubs.name));
      }
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

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'white' }}>My Profile</h1>
        <br />
        <h3 style={{ color: '#1f0c44', fontSize: '30px' }}>
          Welcome, {fullName || 'User'}!
        </h3>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="profile-photo"
            style={{ borderRadius: '50%', width: '120px', height: '120px' }}
          />
        ) : (
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#ccc',
              display: 'inline-block',
              lineHeight: '120px',
              color: '#555',
              fontSize: '14px',
            }}
          >
            No Image
          </div>
        )}
        <br />
        <input type="file" onChange={handleAvatarUpload} style={{ marginTop: '10px' }} />
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', color: 'black' }}>
        <h3>My Clubs:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {clubs.map((club, index) => (
            <li key={index} style={{ padding: '4px 0' }}>{club}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProfileHeader;
