import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

function CreateProfilePage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let avatarUrl = null;

    if (file) {
      const filePath = `avatars/${user.id}/${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        alert('Upload failed');
        return;
      }

      avatarUrl = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
    }

    await supabase.from('profiles').insert({
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
    });

    navigate('/join-or-create-club');
  };

  return (
    <div>
      <h1>Create Your Profile</h1>
      <form onSubmit={handleSubmit}>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Continue</button>
      </form>
    </div>
  );
}

export default CreateProfilePage;
