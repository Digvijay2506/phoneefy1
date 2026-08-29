import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  adminExists: boolean | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
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
    try {
      const { data } = await supabase.rpc('admin_exists');
      setAdminExists(Boolean(data));
    } catch {
      setAdminExists(true);
    }
  }, []);

  const checkRole = useCallback(async (sess: Session | null): Promise<boolean> => {
    if (!sess) { setIsAdminUser(false); return false; }
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sess.user.id)
        .maybeSingle();
      const admin = data?.role === 'admin';
      setIsAdminUser(admin);
      return admin;
    } catch {
      setIsAdminUser(false);
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session);
        await Promise.allSettled([checkRole(data.session), refreshAdminExists()]);
      } catch {
        // ignore — fallthrough to setLoading(false)
      }
      if (mounted) setLoading(false);
    };

    void init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return;
      setSession(sess);
      // Always release loading when auth state changes — this is the key fix
      setLoading(false);
      void checkRole(sess);
    });

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [checkRole, refreshAdminExists]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        setIsAdminUser(false);
        setLoading(false);
        return { error: 'This account does not have admin access.' };
      }

      setSession(data.session);
      setIsAdminUser(true);
      setLoading(false);
      return {};
    } catch (e) {
      setLoading(false);
      return { error: e instanceof Error ? e.message : 'Network error. Please try again.' };
    }
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
      const result = await login(email, password);
      await refreshAdminExists();
      return result;
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Network error' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdminUser(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: Boolean(session) && isAdminUser, loading, adminExists, session, login, bootstrapAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
