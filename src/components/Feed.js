import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Post from './Post';
import Poll from './Polls';
import Calendar from './Calendar';
import { useParams } from 'react-router-dom';

function Feed() {
  const { clubId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [clubName, setClubName] = useState('');

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('User load error:', error.message);
        return;
      }

      setUser(user);
    };

    loadUser();
  }, []);
  useEffect(() => {
    const fetchPosts = async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('Error loading posts:', error.message);
      } else {
        console.log('Fetched posts:', posts);  // ✅ Add this
        setPosts(posts || []);
      }
    };
  
    fetchPosts();
  }, []);
  
  // // Load posts for selected club
  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     if (!clubId) return;

  //     const { data: club, error: clubError } = await supabase
  //       .from('clubs')
  //       .select('id, name')
  //       .eq('id', clubId)
  //       .single();

  //     if (clubError) {
  //       console.error('Error fetching club:', clubError.message);
  //       return;
  //     }

  //     setClubName(club.name);

  //     const { data: posts, error: postError } = await supabase
  //       .from('posts')
  //       .select('*')
  //       .eq('club_id', club.id)
  //       .order('created_at', { ascending: false });

  //     if (postError) {
  //       console.error('Error loading posts:', postError.message);
  //     } else {
  //       setPosts(posts || []);
  //     }
  //   };

  //   fetchPosts();
  // }, [clubId]);

  const filteredPosts =
    selectedFilter === 'all'
      ? posts
      : posts.filter((post) => post.tag === selectedFilter);

  return (
    <div className="feed-container">
      <header className="landing-header">
        <div className="header-content">
          <div>
            <h1>👋 Welcome to your {clubName || 'Club'} Hub</h1>
            <p>Stay in the loop with polls, events, and updates from your favorite orgs.</p>
          </div>
          {!user ? (
            <button
              className="login-button"
              onClick={() =>
                supabase.auth.signInWithOAuth({ provider: 'google' })
              }
            >
              Login with Google
            </button>
          ) : (
            <button
              className="login-button"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Filter Buttons */}
      <div className="feed-filter">
        {['all', 'event', 'announcement', 'poll'].map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedFilter(tag)}
            className={`filter-button ${selectedFilter === tag ? 'active' : ''}`}
          >
            {tag === 'all'
              ? '🔁 All'
              : tag === 'event'
              ? '🗓️ Events'
              : tag === 'announcement'
              ? '📣 Announcements'
              : '📊 Polls'}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="feed-items">
        {filteredPosts.map((item, index) => {
          if (['post', 'event', 'announcement'].includes(item.type)) {
            return (
              <Post
                key={item.id}
                content={item.content}
                tag={item.tag}
                image={item.image_urls?.[0]} // Updated to use first image in array
                imageGallery={item.image_urls || []}
                likes={item.likes}
                comments={item.comments}
                onLike={() => {
                  const updatedPost = { ...item, likes: item.likes + 1 };
                  const newPosts = [...posts];
                  newPosts[index] = updatedPost;
                  setPosts(newPosts);
                }}
                onComment={(newComment) => {
                  const updatedPost = {
                    ...item,
                    comments: [...(item.comments || []), newComment],
                  };
                  const newPosts = [...posts];
                  newPosts[index] = updatedPost;
                  setPosts(newPosts);
                }}
              />
            );
          }

          if (item.type === 'poll') {
            return (
              <Poll
                key={item.id}
                id={item.id}
                question={item.question}
                options={item.options}
              />
            );
          }          

          return null;
        })}
      </div>

      <section className="calendar-section">
        <h2>📅 Upcoming Events</h2>
        <Calendar />
      </section>
    </div>
  );
}

export default Feed;
