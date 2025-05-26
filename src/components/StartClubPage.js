import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

function StartClubPage() {
  const navigate = useNavigate();
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clubCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const uploads = [];

    if (logoFile) {
      const path = `club-logos/${Date.now()}_${logoFile.name}`;
      uploads.push({
        key: 'logo_url',
        file: logoFile,
        path,
      });
    }

    if (coverFile) {
      const path = `club-covers/${Date.now()}_${coverFile.name}`;
      uploads.push({
        key: 'cover_url',
        file: coverFile,
        path,
      });
    }

    const uploadResults = {};
    for (let upload of uploads) {
      const { data, error } = await supabase.storage
        .from('club-assets')
        .upload(upload.path, upload.file);
      if (error) {
        alert('Upload failed');
        return;
      }
      uploadResults[upload.key] = supabase.storage
        .from('club-assets')
        .getPublicUrl(data.path).data.publicUrl;
    }

    const { data: club, error } = await supabase
      .from('clubs')
      .insert({
        name: clubName,
        description,
        rules,
        code: clubCode,
        creator_id: user.id,
        logo_url: uploadResults.logo_url,
        cover_url: uploadResults.cover_url,
      })
      .select()
      .single();

    await supabase.from('user_clubs').insert({
      user_id: user.id,
      club_id: club.id,
    });

    await supabase.from('club_admins').insert({
      user_id: user.id,
      club_id: club.id,
    });

    alert(`Club created! Share this code: ${clubCode}`);
    navigate('/feed');
  };

  return (
    <div>
      <h2>Create Your Club</h2>
      <form onSubmit={handleSubmit}>
        <input value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Club Name" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Club Description" />
        <textarea value={rules} onChange={(e) => setRules(e.target.value)} placeholder="Club Rules" />
        <label>Logo: <input type="file" onChange={(e) => setLogoFile(e.target.files[0])} /></label>
        <label>Cover Image: <input type="file" onChange={(e) => setCoverFile(e.target.files[0])} /></label>
        <button type="submit">Create Club</button>
      </form>
    </div>
  );
}

export default StartClubPage;
