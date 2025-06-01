import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const LikeButton = ({ postId, userId }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchLikes = async () => {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId);

      if (data) {
        setLikeCount(data.length);
        const userLike = data.find(like => like.user_id === userId);
        setLiked(!!userLike);
      }
    };

    fetchLikes();
  }, [postId, userId]);

  const handleLike = async () => {
    if (!liked) {
      await supabase.from('likes').insert([{ post_id: postId, user_id: userId }]);
      setLiked(true);
      setLikeCount(prev => prev + 1);
    } else {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      setLiked(false);
      setLikeCount(prev => prev - 1);
    }
  };

  // for Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('likes_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`,
        },
        async () => {
          const { data } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', postId);

          setLikeCount(data.length);

          const userLike = data.find(like => like.user_id === userId);
          setLiked(!!userLike);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, userId]);

  return (
    <button onClick={handleLike} className="flex items-center gap-2">
      {liked ? '💖' : '🤍'}
      <span>{likeCount}</span>
    </button>
  );
};

export default LikeButton;
