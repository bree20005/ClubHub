import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Post from './Post';
import Poll from './Polls';
import Calendar from './Calendar';
import ClubAutoJoin from './ClubAutoJoin';

function Feed() {
  const [user, setUser] = useState(null);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Load user and joined clubs
  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('User load error:', userError.message);
        return;
      }

      setUser(user);

      if (user) {
        const { data: memberships, error: membershipError } = await supabase
          .from('user_clubs')
          .select('club_id, clubs!inner(name)')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Error loading user clubs:', membershipError.message);
        } else {
          const clubNames = memberships.map((m) => m.clubs.name);
          setJoinedClubs(clubNames);
          setSelectedClub((prev) =>
            clubNames.includes(prev) ? prev : clubNames[0] || ''
          );
        }
      }
    };

    loadData();
  }, []);

  // Load posts when club changes
  useEffect(() => {
    const fetchPosts = async () => {
      if (!selectedClub) return;

      const { data: club, error } = await supabase
        .from('clubs')
        .select('id')
        .eq('name', selectedClub)
        .single();

      if (error) {
        console.error('Error fetching club ID:', error.message);
        return;
      }

      const { data: posts, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('club_id', club.id)
        .order('created_at', { ascending: false });

      if (postError) {
        console.error('Error loading posts:', postError.message);
      } else {
        setPosts(posts || []);
      }
    };

    fetchPosts();
  }, [selectedClub]);

  const filteredPosts =
    selectedFilter === 'all'
      ? posts
      : posts.filter((post) => post.tag === selectedFilter);

  return (
    <div className="feed-container">
      <header className="landing-header">
        <div className="header-content">
          <div>
            <h1>👋 Welcome to your {selectedClub || 'Club'} Hub</h1>
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

        {/* Club Switcher */}
        <div className="club-selector">
          <label htmlFor="club-select">Switch Club:</label>
          <select
            id="club-select"
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
          >
            {joinedClubs.map((club) => (
              <option key={club} value={club}>
                {club}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-Join Club Section */}
        <ClubAutoJoin
          user={user}
          onClubJoined={async () => {
            const { data: memberships } = await supabase
              .from('user_clubs')
              .select('club_id, clubs!inner(name)')
              .eq('user_id', user.id);

            const clubNames = memberships.map((m) => m.clubs.name);
            setJoinedClubs(clubNames);
            setSelectedClub((prev) =>
              clubNames.includes(prev) ? prev : clubNames[0] || ''
            );
          }}
        />
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
                image={item.image}
                imageGallery={item.imageGallery || []}
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
              <Poll key={item.id} question={item.question} options={item.options} />
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