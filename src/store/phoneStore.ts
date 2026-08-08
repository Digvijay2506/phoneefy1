/**
 * phoneStore.ts — Shopkeeper's own inventory, backed by the real `phones`
 * table in Supabase. Keeps the same subscribe/cache API the UI already used,
 * so screens read synchronously from a local cache that's refreshed after
 * every mutation or login.
 */
import { supabase, uploadPhoneImage, type PhoneRow } from '@/lib/supabaseClient';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Condition = 'Like New' | 'Good' | 'Fair' | 'Poor';
export type ListingStatus = 'available' | 'draft' | 'sold';

export interface InventoryPhone {
  id: string;
  phoneName: string;
  brand: string;
  model: string;
  year: number | null;
  variant: string; // derived display string, e.g. "128 GB / 6 GB RAM"
  ram: string;
  storage: string;
  rom: string;
  colour: string;
  batteryHealth: number;
  condition: Condition;
  price: number;
  imeiNumber: string;
  imeiVerified: boolean;
  ceirVerified: boolean;
  billAvailable: boolean;
  originalCharger: boolean;
  warranty: string;
  description: string;
  images: string[];
  status: ListingStatus;
  addedDate: string;
  views: number;
  whatsappClicks: number;
}

/** Data captured by the Add/Edit Phone form. Images are already-uploaded URLs
 * or raw Files that still need uploading — addPhone/updatePhone handle both. */
export interface PhoneFormInput {
  phoneName: string;
  brand: string;
  model: string;
  year: number | null;
  ram: string;
  storage: string;
  rom: string;
  colour: string;
  batteryHealth: number;
  condition: Condition;
  price: number;
  imeiNumber: string;
  imeiVerified: boolean;
  ceirVerified: boolean;
  billAvailable: boolean;
  originalCharger: boolean;
  warranty: string;
  description: string;
  status: ListingStatus;
  /** Existing image URLs to keep (edit mode) */
  existingImages: string[];
  /** New local files to upload */
  newImageFiles: File[];
}

// ─── Row <-> view-model mapping ────────────────────────────────────────────────

function rowToPhone(row: PhoneRow): InventoryPhone {
  return {
    id: row.id,
    phoneName: row.phone_name,
    brand: row.brand,
    model: row.model,
    year: row.year,
    variant: [row.storage, row.ram ? `${row.ram} RAM` : ''].filter(Boolean).join(' / '),
    ram: row.ram || '',
    storage: row.storage || '',
    rom: row.rom || '',
    colour: row.color,
    batteryHealth: row.battery_health ?? 0,
    condition: (row.condition as Condition) || 'Good',
    price: Number(row.price),
    imeiNumber: row.imei_number,
    imeiVerified: row.imei_verified,
    ceirVerified: row.ceir_verified,
    billAvailable: row.bill_available,
    originalCharger: row.original_charger,
    warranty: row.warranty || '',
    description: row.description || '',
    images: row.images || [],
    status: row.status,
    addedDate: row.created_at ? row.created_at.slice(0, 10) : '',
    views: row.views,
    whatsappClicks: row.whatsapp_clicks,
  };
}

// ─── Local cache + subscriptions ───────────────────────────────────────────────

let _shopId: string | null = null;
let _inventory: InventoryPhone[] = [];
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach((fn) => fn());
}

export function subscribeInventory(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

/** Call after login/logout to point the store at the right shop. */
export function setActiveShopId(shopId: string | null) {
  _shopId = shopId;
}

export function clearInventory() {
  _inventory = [];
  notify();
}

/** Fetch this shop's phones from Supabase into the local cache. */
export async function loadInventory(): Promise<void> {
  if (!_shopId) {
    _inventory = [];
    notify();
    return;
  }
  const { data, error } = await supabase
    .from('phones')
    .select('*')
    .eq('shop_id', _shopId)
    .order('created_at', { ascending: false });

  if (!error && data) {
    _inventory = (data as PhoneRow[]).map(rowToPhone);
    notify();
  }
}

// ─── Sync reads (from cache) ────────────────────────────────────────────────────

export function getInventory(): InventoryPhone[] {
  return [..._inventory];
}

export function getPhoneById(id: string): InventoryPhone | undefined {
  return _inventory.find((p) => p.id === id);
}

// ─── Mutations (write to Supabase, then refresh cache) ─────────────────────────

async function uploadNewImages(shopId: string, files: File[]): Promise<string[]> {
  const uploads = files.map((f) => uploadPhoneImage(shopId, f));
  return Promise.all(uploads);
}

export async function addPhone(data: PhoneFormInput): Promise<InventoryPhone> {
  if (!_shopId) throw new Error('No active shop — please log in again.');

  const uploadedUrls = await uploadNewImages(_shopId, data.newImageFiles);
  const images = [...data.existingImages, ...uploadedUrls];

  const { data: inserted, error } = await supabase
    .from('phones')
    .insert({
      shop_id: _shopId,
      phone_name: data.phoneName,
      brand: data.brand,
      model: data.model,
      year: data.year,
      imei_number: data.imeiNumber,
      storage: data.storage,
      ram: data.ram,
      rom: data.rom,
      color: data.colour,
      price: data.price,
      condition: data.condition,
      battery_health: data.batteryHealth,
      warranty: data.warranty,
      bill_available: data.billAvailable,
      original_charger: data.originalCharger,
      imei_verified: data.imeiVerified,
      ceir_verified: data.ceirVerified,
      description: data.description,
      images,
      status: data.status,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A phone with this IMEI number has already been listed.');
    }
    throw error;
  }

  await loadInventory();
  return rowToPhone(inserted as PhoneRow);
}

export async function updatePhone(id: string, data: PhoneFormInput): Promise<InventoryPhone | null> {
  if (!_shopId) throw new Error('No active shop — please log in again.');

  const uploadedUrls = await uploadNewImages(_shopId, data.newImageFiles);
  const images = [...data.existingImages, ...uploadedUrls];

  const { error } = await supabase
    .from('phones')
    .update({
      phone_name: data.phoneName,
      brand: data.brand,
      model: data.model,
      year: data.year,
      imei_number: data.imeiNumber,
      storage: data.storage,
      ram: data.ram,
      rom: data.rom,
      color: data.colour,
      price: data.price,
      condition: data.condition,
      battery_health: data.batteryHealth,
      warranty: data.warranty,
      bill_available: data.billAvailable,
      original_charger: data.originalCharger,
      imei_verified: data.imeiVerified,
      ceir_verified: data.ceirVerified,
      description: data.description,
      images,
      status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      throw new Error('A phone with this IMEI number has already been listed.');
    }
    throw error;
  }

  await loadInventory();
  return getPhoneById(id) ?? null;
}

export async function deletePhone(id: string): Promise<void> {
  const { error } = await supabase.from('phones').delete().eq('id', id);
  if (error) throw error;
  await loadInventory();
}

export async function markAsSold(id: string): Promise<InventoryPhone | null> {
  const { error } = await supabase.from('phones').update({ status: 'sold' }).eq('id', id);
  if (error) throw error;
  await loadInventory();
  return getPhoneById(id) ?? null;
}

export async function restorePhone(id: string): Promise<InventoryPhone | null> {
  const { error } = await supabase.from('phones').update({ status: 'available' }).eq('id', id);
  if (error) throw error;
  await loadInventory();
  return getPhoneById(id) ?? null;
}
