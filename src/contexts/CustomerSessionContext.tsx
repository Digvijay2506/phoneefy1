import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, type CustomerRow } from '@/lib/supabaseClient';

interface AuthResult {
  error?: string;
}

interface CustomerSessionContextType {
  customer: CustomerRow | null;
  loading: boolean;
  signUp: (name: string, phone: string, password: string) => Promise<AuthResult>;
  login: (phone: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const Ctx = createContext<CustomerSessionContextType | undefined>(undefined);
const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export function CustomerSessionProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOwnCustomer = useCallback(async (userId: string): Promise<CustomerRow | null> => {
    const { data } = await supabase.from('customers').select('*').eq('user_id', userId).maybeSingle();
    if (data) {
      setCustomer(data as CustomerRow);
      return data as CustomerRow;
    }
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const c = await loadOwnCustomer(data.session.user.id);
        if (!mounted) return;
        if (!c) setCustomer(null); // e.g. an admin/shopkeeper session — not a customer
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [loadOwnCustomer]);

  const signUp = async (name: string, phone: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/customer-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ name, phone, password }),
      });
      const body = await res.json();
      if (!res.ok) return { error: body.error || 'Could not create your account.' };

      // Now sign in with the account we just created
      return await login(phone, password);
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Network error' };
    }
  };

  const login = async (phone: string, password: string): Promise<AuthResult> => {
    const digits = phone.replace(/\D/g, '');
    const { data: found } = await supabase
      .from('customers')
      .select('login_email')
      .eq('phone', digits)
      .maybeSingle();

    if (!found || !found.login_email) {
      return { error: 'No account found for this mobile number. Please sign up first.' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: found.login_email, password });
    if (error) return { error: 'Incorrect password. Please try again.' };

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return { error: 'Could not start session. Please try again.' };

    const c = await loadOwnCustomer(sessionData.session.user.id);
    if (!c) return { error: 'Account record not found.' };

    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
  };

  return (
    <Ctx.Provider value={{ customer, loading, signUp, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCustomerSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCustomerSession must be used within CustomerSessionProvider');
  return ctx;
}
