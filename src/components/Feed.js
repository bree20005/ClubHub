// src/components/Feed.js
import React, { useState } from 'react';
import Post from './Post';
import Poll from './Polls';
import Calendar from './Calendar';

function Feed() {
  const [posts, setPosts] = useState([
    {
      id: 3,
      type: 'post',
      content: 'We are so happy to have you join our space.',
    },
    {
      id: 2,
      type: 'poll',
      question: 'What day works best for our next meeting?',
      options: ['Mon', 'Wed', 'Fri'],
    },
    {
      id: 1,
      type: 'post',
      content: '💡 Reminder: Club meeting this Friday at 5PM in WCC!',
    },
  ]);

  const addContent = (newContent) => {
    setPosts([{ id: Date.now(), ...newContent }, ...posts]);
  };

  return (
    <div className="feed-container">
      {/* Landing Page Header */}
      <header className="landing-header">
        <h1>👋 Welcome to your WiCS Hub</h1>
        <p>Stay in the loop with polls, events, and updates from your favorite orgs.</p>
      </header>

      {/* Posts and Polls */}
      <div className="feed-items">
        {posts.map((item) => {
          if (item.type === 'post') return <Post key={item.id} content={item.content} />;
          if (item.type === 'poll') return <Poll key={item.id} question={item.question} options={item.options} />;
          return null;
        })}
      </div>

      {/* Calendar Section */}
      <section className="calendar-section">
        <h2>📅 Upcoming Events</h2>
        <Calendar />
      </section>
    </div>
  );
}

export default Feed;
