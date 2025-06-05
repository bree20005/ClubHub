import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

function CreateProfilePage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        alert('Not logged in');
        navigate('/login');
        return;
      }
   
      setUser(data.user);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', data.user.id)
        .single();
      
      if (profile?.full_name) {
        navigate('/join-or-create-club');
        return;
      }
      
      if (profile) {
        setFullName(profile.full_name || '');
      }
      
      setLoading(false);
    };

    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !fullName.trim()) return;

    setSubmitting(true);

    try {
      let avatarUrl = null;

      if (file) {
        const filePath = `avatars/${user.id}/${Date.now()}_${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload failed:', uploadError.message);
          alert('Failed to upload image.');
          setSubmitting(false);
          return;
        }

        avatarUrl = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
      }

      const { data: existing, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {

        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
        });

        if (insertError) {
          console.error('Insert failed:', insertError.message);
          alert('Could not create profile.');
          setSubmitting(false);
          return;
        }
      } else {
        const updateData = { full_name: fullName.trim() };
        if (avatarUrl) updateData.avatar_url = avatarUrl;

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (updateError) {
          console.error('Update failed:', updateError.message);
          alert('Could not update profile.');
          setSubmitting(false);
          return;
        }
      }

      navigate('/feed');
    } catch (error) {
      console.error('Profile creation error:', error);
      alert('An error occurred while creating your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return <p>Loading...</p>;

  return (
    <div className="profile-form">
      <h1>Create Your Profile</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          required
          disabled={submitting}
        />

        <label className="upload-button">
          Upload Headshot
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.svg,.heic,.heif"
            onChange={(e) => setFile(e.target.files[0])}
            hidden
            disabled={submitting}
          />
        </label>

        <button type="submit" disabled={submitting || !fullName.trim()}>
          {submitting ? 'Creating Profile...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}

export default CreateProfilePage;