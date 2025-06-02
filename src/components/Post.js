import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function Post({ id, content, tag, image, imageGallery = [], createdAt, user, clubId, userId }) {
  const [commentText, setCommentText] = useState('');
  const [commentList, setCommentList] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [likes, setLikes] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [postAuthorName, setPostAuthorName] = useState(user?.full_name || 'Unknown');
  const [postAuthorId, setPostAuthorId] = useState(userId); //new add ons for allowing is admin to delete
  const [isClubCreator, setIsClubCreator] = useState(false); 

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(full_name)')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (!error) setCommentList(data);
    };
    
    const fetchPostAuthor = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('author_name, user_id')
        .eq('id', id)
        .single();

      if (!error && data) {
        setPostAuthorName(data.author_name || 'Unknown');
        setPostAuthorId(data.user_id); //getting author id for deleteing
        console.log('Fetched post author ID from DB:', data.user_id);
      }
    };

    const checkIfClubCreator = async () => {
      if (!user || !clubId) return;
    
      const { data, error } = await supabase
        .from('clubs') 
        .select('creator_id')
        .eq('id', clubId)
        .single();
    
      if (!error && data) {
        const isCreator = data.creator_id === user.id;
        setIsClubCreator(isCreator);
        console.log('Is club creator:', isCreator, 'Club creator ID:', data.creator_id);
      } else {
        console.error('Error fetching club creator:', error);
      }
    };

    fetchPostAuthor();
    fetchComments();
    checkIfClubCreator();
  }, [id, user, clubId]);

  useEffect(() => {
    const fetchLikes = async () => {
      const { data } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', id);

      setLikes(data.length);
      setUserHasLiked(data.some((like) => like.user_id === user?.id));
    };

    if (user) fetchLikes();
  }, [id, user]);

//this is all liking code for ths post
  const handleLike = async () => {
    if (!user) return;

    setUserHasLiked((prev) => !prev);
    setLikes((prev) => prev + (userHasLiked ? -1 : 1));

    if (userHasLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('likes')
        .insert([{ post_id: id, user_id: user.id }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: id,
        user_id: user.id,
        content: commentText,
        parent_id: replyTo,
      }])
      .select('*, profiles(full_name)');

    if (!error && data?.[0]) {
      setCommentList([...commentList, data[0]]);
      setCommentText('');
      setReplyTo(null);
    }
  };
//end of liking code

//start of comments
  const buildThreadedComments = (comments) => {
    const map = {};
    const roots = [];

    comments.forEach((c) => {
      map[c.id] = { ...c, replies: [] };
    });

    comments.forEach((c) => {
      if (c.parent_id) {
        map[c.parent_id]?.replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  };

  const threadedComments = buildThreadedComments(commentList);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Failed to delete comment:', error.message);
    } else {
      // deleting the comment
      setCommentList(commentList.filter(comment => comment.id !== commentId));
      alert('Comment deleted!');
    }
  };

  const renderComments = (comments, depth = 0) => {
    return comments.map((c) => {
      // can user delete comment
      const canDeleteComment = (user?.id && c.user_id && user.id === c.user_id) || isClubCreator;
      
      return (
        <div key={c.id} style={{ marginLeft: depth * 20, marginBottom: '0.5rem' }}>
          <div className="comment">
            <div style={{ fontSize: '1.1rem' }}>
              <strong>{c.profiles?.full_name || 'Unknown'}</strong>
            </div>
            <p>{c.content}</p>

            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              <span>{new Date(c.created_at).toLocaleString()}</span>
              <button
                className="reply-button"
                style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#007bff' }}
                onClick={() => setReplyTo(c.id)}
              >
                ↪️ Reply
              </button>
              
              {/* delete button if user is comment author OR club creator this is where it may all go wrong*/}
              {canDeleteComment && (
                <button
                  className="delete-comment-button"
                  style={{ 
                    marginLeft: '10px', 
                    fontSize: '0.85rem', 
                    color: '#dc3545',
                    border: '1 px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleDeleteComment(c.id)}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
          {c.replies?.length > 0 && renderComments(c.replies, depth + 1)}
        </div>
      );
    });
  };

  const confirmDelete = () => window.confirm("Are you sure you want to delete this post?");

  const handleDeletePost = async () => {
    if (!confirmDelete()) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Cannot delete post:', error.message);
    } else {
      alert('Post deleted!');
    }
    window.location.reload();
  }

  // Check if current user can delete this post (either post author or club creator)
  const canDeletePost = (user?.id && postAuthorId && user.id === postAuthorId) || isClubCreator;
  
  return (
    <div className="post-card">
      <div className="post-meta">
        <strong>{postAuthorName || 'Unknown'}</strong> • {new Date(createdAt).toLocaleString()}
      </div>

      <p style={{ fontSize: '1.1rem' }}>{content}</p>

      {image && (
        <img
          src={image}
          alt="post"
          className="preview-image"
          style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '1rem' }}
        />
      )}
      
      {/* Show delete button if user is post author OR club creator */}
      {canDeletePost && (
        <button onClick={handleDeletePost} className="delete-button">
          🗑️ Delete Post
        </button>
      )}
      
      <div style={{ marginTop: '0.5rem' }}>
        <button className="like-button" onClick={handleLike}>
          {userHasLiked ? '❤️ Liked' : '🤍 Like'} • {likes}
        </button>
      </div>

      <button
        onClick={() => setShowComments((prev) => !prev)}
        style={{
          marginTop: '1rem',
          marginBottom: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#E0D8F6',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.875rem',
          fontWeight: 500,
          backdropFilter: 'blur(6px)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }}
      >
        {showComments ? 'Hide Comments' : `Show Comments (${commentList.length})`}
      </button>

      {showComments && (
        <>
          <form onSubmit={handleSubmit}>
            <input
              className="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyTo ? 'Replying...' : 'Add a comment'}
            />
            <button type="submit" className="comment-submit">Post</button>
            {replyTo && (
              <button
                type="button"
                className="cancel-reply"
                onClick={() => setReplyTo(null)}
              >
                Cancel Reply
              </button>
            )}
          </form>

          <div className="comment-list" style={{ marginTop: '1rem' }}>
            {renderComments(threadedComments)}
          </div>
        </>
      )}
    </div>
  );
}

export default Post;