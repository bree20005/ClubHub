import React, { useState } from 'react';

function Post({
  content,
  tag,
  image = null,
  likes,
  comments = [],
  imageGallery = [],
  onLike,
  onComment,
  onUploadPhoto,
}) {
  const [commentText, setCommentText] = useState('');
  const [showGallery, setShowGallery] = useState(false);

  return (
    <div className="post-card">
      {tag && <div className="post-tag">#{tag}</div>}
      {image && <img src={image} alt="post" className="preview-image" />}

      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{content}</p>

      <button onClick={onLike} className="like-button">
        ❤️ {likes} {likes === 1 ? 'like' : 'likes'}
      </button>

      {/* EVENT EXTRAS */}
      {tag === 'event' && (
        <div style={{ marginTop: '1rem' }}>
          <button className="gallery-button" onClick={() => setShowGallery(true)}>
            📸 View Photos ({imageGallery.length})
          </button>

          <label className="upload-button">
            ➕ Upload Photo
            <input
              type="file"
              hidden
              onChange={(e) => {
                if (e.target.files[0]) onUploadPhoto(e.target.files[0]);
              }}
            />
          </label>
        </div>
      )}

      {/* COMMENTS */}
      <div className="comment-section">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (commentText.trim()) {
              onComment(`@you • ${commentText}`);
              setCommentText('');
            }
          }}
        >
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="comment-input"
          />
          <button type="submit" className="comment-submit">Post</button>
        </form>

        <div className="comment-list">
          {comments.map((c, i) => (
            <p key={i} className="comment">💬 {c}</p>
          ))}
        </div>
      </div>

      {/* GALLERY MODAL */}
      {showGallery && (
        <div className="modal-backdrop" onClick={() => setShowGallery(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📸 Event Gallery</h3>
            {imageGallery.length === 0 ? (
              <p>No photos yet.</p>
            ) : (
              <div className="gallery-grid">
                {imageGallery.map((img, i) => (
                  <img key={i} src={img} alt={`event-${i}`} className="gallery-image" />
                ))}
              </div>
            )}
            <button onClick={() => setShowGallery(false)} className="comment-submit">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;