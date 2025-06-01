import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

function CreateProfilePage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        alert('Not logged in');
        return;
      }
      setUser(data.user);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    let avatarUrl = null;

    // Upload avatar image
    if (file) {
      const filePath = `avatars/${user.id}/${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload failed:', uploadError.message);
        alert('Failed to upload image.');
        return;
      }

      avatarUrl = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
    }

    // Ensure profile row exists
    const { data: existing, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      // insert if missing
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      if (insertError) {
        console.error('Insert failed:', insertError.message);
        alert('Could not create profile.');
        return;
      }
    } else {
      // otherwise update
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update failed:', updateError.message);
        alert('Could not update profile.');
        return;
      }
    }

    navigate('/join-or-create-club');
  };

  if (loading || !user) return <p>Loading...</p>;

  return (
    <div className="profile-form">
      <h1>Create Your Profile</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          required
        />
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.svg,.heic,.heif"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Continue</button>
      </form>
    </div>
  );
}

export default CreateProfilePage;
