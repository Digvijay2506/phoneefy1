import { useState, useEffect } from 'react';
import { Bell, Settings, Plus, BarChart2, Tag, History, Eye, MessageCircle, Package, ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import { getInventory } from '../../store/phoneStore';
import { getUnreadCount } from '../../store/notificationsStore';
import { weeklyAnalytics, performanceMetrics } from '../../dashboard-data';

interface DashboardHomeProps {
  onNavigate: (screen: string) => void;
  shopName: string;
  ownerName: string;
}

export default function DashboardHome({ onNavigate, shopName, ownerName }: DashboardHomeProps) {
  const [unreadCount, setUnreadCount] = useState(() => getUnreadCount());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setUnreadCount(getUnreadCount());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const inventory = getInventory();
  const available = inventory.filter((p) => p.status === 'available');
  const sold = inventory.filter((p) => p.status === 'sold');
  const totalViews = inventory.reduce((sum, p) => sum + p.views, 0);
  const totalLeads = inventory.reduce((sum, p) => sum + p.whatsappClicks, 0);

  const today = weeklyAnalytics[weeklyAnalytics.length - 1];

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div
        className="px-4 pt-12 pb-5"
        style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #1A3A5C 100%)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-white/60">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋</p>
            <h1 className="text-lg font-bold text-white mt-0.5">{ownerName}</h1>
            <p className="text-xs text-white/60 mt-0.5">{shopName}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('notifications')}
              className="btn-tap w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative"
            >
              <Bell size={20} color="white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="btn-tap w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <Settings size={20} color="white" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 mt-5">
          {[
            { label: 'Active Listings', value: available.length, color: '#4DA6FF' },
            { label: 'Total Views', value: totalViews.toLocaleString(), color: '#81E6D9' },
            { label: 'WA Leads', value: totalLeads, color: '#F6E05E' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 text-center">
              <p className="text-xl font-bold" style={{ color }}>{value}</p>
              <p className="text-[10px] text-white/60 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {/* Quick Actions */}
        <div className="px-4 mt-4">
          <h2 className="text-sm font-bold text-[#1A1D1F] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { icon: Plus, label: 'Add Phone', screen: 'addPhone', color: '#1A73E8', bg: 'rgba(26,115,232,0.1)' },
              { icon: BarChart2, label: 'Analytics', screen: 'analytics', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
              { icon: Tag, label: 'Offers', screen: 'offers', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
              { icon: History, label: 'Activity', screen: 'activityHistory', color: '#1A7A4A', bg: 'rgba(26,122,74,0.1)' },
            ].map(({ icon: Icon, label, screen, color, bg }) => (
              <button
                key={screen}
                onClick={() => onNavigate(screen)}
                className="btn-tap flex flex-col items-center gap-2 bg-white rounded-2xl p-3 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={20} color={color} />
                </div>
                <span className="text-[10px] font-semibold text-[#6B7280] text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Performance */}
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold text-[#1A1D1F]">Today's Performance</h2>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center gap-1 text-xs font-semibold text-[#1A73E8]"
            >
              Full Report <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Profile Views', value: today.profileViews, icon: Eye, color: '#1A73E8', trend: '+12%' },
              { label: 'Phone Views', value: today.phoneViews, icon: Package, color: '#F59E0B', trend: '+8%' },
              { label: 'WhatsApp', value: today.whatsappClicks, icon: MessageCircle, color: '#25D366', trend: '+23%' },
              { label: 'Call Clicks', value: today.callClicks, icon: TrendingUp, color: '#EF4444', trend: '+5%' },
            ].map(({ label, value, icon: Icon, color, trend }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '14' }}>
                    <Icon size={15} color={color} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#1A7A4A]">{trend}</span>
                </div>
                <p className="text-lg font-bold text-[#1A1D1F]">{value}</p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Snapshot */}
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold text-[#1A1D1F]">Inventory Snapshot</h2>
            <button onClick={() => onNavigate('inventory')} className="flex items-center gap-1 text-xs font-semibold text-[#1A73E8]">
              Manage <ChevronRight size={13} />
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex gap-4">
              {[
                { label: 'Available', value: available.length, color: '#1A7A4A', bg: 'rgba(26,122,74,0.1)' },
                { label: 'Sold (24h)', value: sold.length, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
                { label: 'Total', value: inventory.length, color: '#1A73E8', bg: 'rgba(26,115,232,0.1)' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="flex-1 text-center">
                  <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center" style={{ background: bg }}>
                    <span className="text-sm font-bold" style={{ color }}>{value}</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] mt-1.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Recent listings */}
            {available.slice(0, 2).map((phone) => (
              <div key={phone.id} className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F5F7FA]">
                <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] overflow-hidden flex-shrink-0">
                  <img src={phone.images[0]} alt={phone.model} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1A1D1F] truncate">{phone.brand} {phone.model}</p>
                  <p className="text-xs text-[#6B7280]">₹{phone.price.toLocaleString()} · {phone.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#1A7A4A]">{phone.views}</p>
                  <p className="text-[10px] text-[#9CA3AF]">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Banner */}
        <div className="px-4 mt-4 mb-4">
          <button
            onClick={() => onNavigate('subscription')}
            className="btn-tap w-full rounded-2xl overflow-hidden"
          >
            <div
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ background: 'linear-gradient(135deg, #1A7A4A, #0D4A2A)' }}
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <AlertCircle size={20} color="white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-white">Pro Plan · Expires Dec 31, 2026</p>
                <p className="text-xs text-white/70 mt-0.5">Tap to view plans & payment history</p>
              </div>
              <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
