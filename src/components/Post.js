import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function Post({ id, content, tag, image, imageGallery = [], authorName, createdAt, user, clubId }) {
  const [commentText, setCommentText] = useState('');
  const [commentList, setCommentList] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [likes, setLikes] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); //for admin

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(full_name)')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (!error) {
        setCommentList(data);
      } else {
        console.error('Error fetching comments:', error.message);
      }
    };

//checking if admin so we can delete the post if needed

    const checkIfAdmin = async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('created_by')
        .eq('id', clubId)
        .single();

      if (!error && data) {
        setIsAdmin(data.created_by === user?.id);
      }
    };

    if (user && clubId) {
      checkIfAdmin();
    }

    fetchComments();
  }, [user, clubId, id]);

  // Fetch likes
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

  // Real-time subscription to likes
  useEffect(() => {
    const channel = supabase
      .channel('realtime-likes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${id}`,
        },
        async () => {
          const { data } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', id);

          setLikes(data.length);
          setUserHasLiked(data.some((like) => like.user_id === user?.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return;
  
    // update visually 
    setUserHasLiked(prev => !prev);
    setLikes(prev => prev + (userHasLiked ? -1 : 1));
  
    // Then update the DB
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
    } else {
      console.error('Failed to submit comment:', error?.message);
    }
  };

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

  const renderComments = (comments, depth = 0) => {
    return comments.map((c) => (
      <div key={c.id} style={{ marginLeft: depth * 20, marginBottom: '0.5rem' }}>
        <p className="comment">
          <strong>{c.profiles?.full_name || 'Unknown User'}</strong> at{' '}
          {new Date(c.created_at).toLocaleString()}: {c.content}
        </p>
        <button className="reply-button" onClick={() => setReplyTo(c.id)}>
          ↪️ Reply
        </button>
        {c.replies?.length > 0 && renderComments(c.replies, depth + 1)}
      </div>
    ));
  };

  const confirmDelete = () => {
    return window.confirm("Are you sure you want to delete this post?");
  };

  const handleDeletePost = async () => {
    if (!confirmDelete()) return;
  
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.error('Failed to delete post:', error.message);
    } else {
      alert('Post deleted!');
    }
  };
  

  return (
    <div className="post-card">
      <div className="post-meta">
        <strong>{authorName}</strong> • {new Date(createdAt).toLocaleString()}
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

      {isAdmin && (
        <button onClick={handleDeletePost} className="delete-button">
          🗑️
        </button>
      )}


      <div style={{ marginTop: '0.5rem' }}>
        <button className="like-button" onClick={handleLike}>
          {userHasLiked ? '❤️ Liked' : '🤍 Like'} • {likes}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
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
    </div>
  );
}

export default Post;
