import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Post from './Post';
import Poll from './Polls';
import Event from './Event';
import Calendar from './Calendar';
import LikeButton from './LikeButton';
import { useParams } from 'react-router-dom';

function Feed() {
  const { clubId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [clubName, setClubName] = useState('');

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
        .select('*') // removed profiles join
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error loading posts:', postsError.message);
        return;
      }

      const postsWithMeta = await Promise.all(
        (postsData || []).map(async (post) => {
          // fetch profile name manually
          const { data: profileData, error: profileError } = await supabase
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

    if (user) {
      fetchPostsWithMeta();
    }
  }, [user]);

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
              <Poll
                key={item.id}
                id={item.id}
                question={item.question}
                options={item.options}
              />
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