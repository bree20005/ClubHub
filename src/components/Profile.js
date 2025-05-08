import React, { useState } from 'react';

function ProfileHeader() {
  const [food, setFood] = useState('None'); 
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(food);

  const [hobbies, setHobbies] = useState('None'); 
  const [isEditingHobbies, setIsEditingHobbies] = useState(false);
  const [inputValueHobbies, setInputValueHobbies] = useState(hobbies);

  const [position, setPosition] = useState('None'); 
  const [isEditingPosition, setIsEditingPosition] = useState(false);
  const [inputValuePosition, setInputValuePosition] = useState(position);

  const handleEditClick = () => {
    setInputValue(food);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setFood(inputValue);
    setIsEditing(false);
  };

  const handleEditClickHobbies = () => {
    setInputValueHobbies(hobbies);
    setIsEditingHobbies(true);
  };

  const handleSaveClickHobbies = () => {
    setHobbies(inputValueHobbies);
    setIsEditingHobbies(false);

  };

  const handleEditClickPosition = () => {
    setInputValuePosition(position);
    setIsEditingPosition(true);
  };

  const handleSaveClickPosition = () => {
    setPosition(inputValuePosition);
    setIsEditingPosition(false);
  };

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
      <h1 style={{ color: 'white'}}>My Profile</h1>
      <br></br>
        <h3 style={{ color: '#1f0c44', fontSize: '30px'}}>Welcome, Lyla Ibrahim!</h3>
        <img 
          src="/profilePhoto.jpeg" 
          alt="Profile" 
          className="profile-photo"
        />
      </div>
      <div class="profile-container">
        <div style={{ textAlign: 'center', marginTop: '10px', color: 'black'}}>
          <label>Food Allergies: </label>
          {isEditing ? (
            <>
              <input 
                style={{ border: 'none', borderRadius: '5px' }}
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

        <div style={{ textAlign: 'center', marginTop: '10px', color: 'black' }}>
          <label>Other Clubs: </label>
          {isEditingHobbies ? (
            <>
              <input 
                value={inputValueHobbies} 
                onChange={(e) => setInputValueHobbies(e.target.value)} 
                style={{ padding: '5px' }}
              />
              <button class="profile-edit-button" onClick={handleSaveClickHobbies} style={{ marginLeft: '10px' }}>
                Save
              </button>
            </>
          ) : (
            <>
              <span>{hobbies}</span>
              <button class="profile-edit-button" onClick={handleEditClickHobbies} style={{ marginLeft: '10px' }}>
                Edit
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '10px', color: 'black' }}>
          <label>Position in Wics: </label>
          {isEditingPosition ? (
            <>
              <input 
                value={inputValuePosition} 
                onChange={(e) => setInputValuePosition(e.target.value)} 
                style={{ padding: '5px' }}
              />
              <button class="profile-edit-button" onClick={handleSaveClickPosition} style={{ marginLeft: '10px' }}>
                Save
              </button>
            </>
          ) : (
            <>
              <span>{hobbies}</span>
              <button class="profile-edit-button" onClick={handleEditClickPosition} style={{ marginLeft: '10px' }}>
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
