/**
 * data.ts — Public marketplace catalog (real phones + shops from Supabase).
 *
 * Screens read `phones` / `shops` synchronously and call `loadCatalog()` once
 * on mount to populate them — same pattern as before, just backed by a real
 * fetch instead of hardcoded arrays.
 */
import { supabase, type PhoneRow, type ShopRow } from './lib/supabaseClient';

export interface Phone {
  id: string;
  name: string;
  brand: string;
  model: string;
  storage: string;
  ram: string;
  color: string;
  condition: string;
  price: number;
  originalPrice: number;
  imeiVerified: boolean;
  batteryHealth?: number;
  accessories: string[];
  shopId: string;
  image: string;      // first image (for cards)
  images: string[];   // all images (for detail gallery)
  description: string;
  listedDaysAgo: number;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  distance: string; // the shop's city (shown when we don't know the customer's location)
  city: string;
  verified: boolean; // approved by the Phoneefy admin
  coverImage: string | null; // storefront photo uploaded by the shopkeeper
  logo: string | null;
  lat: number | null;
  lng: number | null;
  ownerName: string;
  phone: string;
  rating: number; // no review system yet — flat placeholder until built
  listingCount: number;
  phoneIds: string[];
}

export const brands = [
  { name: 'Samsung', letter: 'S', color: '#1428A0' },
  { name: 'Apple', letter: 'A', color: '#1C1C1E' },
  { name: 'Vivo', letter: 'V', color: '#415FFF' },
  { name: 'Oppo', letter: 'O', color: '#1D4ED8' },
  { name: 'Realme', letter: 'R', color: '#F97316' },
  { name: 'Xiaomi', letter: 'X', color: '#FF6900' },
  { name: 'OnePlus', letter: '1', color: '#F5010C' },
  { name: 'Motorola', letter: 'M', color: '#004B87' },
];

export const banners = [
  {
    id: 'b1',
    shopName: 'PHONEEFY',
    headline: 'Verified Pre-owned Phones',
    subheadline: 'Bought from trusted local shops',
    image: '/banners/banner-galaxy.jpg',
  },
];

const FALLBACK_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23E8ECF0"/%3E%3C/svg%3E';

// ─── Live caches (mutated in place so existing `phones`/`shops` references stay valid) ──

export const phones: Phone[] = [];
export const shops: Shop[] = [];

let loaded = false;
let loadingPromise: Promise<void> | null = null;

function daysAgo(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function phoneRowToPhone(row: PhoneRow): Phone {
  const accessories = [
    row.bill_available ? 'Original Bill' : null,
    row.original_charger ? 'Original Charger' : null,
    row.warranty && row.warranty !== 'No warranty' ? row.warranty : null,
  ].filter((a): a is string => Boolean(a));

  return {
    id: row.id,
    name: row.phone_name,
    brand: row.brand,
    model: row.model,
    storage: row.storage || '',
    ram: row.ram || '',
    color: row.color,
    condition: row.condition,
    price: Number(row.price),
    originalPrice: Number(row.price), // no separate MRP tracked yet
    imeiVerified: row.imei_verified,
    batteryHealth: row.battery_health ?? undefined,
    accessories,
    shopId: row.shop_id,
    image: row.images?.[0] || FALLBACK_IMAGE,
    images: row.images?.length ? row.images : [FALLBACK_IMAGE],
    description: row.description || '',
    listedDaysAgo: row.created_at ? daysAgo(row.created_at) : 0,
  };
}

function shopRowToShop(row: ShopRow, phoneIds: string[]): Shop {
  return {
    id: row.id,
    name: row.name,
    address: [row.address, row.city].filter(Boolean).join(', '),
    distance: row.city || '',
    city: row.city || '',
    verified: row.status === 'Verified',
    coverImage: row.cover_image_url || null,
    logo: row.avatar_url || null,
    lat: typeof row.latitude === 'number' ? row.latitude : null,
    lng: typeof row.longitude === 'number' ? row.longitude : null,
    ownerName: row.owner,
    phone: row.phone,
    rating: 4.5, // placeholder until a real review system exists
    listingCount: phoneIds.length,
    phoneIds,
  };
}

/** Fetches available phones + all shops from Supabase into the live caches. Safe to call many times — only fetches once. */
export async function loadCatalog(force = false): Promise<void> {
  if (loadingPromise && !force) return loadingPromise;

  loadingPromise = (async () => {
    const [{ data: phoneRows }, { data: shopRows }] = await Promise.all([
      supabase.from('phones').select('*').eq('status', 'available').order('created_at', { ascending: false }),
      supabase.from('shops').select('*'),
    ]);

    const mappedPhones = ((phoneRows as PhoneRow[]) || []).map(phoneRowToPhone);
    const mappedShops = ((shopRows as ShopRow[]) || []).map((row) =>
      shopRowToShop(
        row,
        mappedPhones.filter((p) => p.shopId === row.id).map((p) => p.id),
      ),
    );

    phones.length = 0;
    phones.push(...mappedPhones);
    shops.length = 0;
    shops.push(...mappedShops);
    loaded = true;
  })();

  return loadingPromise;
}

export function isCatalogLoaded(): boolean {
  return loaded;
}

export function getShopById(id: string): Shop | undefined {
  return shops.find((s) => s.id === id);
}

export function getPhonesByShop(shopId: string): Phone[] {
  return phones.filter((p) => p.shopId === shopId);
}

export function getPhoneById(id: string): Phone | undefined {
  return phones.find((p) => p.id === id);
}

export function searchPhones(query: string, filter: string): { phones: Phone[]; shops: Shop[] } {
  const q = query.toLowerCase().trim();
  let results = [...phones];
  const matchedShops: Shop[] = [];

  if (q) {
    const shopMatch = shops.filter(
      (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q),
    );
    if (shopMatch.length > 0) {
      matchedShops.push(...shopMatch);
    }

    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        getShopById(p.shopId)?.name.toLowerCase().includes(q),
    );
  }

  switch (filter) {
    case 'under10k':
      results = results.filter((p) => p.price < 10000);
      break;
    case '10k20k':
      results = results.filter((p) => p.price >= 10000 && p.price <= 20000);
      break;
    case 'over20k':
      results = results.filter((p) => p.price > 20000);
      break;
    case 'imeiVerified':
      results = results.filter((p) => p.imeiVerified);
      break;
  }

  return { phones: results, shops: matchedShops };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateEMI(price: number, months: number): number {
  return Math.ceil(price / months);
}

// ─── "Near me" helpers ────────────────────────────────────────────────────────

export interface Coords { lat: number; lng: number }
export type ShopWithDistance = Shop & { distanceKm: number | null };

/** Straight-line distance between two points, in km (haversine formula). */
export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

/**
 * Orders shops for the "Shops Near You" lists.
 * - Customer location known: nearest first (shops that haven't set a location go last).
 * - Not known: verified shops first, then the ones with the most phones.
 */
export function sortShopsNearMe(list: Shop[], me: Coords | null): ShopWithDistance[] {
  const withDistance: ShopWithDistance[] = list.map((s) => ({
    ...s,
    distanceKm: me && s.lat !== null && s.lng !== null ? distanceKm(me, { lat: s.lat, lng: s.lng }) : null,
  }));
  return withDistance.sort((a, b) => {
    if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
    if (a.distanceKm !== null) return -1;
    if (b.distanceKm !== null) return 1;
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    if (a.listingCount !== b.listingCount) return b.listingCount - a.listingCount;
    return a.name.localeCompare(b.name);
  });
}
