import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function ProfileHeader() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingHobbies, setIsEditingHobbies] = useState(false);
  const [isEditingPosition, setIsEditingPosition] = useState(false);

  const [food, setFood] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [position, setPosition] = useState('');

  const [avatarUrl, setAvatarUrl] = useState('');
  const [fullName, setFullName] = useState('');

  // Load user and profile
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    
      if (!user) {
        console.error('User is not logged in');
        return; // Stop execution if there's no user
      }
    
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setProfile(data);
        setFullName(data.full_name);
        setAvatarUrl(data.avatar_url);
        setFood(data.food_allergies || 'None');
        setHobbies(data.other_clubs || 'None');
        setPosition(data.position || 'None');
      }
    };
    

    loadProfile();
  }, []);

  const saveProfile = async (field, value) => {
    const updates = { id: user.id, [field]: value };
    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) alert('Failed to update: ' + error.message);
  };

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'white' }}>My Profile</h1>
        <br />
        <h3 style={{ color: '#1f0c44', fontSize: '30px' }}>
          Welcome, {fullName || 'User'}!
        </h3>
        <img
          src={avatarUrl || '/profilePhoto.jpeg'}
          alt="Profile"
          className="profile-photo"
        />
      </div>

      <div className="profile-container">
        {/* Food Allergies */}
        <div style={{ textAlign: 'center', marginTop: '10px', color: 'black' }}>
          <label>Food Allergies: </label>
          {isEditing ? (
            <>
              <input
                value={food}
                onChange={(e) => setFood(e.target.value)}
                style={{ padding: '5px' }}
              />
              <button
                className="profile-edit-button"
                onClick={() => {
                  setIsEditing(false);
                  saveProfile('food_allergies', food);
                }}
                style={{ marginLeft: '10px' }}
              >
                Save
              </button>
            </>
          ) : (
            <>
              <span>{food}</span>
              <button
                className="profile-edit-button"
                onClick={() => setIsEditing(true)}
                style={{ marginLeft: '10px' }}
              >
                Edit
              </button>
            </>
          )}
        </div>

        {/* Other Clubs */}
        <div style={{ textAlign: 'center', marginTop: '10px', color: 'black' }}>
          <label>Other Clubs: </label>
          {isEditingHobbies ? (
            <>
              <input
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                style={{ padding: '5px' }}
              />
              <button
                className="profile-edit-button"
                onClick={() => {
                  setIsEditingHobbies(false);
                  saveProfile('other_clubs', hobbies);
                }}
                style={{ marginLeft: '10px' }}
              >
                Save
              </button>
            </>
          ) : (
            <>
              <span>{hobbies}</span>
              <button
                className="profile-edit-button"
                onClick={() => setIsEditingHobbies(true)}
                style={{ marginLeft: '10px' }}
              >
                Edit
              </button>
            </>
          )}
        </div>

        {/* Position in WICS */}
        <div style={{ textAlign: 'center', marginTop: '10px', color: 'black' }}>
          <label>Position in WICS: </label>
          {isEditingPosition ? (
            <>
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                style={{ padding: '5px' }}
              />
              <button
                className="profile-edit-button"
                onClick={() => {
                  setIsEditingPosition(false);
                  saveProfile('position', position);
                }}
                style={{ marginLeft: '10px' }}
              >
                Save
              </button>
            </>
          ) : (
            <>
              <span>{position}</span>
              <button
                className="profile-edit-button"
                onClick={() => setIsEditingPosition(true)}
                style={{ marginLeft: '10px' }}
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
