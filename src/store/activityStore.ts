/**
 * activityStore.ts — Tracks shopkeeper activity history.
 */

export type ActivityType =
  | 'added'
  | 'edited'
  | 'deleted'
  | 'marked_sold'
  | 'restored';

export interface Activity {
  id: string;
  type: ActivityType;
  phoneBrand: string;
  phoneModel: string;
  timestamp: number; // epoch ms
  details?: string;
}

const SEED_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    type: 'added',
    phoneBrand: 'Apple',
    phoneModel: 'iPhone 13',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    details: '45,000 · Good condition',
  },
  {
    id: 'act-2',
    type: 'added',
    phoneBrand: 'Samsung',
    phoneModel: 'Galaxy S22',
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    details: '38,000 · Like New',
  },
  {
    id: 'act-3',
    type: 'edited',
    phoneBrand: 'OnePlus',
    phoneModel: 'OnePlus 11',
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
    details: 'Price updated to 32,000',
  },
  {
    id: 'act-4',
    type: 'marked_sold',
    phoneBrand: 'Xiaomi',
    phoneModel: 'Redmi Note 12 Pro',
    timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
    details: 'Sold for 16,500',
  },
];

let _activities: Activity[] = [...SEED_ACTIVITIES];
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach((fn) => fn());
}

export function subscribeActivity(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

export function getActivities(): Activity[] {
  return [..._activities].sort((a, b) => b.timestamp - a.timestamp);
}

export function logActivity(
  type: ActivityType,
  phoneBrand: string,
  phoneModel: string,
  details?: string
): Activity {
  const act: Activity = {
    id: `act-${Date.now()}`,
    type,
    phoneBrand,
    phoneModel,
    timestamp: Date.now(),
    details,
  };
  _activities = [act, ..._activities];
  // Keep last 100 activities
  if (_activities.length > 100) _activities = _activities.slice(0, 100);
  notify();
  return act;
}

export function formatActivityTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
