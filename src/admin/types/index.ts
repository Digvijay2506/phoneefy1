export interface Shop {
  id: string;                // real Supabase shops.id (uuid)
  shopId: string;             // PHN0001 — visible shopkeeper ID, used for login
  name: string;
  owner: string;
  email: string;              // optional — for contact only
  phone: string;               // mobile number — shopkeeper login credential
  whatsapp: string;
  city: string;
  state: string;
  pinCode: string;
  address: string;
  status: 'Verified' | 'Pending' | 'Rejected' | 'Blocked' | 'New';
  shopStatus: 'Active' | 'Inactive' | 'Suspended';
  verificationStatus: 'Pending' | 'Approved' | 'Rejected' | 'Visit Scheduled';
  subscription: 'Free' | 'Basic' | 'Pro' | 'Premium';
  registeredDate: string;
  joinedDate: string;
  lastLogin: string;
  lastPasswordReset: string;
  totalListings: number;
  passwordNeedsReset: boolean; // true = shopkeeper must change on next login
  accessEnabled: boolean;
  avatarUrl?: string;
}

export interface PhoneListing {
  id: string;
  model: string;
  brand: string;
  shopId: string;
  shopName: string;
  price: number;
  status: 'Available' | 'Sold' | 'Deleted';
  listedDate: string;
}

export interface Subscription {
  id: string;
  shopId: string;
  shopName: string;
  plan: 'Free' | 'Basic' | 'Pro' | 'Premium';
  status: 'Active' | 'Inactive' | 'Cancelled';
  startDate: string;
  endDate: string;
  amount: number;
}

export interface Complaint {
  id: string;
  complainant: string;
  against: string;
  subject: string;
  date: string;
  status: 'Open' | 'In Review' | 'Resolved' | 'Rejected' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  type: 'Customer' | 'Shop';
  details: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  target: 'All Shops' | 'All Customers' | string;
  sentDate: string;
  status: 'Sent' | 'Failed';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  target: string;
  ipAddress: string;
  details: string;
}

export interface ChartData {
  name: string;
  value1?: number;
  value2?: number;
}
