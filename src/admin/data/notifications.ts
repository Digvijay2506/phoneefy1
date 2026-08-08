import { Notification } from '../types';

export const mockNotifications: Notification[] = [
  { id: 'N-001', title: 'Platform Maintenance Notice', message: 'The Phoneefy platform will undergo scheduled maintenance on Nov 1st from 2AM to 4AM UTC.', target: 'All Shops', sentDate: '2023-10-25 14:00', status: 'Sent' },
  { id: 'N-002', title: 'New Seller Policy Update', message: 'Please review the updated return policies effective next month.', target: 'All Shops', sentDate: '2023-10-20 09:30', status: 'Sent' },
  { id: 'N-003', title: 'Holiday Sale Guidelines', message: 'Guidelines for participating in the upcoming Black Friday promotional event.', target: 'All Shops', sentDate: '2023-10-15 11:15', status: 'Sent' },
  { id: 'N-004', title: 'Verification Required', message: 'Reminder to upload your updated business license.', target: 'Mobile Masters', sentDate: '2023-10-10 16:45', status: 'Sent' },
  { id: 'N-005', title: 'Welcome to Phoneefy', message: 'Thank you for registering. Please complete your profile.', target: 'New Users', sentDate: '2023-10-05 10:00', status: 'Failed' }
];
