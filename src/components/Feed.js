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

  useEffect(() => {
    if (!clubId) return;
    const fetchClubCover = async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('cover_url, name')
        .eq('id', clubId)
        .single();
      if (error) {
        console.error('Error fetching club cover:', error.message);
      } else {
        setClubCoverUrl(data.cover_url);
        setClubName(data.name);
      }
    };
    fetchClubCover();
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
              .select('*, profiles(full_name)')
              .eq('post_id', post.id)
              .order('created_at', { ascending: true }),
          ]);

          const likeCount = likesRes?.data?.length ?? 0;
          const commentData = commentsRes?.data ?? [];

          return {
            ...post,
            authorName: profileData?.full_name || 'Unknown',
            likes: likeCount,
            comments: commentData,
            userHasLiked: likesRes?.data?.some((like) => like.user_id === user?.id),
          };
        })
      );

      setPosts(postsWithMeta);
    };

    if (user) fetchPostsWithMeta();
  }, [user]);

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
            background: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            zIndex: 1000,
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}
        >
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
          <h2 style={{ marginTop: 0 }}>🎉 New Feature!</h2>
          <p>This is an example popup. You can place announcements, surveys, or anything here.</p>
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

      <div className="create-button" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={() => setShowModal(true)} // Show popup
          aria-label="Add Content"
          style={{
            backgroundColor: 'transparent',
            color: '#7c5e99',
            border: '2px solid #7c5e99',
            padding: '6px 10px',
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
                content={item.content}
                eventTime={item.event_time}
                image={item.image_urls?.[0] || null}
                authorName={item.authorName}
                createdAt={item.created_at}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default Feed;
