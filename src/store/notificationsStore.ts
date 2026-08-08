/**
 * notificationsStore.ts — In-memory notification center.
 */

export type NotificationType = 'lead' | 'sold' | 'offer' | 'subscription' | 'inventory' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const SEED: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'lead',
    title: 'New WhatsApp Lead',
    message: 'Someone tapped WhatsApp for your iPhone 13 listing.',
    timestamp: Date.now() - 2 * 60 * 1000,
    read: false,
  },
  {
    id: 'notif-2',
    type: 'lead',
    title: 'New Call Lead',
    message: 'Someone tapped Call for your Galaxy S22 listing.',
    timestamp: Date.now() - 18 * 60 * 1000,
    read: false,
  },
  {
    id: 'notif-3',
    type: 'subscription',
    title: 'Subscription Reminder',
    message: 'Your Pro plan expires in 7 days. Renew to keep your listings active.',
    timestamp: Date.now() - 1 * 60 * 60 * 1000,
    read: true,
  },
  {
    id: 'notif-4',
    type: 'inventory',
    title: 'Inventory Reminder',
    message: 'You have 1 sold phone in Sold Inventory. It will auto-delete in 20 hours.',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    read: true,
  },
  {
    id: 'notif-5',
    type: 'offer',
    title: 'Offer Expiring Soon',
    message: 'Your "Monsoon Discount" offer expires in 2 days.',
    timestamp: Date.now() - 8 * 60 * 60 * 1000,
    read: true,
  },
  {
    id: 'notif-6',
    type: 'info',
    title: 'Profile Milestone',
    message: '1,247 people viewed your shop this month!',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    read: true,
  },
];

let _notifications: AppNotification[] = [...SEED];
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach((fn) => fn());
}

export function subscribeNotifications(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

export function getNotifications(): AppNotification[] {
  return [..._notifications].sort((a, b) => b.timestamp - a.timestamp);
}

export function getUnreadCount(): number {
  return _notifications.filter((n) => !n.read).length;
}

export function markAllRead(): void {
  _notifications = _notifications.map((n) => ({ ...n, read: true }));
  notify();
}

export function markRead(id: string): void {
  _notifications = _notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  notify();
}

export function deleteNotification(id: string): void {
  _notifications = _notifications.filter((n) => n.id !== id);
  notify();
}

export function addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
  const n: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}`,
    timestamp: Date.now(),
    read: false,
  };
  _notifications = [n, ..._notifications];
  notify();
  return n;
}

export function formatNotifTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  if (d === 1) return 'Yesterday';
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
