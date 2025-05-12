import React, { useState } from 'react';

function Post({ content, likes, comments = [], onLike, onComment }) {
  const [commentText, setCommentText] = useState('');

  return (
    <div className="post-card">
      <p>{content}</p>

      <button onClick={onLike}>👍 Like ({likes})</button>

      <div className="comment-section">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (commentText.trim()) {
              onComment(commentText);
              setCommentText('');
            }
          }}
        >
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
          />
          <button type="submit">Post</button>
        </form>

        {comments.map((c, i) => (
          <p key={i} style={{ marginLeft: '1rem', color: '#ccc' }}>💬 {c}</p>
        ))}
      </div>
    </div>
  );
}

export default Post;