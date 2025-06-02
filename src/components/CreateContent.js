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
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventPoster, setEventPoster] = useState(null);
  const [eventPosterFile, setEventPosterFile] = useState(null);
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

  const handleImageChange = (e, setFileFn, setPreviewFn) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFn(URL.createObjectURL(file));
      setFileFn(file);
    }
  };

  const uploadFile = async (file, pathPrefix) => {
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicData } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!selectedClubId) {
      alert('Please select a club.');
      setSubmitting(false);
      return;
    }

    const timestamp = new Date().toISOString();

    try {
      // Fetch the author's full name from the profiles table using user.id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching author name:', profileError.message);
        return;
      }

      const authorName = profileData?.full_name || 'Unknown'; // Fallback to 'Unknown' if no name found

      // Handle creating a post
      if (type === 'post') {
        let imageUrl = null;
        if (imageFile) imageUrl = await uploadFile(imageFile, 'post');

        const { error } = await supabase.from('posts').insert({
          club_id: selectedClubId,
          type: 'post',
          tag: 'post',
          content: caption,
          image_urls: imageUrl ? [imageUrl] : [],
          created_at: timestamp,
          user_id: user.id,  // Store user_id for the post
          approved: true,
          author_name: authorName,  // Store the author's full name
        });

        if (error) throw new Error(error.message);
        alert('Post submitted!');
      }

      // Handle creating a poll
      if (type === 'poll') {
        const { error } = await supabase.from('posts').insert({
          club_id: selectedClubId,
          type: 'poll',
          tag: 'poll',
          question,
          options: isOpenEnded ? [] : options,
          created_at: timestamp,
          user_id: user.id,  // Store user_id for the post
          approved: true,
          author_name: authorName,  // Store the author's full name
        });

        if (error) throw new Error(error.message);
        alert('Poll submitted!');
      }

      // Handle creating an event
      if (type === 'event') {
        let posterUrl = null;
        if (eventPosterFile) posterUrl = await uploadFile(eventPosterFile, 'event');

        const { error } = await supabase.from('posts').insert({
          club_id: selectedClubId,
          type: 'event',
          tag: 'event',
          content: eventTitle,
          event_time: eventDate,
          image_urls: posterUrl ? [posterUrl] : [],
          created_at: timestamp,
          user_id: user.id,
          approved: true,
          author_name: authorName,
          rsvp_count: 0,
        });

        if (error) throw new Error(error.message);
        alert('Event submitted for approval!');
      }

      window.location.href = '/feed'; // Redirect after submission
    } catch (err) {
      alert(`Error: ${err.message}`);
    }

    setSubmitting(false);
  };

  return (
    <div className="feed-container">
      {loading ? (
        <p>Loading clubs...</p>
      ) : joinedClubs.length === 0 ? (
        <p>Join a club first before posting.</p>
      ) : (
        <form onSubmit={handleSubmit} className="create-content-form">
          <label>
            Select Club:
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
            Content Type:
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="post">Post</option>
              <option value="poll">Poll</option>
              <option value="event">Event</option>
            </select>
          </label>

          {type === 'post' && (
            <>
              <label>Upload Image:</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImageFile, setImage)} />
              {image && <img src={image} alt="preview" className="preview-image" />}
              <label>Caption:</label>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} />
            </>
          )}

          {type === 'poll' && (
            <>
              <label>Question:</label>
              <input value={question} onChange={(e) => setQuestion(e.target.value)} />
              <label>
                <input
                  type="checkbox"
                  checked={isOpenEnded}
                  onChange={(e) => setIsOpenEnded(e.target.checked)}
                />
                Open-ended poll
              </label>
              {!isOpenEnded &&
                options.map((opt, idx) => (
                  <input
                    key={idx}
                    value={opt}
                    placeholder={`Option ${idx + 1}`}
                    onChange={(e) => {
                      const copy = [...options];
                      copy[idx] = e.target.value;
                      setOptions(copy);
                    }}
                  />
                ))}
            </>
          )}

          {type === 'event' && (
            <>
              <label>Event Title:</label>
              <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
              <label>Date and Time:</label>
              <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <label>Upload Poster:</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setEventPosterFile, setEventPoster)} />
              {eventPoster && <img src={eventPoster} alt="event poster" className="preview-image" />}
            </>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
}

export default CreateContentPage;
