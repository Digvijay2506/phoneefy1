/**
 * shopStore.ts — Local in-memory shopkeeper profile store.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShopProfile {
  shopName: string;
  ownerName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  businessHoursOpen: string;
  businessHoursClose: string;
  businessDays: string;
  logoUrl: string;
  verified: boolean;
  plan: string;
  planExpiry: string;
  memberSince: string;
  rating: number;
  totalListings: number;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

let _profile: ShopProfile = {
  shopName: 'D.J. Mobiles',
  ownerName: 'Deepak Jain',
  email: 'shopkeeper@phoneefy.com',
  mobile: '9876543210',
  address: 'Shop No. 45, JM Road',
  city: 'Pune',
  state: 'Maharashtra',
  businessHoursOpen: '10:00',
  businessHoursClose: '21:00',
  businessDays: 'Mon – Sat',
  logoUrl: '',
  verified: true,
  plan: 'Pro',
  planExpiry: 'Dec 31, 2026',
  memberSince: 'March 2023',
  rating: 4.9,
  totalListings: 3,
};

// ─── In-memory store ──────────────────────────────────────────────────────────

let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach((fn) => fn());
}

export function subscribeProfile(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

// ─── Operations ───────────────────────────────────────────────────────────────

export function getProfile(): ShopProfile {
  return { ..._profile };
}

export function updateProfile(data: Partial<ShopProfile>): ShopProfile {
  _profile = { ..._profile, ...data };
  notify();
  return getProfile();
}

export function changePassword(
  currentPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  if (currentPassword !== 'phoneefy123') {
    return { success: false, error: 'Current password is incorrect.' };
  }
  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' };
  }
  return { success: true };
}
