import React from 'react';
import { 
  Store, 
  Smartphone, 
  IndianRupee,
  Users, 
  Activity,
  BadgeCheck,
  Clock,
  XCircle,
  Ban,
  ShoppingCart,
  TrendingUp,
  Package,
  CreditCard
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { weeklyActivityData, monthlyRevenueData } from '../data/analytics';
import { mockActivityLogs } from '../data/activityLogs';
import { mockPhones } from '../data/phones';
import { useShops } from '../contexts/ShopContext';

function StatCard({ title, value, icon: Icon, subtitle, color = 'text-primary' }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="p-2 bg-secondary rounded-lg">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { shops } = useShops();

  const totalShops = shops.length;
  const verifiedShops = shops.filter(s => s.status === 'Verified').length;
  const pendingShops = shops.filter(s => s.status === 'Pending' || s.status === 'New').length;
  const rejectedShops = shops.filter(s => s.status === 'Rejected').length;
  const blockedShops = shops.filter(s => s.status === 'Blocked').length;

  const totalPhones = mockPhones.length;
  const availablePhones = mockPhones.filter(p => p.status === 'Available').length;
  const soldPhones = mockPhones.filter(p => p.status === 'Sold').length;

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 flex items-center gap-3">
        <Activity className="w-4 h-4 text-primary shrink-0" />
        <p className="text-sm text-primary">
          <span className="font-semibold">Demo Mode:</span> Showing real data from Phoneefy project — {totalShops} registered shops, {totalPhones} phone listings. All shops on Free Plan. Revenue is ₹0.
        </p>
      </div>

      {/* Stats Grid — Row 1: Shops */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Shop Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Total Shops" value={totalShops} icon={Store} subtitle="Registered shops" />
          <StatCard title="Verified Shops" value={verifiedShops} icon={BadgeCheck} color="text-green-400" subtitle="Admin approved" />
          <StatCard title="Pending Verification" value={pendingShops} icon={Clock} color="text-yellow-400" subtitle="Awaiting review" />
          <StatCard title="Rejected Shops" value={rejectedShops} icon={XCircle} color="text-destructive" subtitle="Not approved" />
          <StatCard title="Blocked Shops" value={blockedShops} icon={Ban} color="text-orange-400" subtitle="Access restricted" />
        </div>
      </div>

      {/* Stats Grid — Row 2: Phones & Revenue */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Listings & Revenue</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Total Phones" value={totalPhones} icon={Smartphone} subtitle="From Phoneefy project" />
          <StatCard title="Available Phones" value={availablePhones} icon={Package} color="text-green-400" subtitle="Active listings" />
          <StatCard title="Sold Phones" value={soldPhones} icon={ShoppingCart} color="text-blue-400" subtitle="Completed sales" />
          <StatCard title="Active Subscriptions" value={totalShops} icon={CreditCard} color="text-purple-400" subtitle="All on Free Plan" />
          <StatCard title="Total Revenue" value="₹0" icon={IndianRupee} color="text-primary" subtitle="Free plan — demo mode" />
        </div>
      </div>

      {/* Stats Grid — Row 3: Platform */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Platform Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value="24" icon={Users} subtitle="Registered customers" />
          <StatCard title="Today's Listings" value="3" icon={TrendingUp} color="text-green-400" subtitle="New today" />
          <StatCard title="Today's Sales" value="1" icon={ShoppingCart} color="text-blue-400" subtitle="Completed today" />
          <StatCard title="Monthly Revenue" value="₹0" icon={IndianRupee} color="text-primary" subtitle="Free plan — demo mode" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold">Monthly Listing Activity</h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded font-mono">Revenue: ₹0 (Free Plan)</span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Line type="monotone" dataKey="value1" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 5 }} name="Listings" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-base font-semibold mb-6">Weekly Listings vs Sales</h3>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="value1" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Listings" />
                  <Bar dataKey="value2" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Activity
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[620px]">
            <div className="divide-y divide-border">
              {mockActivityLogs.slice(0, 15).map((log) => (
                <div key={log.id} className="p-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-foreground">{log.action}</span>
                    <span className="text-xs text-muted-foreground font-mono">{log.timestamp.split(' ')[1]}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Target: <span className="text-foreground">{log.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
