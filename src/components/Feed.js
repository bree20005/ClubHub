import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Post from './Post';
import Poll from './Polls';
import Event from './Event';
import Calendar from './Calendar';
import LikeButton from './LikeButton';
import { useParams, useNavigate } from 'react-router-dom';
import sampleCover from './assets/wics_cover.jpeg';

function Feed() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [clubName, setClubName] = useState('');
  const [clubCoverUrl, setClubCoverUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [loading, setLoading] = useState(true);
  const [clubRules, setClubRules] = useState('');
  const [rules, setRules] = useState('');
  const [description, setDescription] = useState('');

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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate("/loginnew");
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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching author name:', profileError.message);
        return;
      }

      const authorName = profileData?.full_name || 'Unknown'; 

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
          user_id: user.id,  
          approved: true,
          author_name: authorName, 
        });

        if (error) throw new Error(error.message);
        alert('Post submitted!');
      }

      if (type === 'poll') {
        const { error } = await supabase.from('posts').insert({
          club_id: selectedClubId,
          type: 'poll',
          tag: 'poll',
          question,
          options: isOpenEnded ? [] : options,
          created_at: timestamp,
          user_id: user.id,  
          approved: true,
          author_name: authorName, 
        });

        if (error) throw new Error(error.message);
        alert('Poll submitted!');
      }

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
        });

        if (error) throw new Error(error.message);
        alert('Event submitted for approval!');
      }

      navigate('/feed');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }

    setSubmitting(false);
    setShowModal(false);
  };

  useEffect(() => {
    if (!clubId) return;
    const fetchClubCover = async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('cover_url, name, rules, description')
        .eq('id', clubId, rules, description)
        .single();
      if (error) {
        console.error('Error fetching club cover:', error.message);
      } else {
        setClubCoverUrl(data.cover_url);
        setClubName(data.name);
        setRules(data.rules)
        setDescription(data.description)
      }
    };
    fetchClubCover();
  }, [clubId]);

  useEffect(() => {
    if (!clubId) return;
  
    const fetchClubRules = async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('rules')
        .eq('id', clubId)
        .single();
  
      if (error) {
        console.error('Error fetching club rules:', error.message);
        setClubRules('');
      } else {
        setClubRules(data.rules || '');
      }
    };
  
    fetchClubRules();
  }, [clubId]);  

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('User load error:', error.message);
        return;
      }
      setUser(data.user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchPostsWithMeta = async () => {
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('approved', true)
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error loading posts:', postsError.message);
        return;
      }

      const postsWithMeta = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', post.user_id)
            .single();
  
          const [likesRes, commentsRes] = await Promise.all([
            supabase.from('likes').select('*').eq('post_id', post.id),
            supabase
              .from('comments')
              .select('id, content, profiles(full_name)')
              .eq('post_id', post.id)
              .order('created_at', { ascending: true }),
          ]);

          const likeCount = likesRes?.data?.length ?? 0;
          const commentData = commentsRes?.data ?? [];

          return {
            ...post,
            authorName: profileData?.full_name || 'Unknown',
            likes: likesRes?.data?.length ?? 0,
            comments: commentsRes?.data ?? [],
            userHasLiked: likesRes?.data?.some((like) => like.user_id === user?.id),
          };
        })
      );

      setPosts(postsWithMeta);
    };

    if (user && clubId) fetchPostsWithMeta();
}, [user, clubId]);

  const filteredPosts =
    selectedFilter === 'all'
      ? posts
      : posts.filter((post) => post.tag === selectedFilter);

  return (
    
    <div className="feed-container" style={{ position: 'relative' }}>
      {/* Dimmed background */}
      {showModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={() => setShowModal(false)}
        />
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#17092f',
            padding: '2rem',
            borderRadius: '12px',
            zIndex: 1000,
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}
        >
          <h2 style={{textAlign: 'center'}}>Create Post</h2>
          <button
            onClick={() => setShowModal(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#999',
            }}
            aria-label="Close Modal"
          >
            &times;
          </button>
          
          {/* Create content here*/}
        <div className="feed-container">
            {loading ? (
              <p>Loading clubs...</p>
            ) : joinedClubs.length === 0 ? (
              <p>Join a club first before posting.</p>
            ) : (
              <form onSubmit={handleSubmit} className="create-content-form" style={{height: '400px', width: '100%', overflow: 'scroll'}}>
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
                    <label
                      style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        backgroundColor: '#4b367c',
                        color: '#f0eaff',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        userSelect: 'none',
                        marginBottom: '10px',
                        width: '150px'
                      }}
                    >
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setImageFile, setImage)}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {image && (
                      <img
                        src={image}
                        alt="preview"
                        style={{
                          maxWidth: '150px',
                          maxHeight: '150px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          marginTop: '10px',
                        }}
                      />
                    )}
                    <label>Caption:</label>
                    <textarea value={caption} onChange={(e) => setCaption(e.target.value)} />
                  </>
                )}

                {type === 'poll' && (
                  <>
                    <label>Question:</label>
                    <input value={question} onChange={(e) => setQuestion(e.target.value)} />
                    {/* <label>
                      <input
                        type="checkbox"
                        checked={isOpenEnded}
                        onChange={(e) => setIsOpenEnded(e.target.checked)}
                      />
                      Open-ended poll
                    </label> */}
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

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'block',
                    margin: '20px auto 0',
                    padding: '12px 24px',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    backgroundColor: '#4b367c',
                    color: '#f0eaff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            )}
        </div>
    </div>
      )}

      <header className="landing-header">
        <div className="header-content">
          <div>
            <img
              src={clubCoverUrl || sampleCover}
              alt="Club Cover Photo"
              style={{
                width: '100%',
                maxHeight: '220px',
                objectFit: 'cover',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                marginBottom: '10px',
              }}
            />
            <h1 style={{ color: '#1f0c44', fontSize: '3rem', marginTop: '-5px' }}>
              Welcome to your {clubName || 'Club'} Hub
            </h1>
            <p style={{ color: '#1f0c44', marginBottom: '10px' }}>
              Stay in the loop with polls, events, and updates!
            </p>

            {clubRules && (
              <div
              style={{
                marginTop: '1.5rem',
                marginBottom: '1.5rem',
                padding: '1.25rem 1.5rem',
                borderRadius: '14px', 
                color: '#5A3E99',  
                backdropFilter: 'blur(10px)',
                fontSize: '1rem',
                lineHeight: 1.6,
                fontWeight: 400,
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                userSelect: 'text',
                backgroundImage: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0))', 
                backgroundColor: 'rgba(75, 54, 124, 0.25)',
              }}
            >
                <strong style={{color: 'black'}}>📌 Club Guidelines:</strong>
                <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-line', color: 'black', textAlign: 'left'}}>{clubRules}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="feed-filter">
        {['all', 'event', 'poll', 'post'].map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedFilter(tag)}
            className={`filter-button ${selectedFilter === tag ? 'active' : ''}`}
          >
            {tag === 'all'
              ? '🔁 All'
              : tag === 'event'
              ? '🗓️ Events'
              : tag === 'poll'
              ? '📊 Polls'
              : '📝 Posts'}
          </button>
        ))}
      </div>

      <div className="create-button" style={{ textAlign: 'center'}}>
        <button
          onClick={() => setShowModal(true)}
          aria-label="Add Content"
          style={{
            backgroundColor: 'transparent',
            color: '#7c5e99',
            border: '2px solid #7c5e99',
            padding: '6px 10px',
            marginBottom: '40px',
            marginTop: '50px',
            paddingTop: '0px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1.4rem',
            lineHeight: 1,
            width: '36px',
            height: '36px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.2s ease',
            userSelect: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#7c5e99';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#7c5e99';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          +
        </button>
      </div>

      <div className="feed-items">
        {filteredPosts.map((item) => {
          if (!user) return null; 

          if (item.type === 'post') {
            return (
              <Post
                key={item.id}
                id={item.id}
                content={item.content}
                tag={item.tag}
                image={item.image_urls?.[0] || null}
                imageGallery={item.image_urls || []}
                comments={item.comments}
                user={user}
                authorName={item.authorName}
                clubId={item.club_id} 
                createdAt={item.created_at}
              />

              
            );
          }
          if (item.type === 'poll') {
            return (
              <Poll key={item.id} id={item.id} question={item.question} options={item.options} />
            );
          }
          if (item.type === 'event') {
            return (
              <Event
                key={item.id}
                id={item.id}
                content={item.content}
                eventTime={item.event_time}
                image={item.image_urls?.[0] || null}
                authorName={item.authorName}
                createdAt={item.created_at}
                clubId={item.club_id} 
                user={user}
              />
            );
          }
          return null;
        })}
      </div>

      {/* <div>
      <button onClick={signOut}>Sign out</button>
    </div> */}

      </div>
  );
}

export default Feed;