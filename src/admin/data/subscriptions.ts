import { Subscription } from '../types';

// All shops are on Free Plan (demo mode) — Revenue: ₹0
export const mockSubscriptions: Subscription[] = [
  { id: 'SUB-001', shopId: 'S001', shopName: 'Galaxy Phone Store', plan: 'Free', status: 'Active', startDate: '2026-01-15', endDate: '2027-01-15', amount: 0 },
  { id: 'SUB-002', shopId: 'S002', shopName: 'D.J. Mobiles', plan: 'Free', status: 'Active', startDate: '2026-02-10', endDate: '2027-02-10', amount: 0 },
  { id: 'SUB-003', shopId: 'S003', shopName: 'Vivo World', plan: 'Free', status: 'Active', startDate: '2026-01-20', endDate: '2027-01-20', amount: 0 },
  { id: 'SUB-004', shopId: 'S004', shopName: 'Oppo Point', plan: 'Free', status: 'Active', startDate: '2026-07-01', endDate: '2027-07-01', amount: 0 },
  { id: 'SUB-005', shopId: 'S005', shopName: 'Realme Hub', plan: 'Free', status: 'Active', startDate: '2026-03-05', endDate: '2027-03-05', amount: 0 },
  { id: 'SUB-006', shopId: 'S006', shopName: 'Mi Store Pune', plan: 'Free', status: 'Active', startDate: '2026-02-28', endDate: '2027-02-28', amount: 0 },
  { id: 'SUB-007', shopId: 'S007', shopName: 'OnePlus Zone', plan: 'Free', status: 'Active', startDate: '2026-07-28', endDate: '2027-07-28', amount: 0 },
  { id: 'SUB-008', shopId: 'S008', shopName: 'Moto Corner', plan: 'Free', status: 'Active', startDate: '2026-07-25', endDate: '2027-07-25', amount: 0 },
];
