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
const AUTH_TIMEOUT_MS = 5000;

/**
 * Prevent a slow/unreachable Supabase request from leaving the whole admin app
 * on an endless "Please wait" screen. The underlying request may continue in
 * the background, but the UI is always released after the timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms = AUTH_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('Request timed out')), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  const refreshAdminExists = useCallback(async () => {
    try {
      const { data, error } = await withTimeout(supabase.rpc('admin_exists'));
      if (!error) {
        setAdminExists(Boolean(data));
      } else {
        // If the RPC is unavailable, don't block the login screen.
        setAdminExists(true);
      }
    } catch {
      // A network/RPC timeout must never keep the app loading forever.
      // Existing deployments have an admin; normal login remains available.
      setAdminExists(true);
    }
  }, []);

  const checkRole = useCallback(async (sess: Session | null) => {
    if (!sess) {
      setIsAdminUser(false);
      return false;
    }

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('role')
          .eq('id', sess.user.id)
          .maybeSingle(),
      );
      const admin = !error && data?.role === 'admin';
      setIsAdminUser(admin);
      return admin;
    } catch {
      setIsAdminUser(false);
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialise = async () => {
      let currentSession: Session | null = null;

      try {
        const { data } = await withTimeout(supabase.auth.getSession());
        currentSession = data.session;
      } catch {
        // Treat an unavailable auth request as signed out so mobile/fresh
        // browsers can still reach the login form.
        currentSession = null;
      }

      if (!mounted) return;
      setSession(currentSession);

      // These checks are independent; don't let one slow request block the other.
      await Promise.allSettled([
        checkRole(currentSession),
        refreshAdminExists(),
      ]);

      if (mounted) setLoading(false);
    };

    void initialise();

    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      if (!mounted) return;
      setSession(sess);

      // Do not await Supabase work inside onAuthStateChange. Supabase can
      // deadlock when another Supabase call is awaited from this callback.
      window.setTimeout(() => {
        if (mounted) void checkRole(sess);
      }, 0);

      // A real auth event means the initial auth bootstrap is complete.
      if (event !== 'INITIAL_SESSION') setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [checkRole, refreshAdminExists]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
      );
      if (error) return { error: error.message };

      const { data: profile, error: profileError } = await withTimeout(
        supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle(),
      );

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        setSession(null);
        setIsAdminUser(false);
        return { error: 'This account does not have admin access.' };
      }

      setSession(data.session);
      setIsAdminUser(true);
      setLoading(false);
      return {};
    } catch (e) {
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
