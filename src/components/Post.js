// src/components/Post.js
import React from 'react';

function Post({ content }) {
  return (
    <div className="post-card">
      <p>{content}</p>
    </div>
  );
}

export default Post;
