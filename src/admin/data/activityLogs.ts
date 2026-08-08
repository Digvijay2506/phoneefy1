import { ActivityLog } from '../types';

export const mockActivityLogs: ActivityLog[] = [
  { id: 'AL-1001', timestamp: '2023-10-26 14:32:10', adminUser: 'admin_sys', action: 'Login', target: 'System', ipAddress: '192.168.1.105', details: 'Successful login' },
  { id: 'AL-1002', timestamp: '2023-10-26 14:35:00', adminUser: 'admin_sys', action: 'Approve Shop', target: 'Gadget Galaxy', ipAddress: '192.168.1.105', details: 'Changed status from Pending to Verified' },
  { id: 'AL-1003', timestamp: '2023-10-26 15:02:14', adminUser: 'mod_alex', action: 'Delete Listing', target: 'P005 (OnePlus 11)', ipAddress: '10.0.0.42', details: 'Listing removed due to TOS violation' },
  { id: 'AL-1004', timestamp: '2023-10-26 15:45:30', adminUser: 'admin_sys', action: 'Send Notification', target: 'All Shops', ipAddress: '192.168.1.105', details: 'Sent "Platform Maintenance Notice"' },
  { id: 'AL-1005', timestamp: '2023-10-26 16:20:05', adminUser: 'mod_sarah', action: 'Resolve Complaint', target: 'C-1003', ipAddress: '172.16.0.8', details: 'Refund issued to customer' },
  { id: 'AL-1006', timestamp: '2023-10-27 09:15:00', adminUser: 'admin_sys', action: 'Login', target: 'System', ipAddress: '192.168.1.105', details: 'Successful login' },
  { id: 'AL-1007', timestamp: '2023-10-27 09:30:22', adminUser: 'admin_sys', action: 'Block Shop', target: 'Cell Central', ipAddress: '192.168.1.105', details: 'Multiple fraud reports' },
  { id: 'AL-1008', timestamp: '2023-10-27 10:05:45', adminUser: 'mod_alex', action: 'Update Settings', target: 'System Settings', ipAddress: '10.0.0.42', details: 'Toggled Maintenance Mode ON' },
  { id: 'AL-1009', timestamp: '2023-10-27 10:15:10', adminUser: 'mod_alex', action: 'Update Settings', target: 'System Settings', ipAddress: '10.0.0.42', details: 'Toggled Maintenance Mode OFF' },
  { id: 'AL-1010', timestamp: '2023-10-27 11:40:33', adminUser: 'admin_sys', action: 'Cancel Subscription', target: 'Smart Device Pro', ipAddress: '192.168.1.105', details: 'Non-payment' },
  { id: 'AL-1011', timestamp: '2023-10-27 13:22:15', adminUser: 'mod_sarah', action: 'Schedule Visit', target: 'The Phone Vault', ipAddress: '172.16.0.8', details: 'Verification visit set for Nov 2' },
  { id: 'AL-1012', timestamp: '2023-10-27 14:05:00', adminUser: 'admin_sys', action: 'Force Password Reset', target: 'Tech Haven', ipAddress: '192.168.1.105', details: 'Suspicious login activity detected' },
  { id: 'AL-1013', timestamp: '2023-10-27 15:30:45', adminUser: 'mod_alex', action: 'Approve Request', target: 'Quick Fix Phones', ipAddress: '10.0.0.42', details: 'Initial registration approved' },
  { id: 'AL-1014', timestamp: '2023-10-28 08:55:10', adminUser: 'admin_sys', action: 'Login', target: 'System', ipAddress: '192.168.1.105', details: 'Successful login' },
  { id: 'AL-1015', timestamp: '2023-10-28 09:20:30', adminUser: 'mod_sarah', action: 'Close Complaint', target: 'C-1005', ipAddress: '172.16.0.8', details: 'Issue resolved with customer' },
  { id: 'AL-1016', timestamp: '2023-10-28 10:10:15', adminUser: 'admin_sys', action: 'Edit Listing', target: 'P012 (iPhone 12 Pro)', ipAddress: '192.168.1.105', details: 'Corrected category mismatch' },
  { id: 'AL-1017', timestamp: '2023-10-28 11:45:00', adminUser: 'mod_alex', action: 'Reject Request', target: 'Fake Shop 123', ipAddress: '10.0.0.42', details: 'Invalid documentation provided' },
  { id: 'AL-1018', timestamp: '2023-10-28 13:15:20', adminUser: 'admin_sys', action: 'Export Data', target: 'Activity Logs', ipAddress: '192.168.1.105', details: 'Exported last 30 days CSV' },
  { id: 'AL-1019', timestamp: '2023-10-28 14:40:55', adminUser: 'mod_sarah', action: 'Add Note', target: 'Mobile Masters', ipAddress: '172.16.0.8', details: 'Excellent compliance record' },
  { id: 'AL-1020', timestamp: '2023-10-28 16:05:10', adminUser: 'admin_sys', action: 'Logout', target: 'System', ipAddress: '192.168.1.105', details: 'Normal logout' }
];
