import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function ProfileHeader() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [clubs, setClubs] = useState([]);
  const [clickedClub, setClickedClub] = useState(null);
  const [acceptedConditions, setacceptedConditions] = useState(false);

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
        setAvatarUrl(data.avatar_url || '');
      }

      const { data: memberships, error: membershipError } = await supabase
        .from('user_clubs')
        .select('club_id, clubs(name, logo_url)')
        .eq('user_id', user.id);
    

      if (membershipError) {
        console.error('Error fetching clubs:', membershipError.message);
      } else {
        setClubs(memberships.map((m) => ({
          ...m.clubs,
          id: m.club_id,
          is_clicked: m.is_clicked,
        })));
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
// this is for the checkmark to confirm that the user agrees with terms and conditions
  const sendConditionToServer = async (checked) => {
    setacceptedConditions(checked);
  
    if (!user || !clickedClub) return;
  
    const { error } = await supabase
        .from('user_clubs')
        .update({ is_clicked: checked })
        .match({ user_id: user.id, club_id: clickedClub.id });

    if (error) {
      console.error('Error updating is_clicked status:', error.message);
      }

  };

  //the header 3 needs to be fixed but it wont let me directly comment next to it
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
          />
        )}
        <br />
        <input type="file" onChange={handleAvatarUpload} style={{ marginTop: '10px' }} />
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', color: 'black' }}>
        <h3>My Clubs:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {clubs.map((club, index) => (
            <li
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
              }}
            >
              {club.logo_url ? (
                <img
                  src={club.logo_url}
                  alt={`${club.name} logo`}
                  style={{
                    width: '36px',
                    height: '36px',
                    marginRight: '10px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  onClick={() => setClickedClub(club)}
                />
              ) : (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    marginRight: '10px',
                    borderRadius: '6px',
                    backgroundColor: '#ccc',
                  }}
                />
              )}
              <span>{club.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* clcik here and the terms and conditions pop up */}
      {clickedClub && (
        <div

          onClick={async () => setClickedClub(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'black',
              padding: '20px',
              borderRadius: '10px',
              maxWidth: '300px',
              width: '90%',
              textAlign: 'center'
            }}>
            <img
              src={clickedClub.logo_url}
              alt={clickedClub.name}
              style={{ width: '100px', height: '100px', borderRadius: '8px', marginBottom: '10px' }}/>
            <h3>{clickedClub.name}</h3>

            <label>
              <input
                type="checkbox"
                checked={acceptedConditions}
                onChange={(e) => {
                  sendConditionToServer(e.target.checked);
                  setClickedClub(prev => ({ ...prev, is_checked: e.target.checked }));
                }}/>
              {' '} I agree to the terms and conditions of {clickedClub.name} and agree to be kind, respectful, and abide by club rules or i am subjected to termination from ClubHub
            </label><br />
            <button onClick={() => setClickedClub(null)} style={{ marginTop: '10px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileHeader;
