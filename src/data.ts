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
  image: string;
  listedDaysAgo: number;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  distance: string; // no geo yet — shows the shop's city instead
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
    listedDaysAgo: row.created_at ? daysAgo(row.created_at) : 0,
  };
}

function shopRowToShop(row: ShopRow, phoneIds: string[]): Shop {
  return {
    id: row.id,
    name: row.name,
    address: [row.address, row.city].filter(Boolean).join(', '),
    distance: row.city || '',
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
