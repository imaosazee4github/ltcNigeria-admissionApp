import { createContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  async function fetchProfile(userId) {
    setProfileLoading(true);
    setProfileError('');

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        account_status,
        roles (
          code,
          name
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile loading error:', error);
      setProfile(null);
      setProfileError(error.message);
      setProfileLoading(false);

      return {
        data: null,
        error,
      };
    }

    setProfile(data);
    setProfileLoading(false);

    return {
      data,
      error: null,
    };
  }

  useEffect(() => {
    async function initializeAuth() {
      setLoading(true);

      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Session error:', error);
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      }

      setLoading(false);
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (!currentSession?.user) {
          setProfile(null);
          setProfileError('');
          setProfileLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signUp({
    fullName,
    email,
    phone,
    password,
  }) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });
  }

  async function signIn({ email, password }) {
    const result =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (result.error) {
      return result;
    }

    const authenticatedUser = result.data.user;

    setSession(result.data.session);
    setUser(authenticatedUser);

    if (authenticatedUser) {
      await fetchProfile(authenticatedUser.id);
    }

    return result;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileError('');
    }

    return { error };
  }

  const role = profile?.roles?.code ?? null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        loading,
        profileLoading,
        profileError,
        signUp,
        signIn,
        signOut,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}