import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, type ShopRow } from '@/lib/supabaseClient';
import { setActiveShopId, loadInventory, clearInventory } from '@/store/phoneStore';

interface LoginResult {
  error?: string;
  needsPasswordChange?: boolean;
}

interface ShopkeeperSessionContextType {
  shop: ShopRow | null;
  loading: boolean;
  loginWithId: (loginId: string, password: string) => Promise<LoginResult>;
  completePasswordChange: (newPassword: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshShop: () => Promise<void>;
}

const Ctx = createContext<ShopkeeperSessionContextType | undefined>(undefined);

export function ShopkeeperSessionProvider({ children }: { children: React.ReactNode }) {
  const [shop, setShop] = useState<ShopRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOwnShop = useCallback(async (userId: string): Promise<ShopRow | null> => {
    const { data } = await supabase.from('shops').select('*').eq('user_id', userId).maybeSingle();
    if (data) {
      setShop(data as ShopRow);
      setActiveShopId(data.id);
      await loadInventory();
      return data as ShopRow;
    }
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const s = await loadOwnShop(data.session.user.id);
        if (!mounted) return;
        if (!s) setShop(null); // e.g. an admin session — not a shopkeeper
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [loadOwnShop]);

  const loginWithId = async (loginId: string, password: string): Promise<LoginResult> => {
    const digits = loginId.replace(/\D/g, '');
    const { data: found } = await supabase
      .from('shops')
      .select('login_email, access_enabled, password_needs_reset')
      .or(`phone.eq.${digits},shop_code.eq.${loginId.trim().toUpperCase()}`)
      .maybeSingle();

    if (!found || !found.access_enabled || !found.login_email) {
      return { error: 'Mobile number / Shop ID not found, or your access has been disabled.' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: found.login_email, password });
    if (error) return { error: 'Incorrect password. Please try again.' };

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return { error: 'Could not start session. Please try again.' };

    const s = await loadOwnShop(sessionData.session.user.id);
    if (!s) return { error: 'Shop record not found for this account.' };

    if (found.password_needs_reset) {
      return { needsPasswordChange: true };
    }
    await supabase.from('shops').update({ last_login: new Date().toISOString() }).eq('id', s.id);
    return {};
  };

  const completePasswordChange = async (newPassword: string): Promise<{ error?: string }> => {
    if (newPassword.length < 8) return { error: 'Password must be at least 8 characters.' };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    if (shop) {
      await supabase
        .from('shops')
        .update({ password_needs_reset: false, last_login: new Date().toISOString() })
        .eq('id', shop.id);
      setShop({ ...shop, password_needs_reset: false });
    }
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setShop(null);
    setActiveShopId(null);
    clearInventory();
  };

  const refreshShop = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) await loadOwnShop(data.session.user.id);
  };

  return (
    <Ctx.Provider value={{ shop, loading, loginWithId, completePasswordChange, logout, refreshShop }}>
      {children}
    </Ctx.Provider>
  );
}

export function useShopkeeperSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useShopkeeperSession must be used within ShopkeeperSessionProvider');
  return ctx;
}
