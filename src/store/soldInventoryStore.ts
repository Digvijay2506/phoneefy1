/**
 * soldInventoryStore.ts — Tracks sold phones with a 24-hour expiry.
 * After 24 hours, a sold phone is automatically purged unless restored.
 */

import type { InventoryPhone } from './phoneStore';

export interface SoldEntry {
  id: string;             // unique entry id
  phone: InventoryPhone;  // snapshot of the phone at time of sale
  soldAt: number;         // epoch ms
  expiresAt: number;      // soldAt + 24h
}

const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

let _sold: SoldEntry[] = [];
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach((fn) => fn());
}

/** Remove entries older than 24 hours. */
function purgeExpired() {
  const now = Date.now();
  const before = _sold.length;
  _sold = _sold.filter((e) => e.expiresAt > now);
  if (_sold.length !== before) notify();
}

export function subscribeSold(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

/** Add a phone to sold inventory. */
export function addToSoldInventory(phone: InventoryPhone): SoldEntry {
  purgeExpired();
  const soldAt = Date.now();
  const entry: SoldEntry = {
    id: `sold-${soldAt}-${phone.id}`,
    phone: { ...phone, status: 'sold' },
    soldAt,
    expiresAt: soldAt + EXPIRY_MS,
  };
  _sold = [entry, ..._sold];
  notify();
  return entry;
}

/** Get all sold entries (auto-purges expired). */
export function getSoldInventory(): SoldEntry[] {
  purgeExpired();
  return [..._sold];
}

/** Remove a specific entry (permanent delete). */
export function deleteSoldEntry(id: string): void {
  _sold = _sold.filter((e) => e.id !== id);
  notify();
}

/** Restore: remove from sold list (caller is responsible for updating phoneStore). */
export function removeFromSoldInventory(id: string): SoldEntry | null {
  const entry = _sold.find((e) => e.id === id) ?? null;
  _sold = _sold.filter((e) => e.id !== id);
  if (entry) notify();
  return entry;
}

/** Remaining time in ms before a sold entry expires. */
export function timeUntilExpiry(entry: SoldEntry): number {
  return Math.max(0, entry.expiresAt - Date.now());
}

/** Format remaining time as HH:MM:SS. */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}
