import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  /** Whether an admin account has ever been created on this project. */
  adminExists: boolean | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  /** Only works the very first time — creates the one admin account. */
  bootstrapAdmin: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  const refreshAdminExists = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_exists');
    if (!error) setAdminExists(Boolean(data));
  }, []);

  const checkRole = useCallback(async (sess: Session | null) => {
    if (!sess) {
      setIsAdminUser(false);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sess.user.id)
      .maybeSingle();
    setIsAdminUser(data?.role === 'admin');
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      await checkRole(data.session);
      await refreshAdminExists();
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      checkRole(sess);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [checkRole, refreshAdminExists]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      return { error: 'This account does not have admin access.' };
    }

    setIsAdminUser(true);
    return {};
  };

  const bootstrapAdmin = async (email: string, password: string) => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/bootstrap-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) return { error: body.error || 'Could not create admin account.' };

      // Now sign in with the account we just created
      const result = await login(email, password);
      await refreshAdminExists();
      return result;
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Network error' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdminUser(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: Boolean(session) && isAdminUser,
        loading,
        adminExists,
        session,
        login,
        bootstrapAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
