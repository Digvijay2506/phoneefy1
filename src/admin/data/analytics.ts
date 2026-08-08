import { ChartData } from '../types';

export const weeklyActivityData: ChartData[] = [
  { name: 'Mon', value1: 3, value2: 0 },
  { name: 'Tue', value1: 5, value2: 1 },
  { name: 'Wed', value1: 4, value2: 0 },
  { name: 'Thu', value1: 2, value2: 1 },
  { name: 'Fri', value1: 6, value2: 1 },
  { name: 'Sat', value1: 8, value2: 2 },
  { name: 'Sun', value1: 5, value2: 0 }
]; // value1: Listings, value2: Sales

export const monthlyRevenueData: ChartData[] = [
  { name: 'Jan', value1: 4 },
  { name: 'Feb', value1: 7 },
  { name: 'Mar', value1: 6 },
  { name: 'Apr', value1: 9 },
  { name: 'May', value1: 8 },
  { name: 'Jun', value1: 11 },
  { name: 'Jul', value1: 12 },
  { name: 'Aug', value1: 3 },
  { name: 'Sep', value1: 0 },
  { name: 'Oct', value1: 0 },
  { name: 'Nov', value1: 0 },
  { name: 'Dec', value1: 0 }
]; // Monthly phone listings count

export const platformTrafficData: ChartData[] = [
  { name: '00:00', value1: 12 },
  { name: '04:00', value1: 8 },
  { name: '08:00', value1: 35 },
  { name: '12:00', value1: 58 },
  { name: '16:00', value1: 62 },
  { name: '20:00', value1: 45 }
];
