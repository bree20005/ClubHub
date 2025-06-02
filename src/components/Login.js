import React, { useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user;
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // No profile found — insert blank and go to create page
          await supabase.from('profiles').insert({
            id: user.id,
          });
          navigate('/create-profile');
        } else if (profile) {
          navigate('/join-or-create-club');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/feed`,
      },
    });

    if (error) {
      console.error('Login error:', error.message);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <>
  <div className="login-page">
    <h1
      style={{
        color: 'white',
        fontSize: '48px',
        marginBottom: '8px',
        textShadow: '0 0 6px rgba(155, 89, 182, 0.5)',
      }}
    >
      Welcome to ClubHub
    </h1>
    <h2
      style={{
        color: 'white',
        fontSize: '18px',
        fontWeight: 'normal',
        marginTop: 0,
        marginBottom: '20px',
        textShadow: '0 0 4px rgba(0, 0, 0, 0.5)',
      }}
    >
      Join Your Community
    </h2>
    <button className="google-button" onClick={handleLogin}>
      Continue with Google
    </button>
  </div>
</>

  

  );
 }
 

export default LoginPage;
