import React, { useState } from 'react';
import Post from './Post';
import Poll from './Polls';
import Calendar from './Calendar';

function Feed() {
  const clubs = ['WiCS', 'OSTEM', 'SOLE']; // Sample clubs
  const [selectedClub, setSelectedClub] = useState(clubs[0]);

  const clubPosts = {
    WiCS: [
      {
        id: 3,
        type: 'post',
        content: 'We are so happy to have you join our space.',
        likes: 0,
        comments: [],
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
        likes: 2,
        comments: ['See you there!', 'Can’t wait!'],
      },
    ],
    OSTEM: [
      {
        id: 4,
        type: 'post',
        content: 'OSTEM Game Night this Thursday!',
        likes: 5,
        comments: ['Excited!', 'I’m bringing snacks!'],
      },
    ],
    SOLE: [
      {
        id: 5,
        type: 'poll',
        question: 'Which workshop would you attend?',
        options: ['Tech Interview Prep', 'Resume Review', 'Coffee Chat'],
      },
    ],
  };

  const [posts, setPosts] = useState(clubPosts[selectedClub]);

  // Update posts when club changes
  const handleClubChange = (club) => {
    setSelectedClub(club);
    setPosts(clubPosts[club] || []);
  };

  const addContent = (newContent) => {
    const updatedPosts = [{ id: Date.now(), ...newContent }, ...posts];
    setPosts(updatedPosts);
    clubPosts[selectedClub] = updatedPosts; // For demo only; ideally this would use a backend.
  };

  return (
    <div className="feed-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div>
            <h1>👋 Welcome to your {selectedClub} Hub</h1>
            <p>Stay in the loop with polls, events, and updates from your favorite orgs.</p>
          </div>
          <button className="login-button">Login / Sign Up</button>
        </div>

        {/* Club Selector */}
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

      {/* Feed Items */}
      <div className="feed-items">
        {posts.map((item, index) => {
          if (item.type === 'post') {
            return (
              <Post
                key={item.id}
                content={item.content}
                likes={item.likes}
                comments={item.comments}
                onLike={() => {
                  const updated = [...posts];
                  updated[index].likes += 1;
                  setPosts(updated);
                }}
                onComment={(comment) => {
                  const updated = [...posts];
                  updated[index].comments.push(comment);
                  setPosts(updated);
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

      {/* Calendar */}
      <section className="calendar-section">
        <h2>📅 Upcoming Events</h2>
        <Calendar />
      </section>
    </div>
  );
}

export default Feed;
