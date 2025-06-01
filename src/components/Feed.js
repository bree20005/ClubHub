import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Post from './Post';
import Poll from './Polls';
import Calendar from './Calendar';
import LikeButton from './LikeButton';
import { useParams } from 'react-router-dom';

function Feed() {
  const { clubId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [clubName, setClubName] = useState('');
  const [rules, setRules] = useState('');

  // Load user and get the rules for the specific club
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('User load error:', error.message);
        return;
      }
  
      setUser(data.user);
  
      // Fetch the user's club
      const { data: userClub, error: userClubError } = await supabase
        .from('user_clubs')
        .select('club_id')
        .eq('user_id', data.user.id)
        .single();
  
      if (userClubError || !userClub) {
        console.error('User club fetch error:', userClubError);
        return;
      }

      const { data: clubData, error: rulesError } = await supabase
        .from('clubs')
        .select('rules')
        .eq('id', userClub.club_id)
        .single();
  
      if (rulesError || !clubData) {
        console.error('Rules fetch error:', rulesError);
        return;
      }

      setRules(clubData.rules);
    };
  
    loadUser();
  }, []);
  


  // Load posts, likes, and comments
  useEffect(() => {
    const fetchPostsWithMeta = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*, profiles (full_name)')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error loading posts:', postsError.message);
        return;
      }

      const postsWithMeta = await Promise.all(
        (postsData || []).map(async (post) => {
          const [likesRes, commentsRes] = await Promise.all([
            supabase
              .from('likes')
              .select('*')
              .eq('post_id', post.id),

            supabase
              .from('comments')
              .select('*, profiles (full_name)')
              .eq('post_id', post.id)
              .order('created_at', { ascending: true }),
          ]);

          const likeCount = likesRes?.data?.length ?? 0;
          const commentData = commentsRes?.data ?? [];

          return {
            ...post,
            likes: likeCount,
            comments: commentData,
            userHasLiked: likesRes?.data?.some(like => like.user_id === user?.id),
          };
        })
      );

      setPosts(postsWithMeta);
    };

    if (user) {
      fetchPostsWithMeta();
    }
  }, [user]);

  const handleLike = async (postId) => {
    if (!user) return;

    const { error } = await supabase.from('likes').insert({
      post_id: postId,
      user_id: user.id,
    });

    if (error) {
      console.error('Error liking post:', error.message);
      return;
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.likes + 1,
              userHasLiked: true,
            }
          : post
      )
    );
  };

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
            <p>Remeber the rules of {clubName}: {rules} !!!</p>
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
        {filteredPosts.map((item) => {
          if (['post', 'event', 'announcement'].includes(item.type)) {
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
                authorName={item.profiles?.full_name || 'Unknown'}
                createdAt={item.created_at}
                likeButton={
                  <LikeButton
                    postId={item.id}
                    user={user}
                    initialLiked={item.userHasLiked}
                    initialCount={item.likes}
                  />
                }
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
