// src/components/Feed.js
import React, { useState } from 'react';
import Post from './Post';
import Poll from './Polls';
import Calendar from './Calendar';

function Feed() {
  const [posts, setPosts] = useState([
    { id: 2, type: 'poll', question: 'What day works best?', options: ['Mon', 'Wed', 'Fri'] },
  ]);

  const addContent = (newContent) => {
    setPosts([{ id: Date.now(), ...newContent }, ...posts]);
  };

  return (
    <div className="feed-container">
      <h1>WiCS Feed</h1>
      <div className="feed-items">
        {posts.map((item) => {
          if (item.type === 'post') return <Post key={item.id} content={item.content} />;
          if (item.type === 'poll') return <Poll key={item.id} question={item.question} options={item.options} />;
          return null;
        })}
      </div>
      <Calendar />
    </div>
  );
}

export default Feed;
