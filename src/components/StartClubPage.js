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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
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
        alert('File upload failed. Please try again.');
        return;
      }

      const publicUrl = supabase.storage
        .from('club-assets')
        .getPublicUrl(upload.path).data.publicUrl;

      uploadResults[upload.key] = publicUrl;
    }

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
        alert(`Failed to create club: ${error.message}`);
        return;
      }

      await supabase.from('user_clubs').insert({
        user_id: user.id,
        club_id: club.id,
      });

      await supabase.from('club_admins').insert({
        user_id: user.id,
        club_id: club.id,
      });

      // window.location.href = `/club-success?code=${clubCode}&name=${encodeURIComponent(clubName)}`;

      navigate('/club-success', {
        state: { clubCode, clubName }
      });

    } catch (err) {
      alert('Something went wrong. Check the console for details.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#1e1333',
          borderRadius: '16px',
          padding: '3rem',
          width: '100%',
          maxWidth: '700px',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
          Start a New Club
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="clubName" style={{ display: 'block', marginBottom: '0.5rem' }}>Club Name</label>
            <input
              id="clubName"
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is your club about?"
              style={textareaStyle}
            />
          </div>

          <div>
            <label htmlFor="rules" style={{ display: 'block', marginBottom: '0.5rem' }}>Club Rules</label>
            <textarea
              id="rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={3}
              placeholder="Guidelines for members to follow"
              style={textareaStyle}
            />
          </div>

          <div>
            <label htmlFor="logoFile" style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Club Logo</label>
            <input
              id="logoFile"
              type="file"
              accept="image/*"
              onChange={(e) => {
                setLogoFile(e.target.files[0]);
                setLogoPreview(URL.createObjectURL(e.target.files[0]));
              }}
              style={inputStyle}
            />
            {logoPreview && (
              <img src={logoPreview} alt="Logo Preview" style={previewStyle} />
            )}
          </div>

          <div>
            <label htmlFor="coverFile" style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Cover Image</label>
            <input
              id="coverFile"
              type="file"
              accept="image/*"
              onChange={(e) => {
                setCoverFile(e.target.files[0]);
                setCoverPreview(URL.createObjectURL(e.target.files[0]));
              }}
              style={inputStyle}
            />
            {coverPreview && (
              <img src={coverPreview} alt="Cover Preview" style={previewStyle} />
            )}
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#fff',
              color: '#1e1333',
              fontSize: '1.1rem',
              padding: '1rem',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              marginTop: '1rem',
            }}
          >
            Create Club
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '1rem',
  fontSize: '1rem',
  borderRadius: '10px',
  border: '1px solid #ccc',
  backgroundColor: '#2c1f48',
  color: '#fff',
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
};

const previewStyle = {
  marginTop: '1rem',
  maxWidth: '100%',
  borderRadius: '10px',
};

export default StartClubPage;
