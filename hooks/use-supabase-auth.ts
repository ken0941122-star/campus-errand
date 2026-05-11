import { useEffect, useState } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化認證狀態
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 取得當前會話
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        if (session?.user) {
          // 取得用戶 profile
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          setProfile(data as Profile | null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '認證初始化失敗');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(data as Profile | null);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 註冊新用戶
  const signUp = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!newUser) throw new Error('註冊失敗');

      // 建立 profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: newUser.id,
        username,
        rating: 5.0,
        total_tasks_posted: 0,
        total_tasks_completed: 0,
      });

      if (profileError) throw profileError;

      return { user: newUser, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '註冊失敗';
      setError(message);
      return { user: null, error: message };
    }
  };

  // 登入
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data: { user: signedInUser }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      return { user: signedInUser, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '登入失敗';
      setError(message);
      return { user: null, error: message };
    }
  };

  // 登出
  const signOut = async () => {
    try {
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '登出失敗';
      setError(message);
      return { error: message };
    }
  };

  // 更新 profile
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null);
      if (!user) throw new Error('未登入');

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(data as Profile);
      return { profile: data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新失敗';
      setError(message);
      return { profile: null, error: message };
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
}
