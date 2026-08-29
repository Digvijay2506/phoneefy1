import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, type ShopRow } from '@/lib/supabaseClient';
import { Shop } from '../types';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

function rowToShop(row: ShopRow): Shop {
  const created = row.created_at ? row.created_at.slice(0, 10) : '';
  return {
    id: row.id,
    shopId: row.shop_code,
    name: row.name,
    owner: row.owner,
    email: row.email || '',
    phone: row.phone,
    whatsapp: row.whatsapp || row.phone,
    city: row.city || '',
    state: row.state || '',
    pinCode: row.pin_code || '',
    address: row.address || '',
    status: row.status,
    shopStatus: row.shop_status,
    verificationStatus: row.verification_status,
    subscription: row.subscription,
    registeredDate: created,
    joinedDate: created,
    lastLogin: row.last_login ? new Date(row.last_login).toLocaleString('en-IN') : 'Never',
    lastPasswordReset: row.updated_at ? new Date(row.updated_at).toLocaleString('en-IN') : '—',
    totalListings: row.total_listings,
    passwordNeedsReset: row.password_needs_reset,
    accessEnabled: row.access_enabled,
    avatarUrl: row.avatar_url || undefined,
  };
}

export interface NewShopInput {
  name: string;
  owner: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  state: string;
  pinCode: string;
  address: string;
}

export interface NewShopCredentials {
  loginEmail: string;
  tempPassword: string;
  shopCode: string;
}

interface ShopContextType {
  shops: Shop[];
  loading: boolean;
  refreshShops: () => Promise<void>;
  createShop: (
    input: NewShopInput,
  ) => Promise<{ shop: Shop; credentials: NewShopCredentials } | { error: string }>;
  updateShop: (id: string, updates: Partial<Shop>) => Promise<void>;
  resetShopPassword: (id: string) => Promise<{ tempPassword: string } | { error: string }>;
  generateResetLink: (id: string) => Promise<{ resetLink: string } | { error: string }>;
  deleteShop: (id: string) => Promise<{ error: string } | void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${data.session?.access_token ?? ''}`,
  };
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshShops = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setShops((data as ShopRow[]).map(rowToShop));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshShops();
  }, [refreshShops]);

  const createShop = async (
    input: NewShopInput,
  ): Promise<{ shop: Shop; credentials: NewShopCredentials } | { error: string }> => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/create-shopkeeper`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) return { error: body.error || 'Could not create shopkeeper account.' };
      await refreshShops();
      return { shop: rowToShop(body.shop as ShopRow), credentials: body.credentials };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Network error' };
    }
  };

  const updateShop = async (id: string, updates: Partial<Shop>) => {
    const patch: Partial<ShopRow> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.owner !== undefined) patch.owner = updates.owner;
    if (updates.email !== undefined) patch.email = updates.email;
    if (updates.phone !== undefined) patch.phone = updates.phone;
    if (updates.whatsapp !== undefined) patch.whatsapp = updates.whatsapp;
    if (updates.city !== undefined) patch.city = updates.city;
    if (updates.state !== undefined) patch.state = updates.state;
    if (updates.pinCode !== undefined) patch.pin_code = updates.pinCode;
    if (updates.address !== undefined) patch.address = updates.address;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.shopStatus !== undefined) patch.shop_status = updates.shopStatus;
    if (updates.verificationStatus !== undefined) patch.verification_status = updates.verificationStatus;
    if (updates.subscription !== undefined) patch.subscription = updates.subscription;
    if (updates.accessEnabled !== undefined) patch.access_enabled = updates.accessEnabled;
    if (updates.passwordNeedsReset !== undefined) patch.password_needs_reset = updates.passwordNeedsReset;

    // Optimistic UI update
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    const { error } = await supabase.from('shops').update(patch).eq('id', id);
    if (error) {
      // Roll back by re-fetching on failure
      await refreshShops();
      throw error;
    }
  };

  const resetShopPassword = async (id: string): Promise<{ tempPassword: string } | { error: string }> => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/reset-shopkeeper-password`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ shopId: id }),
      });
      const body = await res.json();
      if (!res.ok) return { error: body.error || 'Could not reset password.' };
      await refreshShops();
      return { tempPassword: body.tempPassword };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Network error' };
    }
  };

  const generateResetLink = async (id: string): Promise<{ resetLink: string } | { error: string }> => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/generate-reset-link`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ shopId: id }),
      });
      const body = await res.json();
      if (!res.ok) return { error: body.error || 'Could not generate reset link.' };
      await refreshShops();
      return { resetLink: body.resetLink };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Network error' };
    }
  };

  const deleteShop = async (id: string): Promise<{ error: string } | void> => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/delete-shop`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ shopId: id }),
      });
      const body = await res.json();
      if (!res.ok) return { error: body.error || 'Could not delete shop.' };
      await refreshShops();
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Network error' };
    }
  };

  return (
    <ShopContext.Provider
      value={{ shops, loading, refreshShops, createShop, updateShop, resetShopPassword, generateResetLink, deleteShop }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShops() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShops must be used within a ShopProvider');
  return context;
}
