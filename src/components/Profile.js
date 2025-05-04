import React, { useState } from 'react';

function ProfileHeader() {
  const [food, setFood] = useState('None!'); 
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(food);

  const [hobbies, setHobbies] = useState('None!'); 
  const [isEditingHobbies, setIsEditingHobbies] = useState(false);
  const [inputValueHobbies, setInputValueHobbies] = useState(food);

  const handleEditClick = () => {
    setInputValue(food);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setFood(inputValue);
    setIsEditing(false);
  };

  const handleEditClickHobbies = () => {
    setInputValue(food);
    setIsEditing(true);
  };

  const handleSaveClickHobbies = () => {
    setFood(inputValue);
    setIsEditing(false);
  };

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
      <h1 style={{ color: 'white'}}>My Profile</h1>
      <br></br>
        <h3 style={{ color: '#1f0c44'}}>Welcome, Lyla Ibrahim!</h3>
        <img 
          src="/profilePhoto.jpeg" 
          alt="Profile" 
          className="profile-photo"
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: '10px', color: 'white' }}>
        <label>Food Allergies!: </label>
        {isEditing ? (
          <>
            <input 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              style={{ padding: '5px' }}
            />
            <button class="profile-edit-button" onClick={handleSaveClick} style={{ marginLeft: '10px' }}>
              Save
            </button>
          </>
        ) : (
          <>
            <span>{food}</span>
            <button class="profile-edit-button" onClick={handleEditClick} style={{ marginLeft: '10px' }}>
              Edit
            </button>
          </>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '10px', color: 'white' }}>
        <label>Other Clubs: </label>
        {isEditing ? (
          <>
            <input 
              value={inputValue} 
              onChange={(e) => setInputValueHobbies(e.target.value)} 
              style={{ padding: '5px' }}
            />
            <button class="profile-edit-button" onClick={handleSaveClickHobbies} style={{ marginLeft: '10px' }}>
              Save
            </button>
          </>
        ) : (
          <>
            <span>{food}</span>
            <button class="profile-edit-button" onClick={handleEditClickHobbies} style={{ marginLeft: '10px' }}>
              Edit
            </button>
          </>
        )}
      </div>



      
    </div>
  );
}

export default ProfileHeader;
