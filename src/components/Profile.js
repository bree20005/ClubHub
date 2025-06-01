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

  //the header 3 needs to be fixed but it wont let me directly comment next to it
  return (
    <div className="profile-page">
  <div className="profile-left">
    <h1 style={{ color: 'white', textAlign: 'center' }}>Welcome, {fullName || 'User'}!</h1>
    {avatarUrl ? (
      <img
        src={avatarUrl}
        alt="Profile"
        className="profile-photo"
        style={{ borderRadius: '50%', width: '120px', height: '120px', display: 'block', margin: '0 auto' }}
      />
    ) : (
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: '#ccc',
          margin: '0 auto',
          lineHeight: '120px',
          color: '#555',
          fontSize: '14px',
          textAlign: 'center',
        }}
      />
    )}
    <label
      htmlFor="avatar-upload"
      className="edit-picture"
      style={{
        display: 'block',
        marginTop: '8px',
        color: '#121212',
        fontSize: '0.85rem',
        textAlign: 'center',
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

  <div className="profile-right">
    <h3 style={{ marginBottom: '1rem', color: '#222' }}>My Clubs:</h3>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {clubs.map((club, index) => (
        <li key={index} className="club-card" style={{ cursor: 'pointer' }}>
          {club.logo_url ? (
            <img
              src={club.logo_url}
              alt={`${club.name} logo`}
              style={{
                width: '36px',
                height: '36px',
                marginRight: '12px',
                borderRadius: '6px',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: '36px',
                height: '36px',
                marginRight: '12px',
                borderRadius: '6px',
                backgroundColor: '#ccc',
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ fontSize: '1.1rem', color: '#333', fontWeight: '600' }}>{club.name}</span>
        </li>
      ))}
    </ul>
  </div>
</div>

    // <div>
    //   <div style={{ textAlign: 'center' }}>
    //     <h1 style={{ color: 'white' }}>My Profile</h1>
    //     <br />
    //     <h3 style={{ color: '#1f0c44', fontSize: '30px' }}> 
    //       Welcome, {fullName || 'User'}! 
    //     </h3>
    //     {avatarUrl ? (
    //       <img
    //         src={avatarUrl}
    //         alt="Profile"
    //         className="profile-photo"
    //         style={{ borderRadius: '50%', width: '120px', height: '120px' }}
    //       />
    //     ) : (
    //       <div
    //         style={{
    //           width: '120px',
    //           height: '120px',
    //           borderRadius: '50%',
    //           backgroundColor: '#ccc',
    //           display: 'inline-block',
    //           lineHeight: '120px',
    //           color: '#555',
    //           fontSize: '14px',
    //         }}
    //       />
    //     )}
    //     <br />
    //     <input type="file" onChange={handleAvatarUpload} style={{ marginTop: '10px' }} />
    //   </div>

    //   <div style={{ textAlign: 'center', marginTop: '20px', color: 'black' }}>
    //     <h3>My Clubs:</h3>
    //     <ul style={{ listStyle: 'none', padding: 0 }}>
    //       {clubs.map((club, index) => (
    //         <li
    //           key={index}
    //           style={{
    //             display: 'flex',
    //             alignItems: 'center',
    //             justifyContent: 'center',
    //             padding: '6px',
    //           }}
    //         >
    //           {club.logo_url ? (
    //             <img
    //               src={club.logo_url}
    //               alt={`${club.name} logo`}
    //               style={{
    //                 width: '36px',
    //                 height: '36px',
    //                 marginRight: '10px',
    //                 borderRadius: '6px',
    //                 objectFit: 'cover',
    //                 cursor: 'pointer',
    //               }}
    //             />
    //           ) : (
    //             <div
    //               style={{
    //                 width: '36px',
    //                 height: '36px',
    //                 marginRight: '10px',
    //                 borderRadius: '6px',
    //                 backgroundColor: '#ccc',
    //               }}
    //             />
    //           )}
    //           <span>{club.name}</span>
    //         </li>
    //       ))}
    //     </ul>
    //   </div>
    // </div>
  );
}

export default ProfileHeader;