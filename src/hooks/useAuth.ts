import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 現在のセッションを確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        updateDisplayName(session.user);
        loadAdminStatus(session.user.id);
      } else {
        setUser(null);
        setDisplayName('');
        setIsAdmin(false);
        setLoading(false);
      }
    });

    // セッション変更をリッスン
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        updateDisplayName(session.user);
        loadAdminStatus(session.user.id);
      } else {
        setUser(null);
        setDisplayName('');
        setIsAdmin(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  function updateDisplayName(user: User) {
    // user_metadataからfull_nameを取得
    const fullName = (user.user_metadata?.full_name as string) || '';
    setDisplayName(fullName || user.email || '');
  }

  async function loadAdminStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setIsAdmin(data.is_admin);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Failed to load admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (!error && data.user) {
      updateDisplayName(data.user);
      // profilesテーブルに自動的にエントリを作成
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        is_admin: false,
      });
    }
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.user) {
      updateDisplayName(data.user);
      await loadAdminStatus(data.user.id);
    }
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    displayName,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
