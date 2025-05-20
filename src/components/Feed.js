import React, { useState } from 'react';
import Post from './Post';
import Poll from './Polls';
import Calendar from './Calendar';

function Feed() {
  const clubs = ['WiCS', 'OSTEM', 'SOLE'];
  const [selectedClub, setSelectedClub] = useState(clubs[0]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const initialClubPosts = {
    WiCS: [
      {
        id: 3,
        type: 'event',
        tag: 'event',
        content: '🎉 Spring Social Mixer at White Plaza!',
        date: '2025-05-25',
        imageGallery: [],
        likes: 0,
        comments: [],
      },
      {
        id: 2,
        type: 'poll',
        tag: 'poll',
        question: 'What day works best for our next meeting?',
        options: ['Mon', 'Wed', 'Fri'],
      },
      {
        id: 1,
        type: 'announcement',
        tag: 'announcement',
        content: '💡 Reminder: Club meeting this Friday at 5PM in WCC!',
        likes: 2,
        comments: ['See you there!', 'Can’t wait!'],
      },
    ],
    OSTEM: [
      {
        id: 4,
        type: 'event',
        tag: 'event',
        content: 'OSTEM Game Night this Thursday!',
        likes: 5,
        comments: ['Excited!', 'I’m bringing snacks!'],
        imageGallery: [],
      },
    ],
    SOLE: [
      {
        id: 5,
        type: 'poll',
        tag: 'poll',
        question: 'Which workshop would you attend?',
        options: ['Tech Interview Prep', 'Resume Review', 'Coffee Chat'],
      },
    ],
  };

  const [posts, setPosts] = useState(initialClubPosts[selectedClub]);

  const handleClubChange = (club) => {
    setSelectedClub(club);
    setSelectedFilter('all'); // reset filter when switching clubs
    setPosts(initialClubPosts[club] || []);
  };

  const updatePost = (index, updatedPost) => {
    const updated = [...posts];
    updated[index] = updatedPost;
    setPosts(updated);
  };

  const addContent = (newContent) => {
    const updatedPosts = [{ id: Date.now(), ...newContent }, ...posts];
    setPosts(updatedPosts);
    initialClubPosts[selectedClub] = updatedPosts;
  };

  const filteredPosts = selectedFilter === 'all'
    ? posts
    : posts.filter((post) => post.tag === selectedFilter);

  return (
    <div className="feed-container">
      <header className="landing-header">
        <div className="header-content">
          <div>
            <h1>👋 Welcome to your {selectedClub} Hub</h1>
            <p>Stay in the loop with polls, events, and updates from your favorite orgs.</p>
          </div>
          <button className="login-button">Login / Sign Up</button>
        </div>

        <div className="club-selector">
          <label htmlFor="club-select">Switch Club:</label>
          <select
            id="club-select"
            value={selectedClub}
            onChange={(e) => handleClubChange(e.target.value)}
          >
            {clubs.map((club) => (
              <option key={club} value={club}>
                {club}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Tag Filters */}
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

      {/* Feed Content */}
      <div className="feed-items">
        {filteredPosts.map((item, index) => {
          if (item.type === 'post' || item.type === 'event' || item.type === 'announcement') {
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
                  updatePost(index, updatedPost);
                }}
                onComment={(newComment) => {
                  const updatedPost = {
                    ...item,
                    comments: [...(item.comments || []), newComment],
                  };
                  updatePost(index, updatedPost);
                }}
                onUploadPhoto={(file) => {
                  const fakeUrl = URL.createObjectURL(file); // replace later with Supabase upload
                  const updatedPost = {
                    ...item,
                    imageGallery: [...(item.imageGallery || []), fakeUrl],
                  };
                  updatePost(index, updatedPost);
                }}
              />
            );
          }

          if (item.type === 'poll') {
            return <Poll key={item.id} question={item.question} options={item.options} />;
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