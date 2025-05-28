import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function CreateContentPage() {
  const [type, setType] = useState('post');
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isOpenEnded, setIsOpenEnded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [user, setUser] = useState(null);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('User fetch error:', userError.message);
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: memberships, error } = await supabase
        .from('user_clubs')
        .select('club_id, clubs!inner(name)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching joined clubs:', error.message);
      } else {
        const clubs = memberships.map((m) => ({
          id: m.club_id,
          name: m.clubs.name,
        }));
        setJoinedClubs(clubs);
        if (clubs.length > 0) setSelectedClubId(clubs[0].id);
      }

      setLoading(false);
    };

    fetchClubs();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!selectedClubId) {
      alert('Please select a club to post to.');
      setSubmitting(false);
      return;
    }

    const timestamp = new Date().toISOString();

    if (type === 'post') {
      let imageUrl = null;

      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}_${imageFile.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, imageFile, { upsert: true });

        if (uploadError) {
          console.error('Upload failed:', uploadError.message);
          alert('Image upload failed.');
          setSubmitting(false);
          return;
        }

        const { data: publicData } = supabase.storage.from('post-images').getPublicUrl(filePath);
        imageUrl = publicData.publicUrl;
      }

      const { error } = await supabase.from('posts').insert({
        club_id: selectedClubId,
        type: 'post',
        tag: 'post',
        content: caption,
        image_urls: imageUrl ? [imageUrl] : [],
        created_at: timestamp,
        user_id: user.id,
      });

      if (error) {
        console.error('Post error:', error.message);
        alert('Post failed to submit.');
      } else {
        alert('Post submitted!');
        setCaption('');
        setImage(null);
        setImageFile(null);
        window.location.href = '/feed';
      }
    } else {
      const { error } = await supabase.from('posts').insert({
        club_id: selectedClubId,
        type: 'poll',
        tag: 'poll',
        question,
        options: isOpenEnded ? [] : options,
        created_at: timestamp,
        user_id: user.id,
      });

      if (error) {
        console.error('Poll error:', error.message);
        alert('Poll failed to submit.');
      } else {
        alert('Poll submitted!');
        setQuestion('');
        setOptions(['', '']);
        setIsOpenEnded(false);
        window.location.href = '/feed';
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="feed-container">
      <h1>Create Content</h1>

      {loading ? (
        <p>Loading clubs...</p>
      ) : joinedClubs.length === 0 ? (
        <p>You haven’t joined any clubs yet. Join a club before creating content.</p>
      ) : (
        <form onSubmit={handleSubmit} className="create-content-form">
          <label>
            Select Club:
            <br />
            <select
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
            >
              {joinedClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            What do you want to create?
            <br />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="post">Post</option>
              <option value="poll">Poll</option>
            </select>
          </label>

          {type === 'post' && (
            <>
              <label>
                Upload Image:
                <br />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="imageUpload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="imageUpload" className="custom-file-upload">
                  Choose File
                </label>
                <div className="file-name">
                  {image ? 'File selected ✔️' : 'No file chosen'}
                </div>
              </label>

              {image && <img src={image} alt="preview" className="preview-image" />}

              <label>
                Caption:
                <br />
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </label>
            </>
          )}

          {type === 'poll' && (
            <>
              <label>
                Poll Question:
                <br />
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={isOpenEnded}
                  onChange={(e) => setIsOpenEnded(e.target.checked)}
                />
                Make this an open-ended poll
              </label>

              {!isOpenEnded && (
                <>
                  {options.map((opt, idx) => (
                    <input
                      key={idx}
                      value={opt}
                      placeholder={`Option ${idx + 1}`}
                      onChange={(e) => {
                        const copy = [...options];
                        copy[idx] = e.target.value;
                        setOptions(copy);
                      }}
                      style={{ marginBottom: '8px' }}
                    />
                  ))}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setOptions([...options, ''])}
                    >
                      Add Option
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (options.length > 0) {
                          const updated = [...options];
                          updated.pop();
                          setOptions(updated);
                        }
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#ff6b6b',
                        border: '1px solid #ff6b6b',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      ✕ Delete Last Option
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </form>
      )}
    </div>
  );
}

export default CreateContentPage;
