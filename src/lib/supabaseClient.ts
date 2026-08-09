import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to your .env file.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ─── Shared DB row types (mirrors the Supabase schema) ────────────────────────

export type UserRole = 'admin' | 'shopkeeper' | 'customer';

export interface ProfileRow {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ShopRow {
  id: string;
  user_id: string | null;
  shop_code: string;
  login_email: string | null;
  name: string;
  owner: string;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  address: string | null;
  status: 'Verified' | 'Pending' | 'Rejected' | 'Blocked' | 'New';
  shop_status: 'Active' | 'Inactive' | 'Suspended';
  verification_status: 'Pending' | 'Approved' | 'Rejected' | 'Visit Scheduled';
  subscription: 'Free' | 'Basic' | 'Pro' | 'Premium';
  access_enabled: boolean;
  password_needs_reset: boolean;
  avatar_url: string | null;
  total_listings: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerRow {
  id: string;
  user_id: string | null;
  login_email: string | null;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface PhoneRow {
  id: string;
  shop_id: string;
  phone_name: string;
  brand: string;
  model: string;
  year: number | null;
  imei_number: string;
  storage: string | null;
  ram: string | null;
  rom: string | null;
  color: string;
  price: number;
  condition: string;
  battery_health: number | null;
  warranty: string | null;
  bill_available: boolean;
  original_charger: boolean;
  imei_verified: boolean;
  ceir_verified: boolean;
  description: string | null;
  images: string[];
  status: 'available' | 'draft' | 'sold';
  views: number;
  whatsapp_clicks: number;
  created_at: string;
  updated_at: string;
}

// ─── Small shared helpers ──────────────────────────────────────────────────────

/** Upload a data-url / File to the public phone-images bucket, scoped to a shop's folder. */
export async function uploadPhoneImage(shopId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${shopId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('phone-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('phone-images').getPublicUrl(path);
  return data.publicUrl;
}
