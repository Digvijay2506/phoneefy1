import { getPhonesByShop } from './data';
import type { Phone } from './data';

// The shopkeeper's shop (D.J. Mobiles)
export const MY_SHOP = {
  id: 's2',
  name: 'D.J. Mobiles',
  address: 'Shop No. 45, JM Road, Pune',
  distance: '0.8 km',
  ownerName: 'Deepak Jain',
  phone: '+91 98765 43211',
  rating: 4.9,
  listingCount: 3,
  phoneIds: ['p2', 'p3', 'p11'],
  verified: true,
  memberSince: 'March 2023',
  plan: 'Pro' as const,
  planExpiry: 'Dec 31, 2026',
};

// Analytics data
export interface WeeklyData {
  day: string;
  profileViews: number;
  phoneViews: number;
  whatsappClicks: number;
  callClicks: number;
}

export const weeklyAnalytics: WeeklyData[] = [
  { day: 'Mon', profileViews: 145, phoneViews: 432, whatsappClicks: 67, callClicks: 28 },
  { day: 'Tue', profileViews: 189, phoneViews: 567, whatsappClicks: 89, callClicks: 34 },
  { day: 'Wed', profileViews: 234, phoneViews: 689, whatsappClicks: 102, callClicks: 41 },
  { day: 'Thu', profileViews: 198, phoneViews: 523, whatsappClicks: 78, callClicks: 31 },
  { day: 'Fri', profileViews: 267, phoneViews: 712, whatsappClicks: 112, callClicks: 45 },
  { day: 'Sat', profileViews: 312, phoneViews: 845, whatsappClicks: 134, callClicks: 52 },
  { day: 'Sun', profileViews: 156, phoneViews: 398, whatsappClicks: 56, callClicks: 22 },
];

export const monthlyAnalytics = [
  { month: 'Feb', profileViews: 2100, phoneViews: 6200, whatsappClicks: 420, callClicks: 180 },
  { month: 'Mar', profileViews: 2450, phoneViews: 7100, whatsappClicks: 510, callClicks: 210 },
  { month: 'Apr', profileViews: 3100, phoneViews: 8900, whatsappClicks: 640, callClicks: 260 },
  { month: 'May', profileViews: 2800, phoneViews: 8100, whatsappClicks: 590, callClicks: 240 },
  { month: 'Jun', profileViews: 3600, phoneViews: 10200, whatsappClicks: 720, callClicks: 290 },
  { month: 'Jul', profileViews: 4100, phoneViews: 11800, whatsappClicks: 850, callClicks: 340 },
];

export interface PerformanceMetric {
  label: string;
  value: number;
  trend: number;
  icon: string;
  color: string;
  bgTint: string;
}

export const performanceMetrics: PerformanceMetric[] = [
  {
    label: 'Profile Views',
    value: 1247,
    trend: 12,
    icon: 'Eye',
    color: '#1A73E8',
    bgTint: 'rgba(26,115,232,0.1)',
  },
  {
    label: 'Phone Views',
    value: 3842,
    trend: 8,
    icon: 'Smartphone',
    color: '#F59E0B',
    bgTint: 'rgba(245,158,11,0.1)',
  },
  {
    label: 'WhatsApp Clicks',
    value: 567,
    trend: 23,
    icon: 'MessageCircle',
    color: '#25D366',
    bgTint: 'rgba(37,211,102,0.1)',
  },
  {
    label: 'Call Clicks',
    value: 234,
    trend: 5,
    icon: 'Phone',
    color: '#EF4444',
    bgTint: 'rgba(239,68,68,0.1)',
  },
];

// Per-phone stats (for inventory items)
export interface PhoneStats {
  phoneId: string;
  views: number;
  whatsappClicks: number;
  isSold: boolean;
  addedDate: string;
}

export const phoneStats: PhoneStats[] = [
  { phoneId: 'p2', views: 1243, whatsappClicks: 187, isSold: false, addedDate: '2026-07-08' },
  { phoneId: 'p3', views: 1567, whatsappClicks: 234, isSold: false, addedDate: '2026-07-06' },
  { phoneId: 'p11', views: 1032, whatsappClicks: 146, isSold: false, addedDate: '2026-07-01' },
];

export function getPhoneStats(phoneId: string): PhoneStats | undefined {
  return phoneStats.find(s => s.phoneId === phoneId);
}

export function getMyInventory(): (Phone & { stats: PhoneStats })[] {
  const phones = getPhonesByShop(MY_SHOP.id);
  return phones
    .map(phone => {
      const stats = getPhoneStats(phone.id);
      return { ...phone, stats: stats || { phoneId: phone.id, views: 0, whatsappClicks: 0, isSold: false, addedDate: '' } };
    })
    .sort((a, b) => new Date(b.stats.addedDate).getTime() - new Date(a.stats.addedDate).getTime());
}

// Subscription plans
export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  isCurrent?: boolean;
  recommended?: boolean;
}

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 499,
    period: 'month',
    features: [
      'Up to 10 listings',
      'Basic analytics',
      'Standard support',
      'IMEI verification',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    period: 'month',
    features: [
      'Up to 50 listings',
      'Advanced analytics',
      'Priority support',
      'IMEI verification',
      'Featured listings',
      'WhatsApp integration',
    ],
    isCurrent: true,
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1999,
    period: 'month',
    features: [
      'Unlimited listings',
      'Premium analytics',
      '24/7 dedicated support',
      'IMEI verification',
      'Featured + Promoted',
      'WhatsApp + Call tracking',
      'Custom branding',
    ],
  },
];

// Notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export const notifications: Notification[] = [
  { id: 'n1', title: 'New Lead', message: 'Someone viewed your iPhone 13 listing', time: '2 min ago', read: false, type: 'info' },
  { id: 'n2', title: 'WhatsApp Click', message: 'User clicked WhatsApp for iPhone 12', time: '15 min ago', read: false, type: 'success' },
  { id: 'n3', title: 'Plan Expiring', message: 'Your Pro plan expires in 7 days', time: '1 hour ago', read: true, type: 'warning' },
  { id: 'n4', title: 'Profile View', message: '32 people viewed your shop today', time: '3 hours ago', read: true, type: 'info' },
];
