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
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [user, setUser] = useState(null);

  // 🔐 Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        console.log('👤 User ID:', data.user.id);
      } else {
        console.error('User not found or not authenticated');
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert('User not authenticated. Please log in.');
      return;
    }

    const clubCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('🔢 Generated Club Code:', clubCode);

    // Upload files
    const uploads = [];
    if (logoFile) {
      const path = `club-logos/${Date.now()}_${logoFile.name.replace(/\s+/g, '_')}`;
      uploads.push({ key: 'logo_url', file: logoFile, path });
    }
    if (coverFile) {
      const path = `club-covers/${Date.now()}_${coverFile.name.replace(/\s+/g, '_')}`;
      uploads.push({ key: 'cover_url', file: coverFile, path });
    }

    const uploadResults = {};
    for (const upload of uploads) {
      const { data, error } = await supabase.storage
        .from('club-assets')
        .upload(upload.path, upload.file);

      if (error) {
        console.error('❌ File upload error:', error);
        alert('File upload failed. Please try again.');
        return;
      }

      const publicUrl = supabase.storage
        .from('club-assets')
        .getPublicUrl(upload.path).data.publicUrl;

      uploadResults[upload.key] = publicUrl;
    }

    // Insert club into DB
    try {
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

      if (error) {
        console.error('❌ Club creation error:', error);
        alert(`Failed to create club: ${error.message}`);
        return;
      }

      console.log('✅ Club created:', club);

      // Add user to user_clubs and club_admins
      await supabase.from('user_clubs').insert({
        user_id: user.id,
        club_id: club.id,
      });

      await supabase.from('club_admins').insert({
        user_id: user.id,
        club_id: club.id,
      });

      navigate('/club-success', {
        state: { clubCode, clubName: clubName },
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Something went wrong. Check the console for details.');
    }
  };

  return (
    <div className="feed-container">
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Start a New Club</h2>
      <form className="create-content-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="clubName">Club Name</label>
          <input
            id="clubName"
            type="text"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What is your club about?"
          />
        </div>

        <div>
          <label htmlFor="rules">Club Rules</label>
          <textarea
            id="rules"
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            rows={3}
            placeholder="Guidelines for members to follow"
          />
        </div>

        <div>
          <label htmlFor="logoFile">Upload Club Logo</label>
          <input
            id="logoFile"
            type="file"
            accept="image/*"
            onChange={(e) => {
              setLogoFile(e.target.files[0]);
              setLogoPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />
          {logoPreview && (
            <img src={logoPreview} alt="Logo Preview" className="preview-image" />
          )}
        </div>

        <div>
          <label htmlFor="coverFile">Upload Cover Image</label>
          <input
            id="coverFile"
            type="file"
            accept="image/*"
            onChange={(e) => {
              setCoverFile(e.target.files[0]);
              setCoverPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />
          {coverPreview && (
            <img src={coverPreview} alt="Cover Preview" className="preview-image" />
          )}
        </div>

        <button type="submit">Create Club</button>
      </form>
    </div>
  );
}

export default StartClubPage;
