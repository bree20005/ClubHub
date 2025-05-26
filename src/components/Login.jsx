import React, { useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          navigate('/join-or-create-club');
        } else {
          navigate('/create-profile');
        }
      }
    };

    checkUser();
  }, []);

  return (
    <div className="login-page">
      <h1>Login / Sign Up</h1>
      <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
        Continue with Google
      </button>
    </div>
  );
}

export default LoginPage;
