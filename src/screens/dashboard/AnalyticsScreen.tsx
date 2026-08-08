import { ArrowLeft, TrendingUp, TrendingDown, Eye, Phone, MessageCircle, Smartphone, Calendar } from 'lucide-react';
import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { weeklyAnalytics, monthlyAnalytics, performanceMetrics } from '../../dashboard-data';

interface AnalyticsScreenProps {
  onBack: () => void;
}

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Eye, Phone, MessageCircle, Smartphone,
};

type Period = 'weekly' | 'monthly';

export default function AnalyticsScreen({ onBack }: AnalyticsScreenProps) {
  const [period, setPeriod] = useState<Period>('weekly');
  const data = period === 'weekly' ? weeklyAnalytics : monthlyAnalytics;
  const xKey = period === 'weekly' ? 'day' : 'month';

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-12 pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(245,247,250,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E7EB' }}
      >
        <button onClick={onBack} className="btn-tap w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <ArrowLeft size={20} color="#1A1D1F" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#1A1D1F]">Analytics</h1>
          <p className="text-xs text-[#6B7280]">Your shop performance overview</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {/* Period Selector */}
        <div className="px-4 pt-4">
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-[#E5E7EB]">
            {(['weekly', 'monthly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: period === p ? '#1A73E8' : 'transparent',
                  color: period === p ? 'white' : '#6B7280',
                }}
              >
                {p === 'weekly' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          {performanceMetrics.map((metric) => {
            const Icon = iconMap[metric.icon] ?? Eye;
            return (
              <div key={metric.label} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: metric.bgTint }}
                  >
                    <Icon size={18} color={metric.color} />
                  </div>
                  <div className="flex items-center gap-1">
                    {metric.trend >= 0
                      ? <TrendingUp size={12} color="#1A7A4A" />
                      : <TrendingDown size={12} color="#EF4444" />}
                    <span className="text-[11px] font-semibold" style={{ color: metric.trend >= 0 ? '#1A7A4A' : '#EF4444' }}>
                      {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                    </span>
                  </div>
                </div>
                <p className="text-xl font-bold text-[#1A1D1F]">{metric.value.toLocaleString()}</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">{metric.label}</p>
              </div>
            );
          })}
        </div>

        {/* Area Chart — Profile + Phone Views */}
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1A1D1F]">Views Overview</h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Profile & phone listing views</p>
              </div>
              <Calendar size={16} color="#9CA3AF" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfileViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1A73E8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPhoneViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F7FA" />
                <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="profileViews" stroke="#1A73E8" strokeWidth={2} fill="url(#colorProfileViews)" name="Profile Views" />
                <Area type="monotone" dataKey="phoneViews" stroke="#F59E0B" strokeWidth={2} fill="url(#colorPhoneViews)" name="Phone Views" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart — Engagement */}
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-[#1A1D1F]">Engagement Actions</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">WhatsApp & Call button clicks</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F7FA" />
                <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="whatsappClicks" fill="#25D366" name="WhatsApp" radius={[4, 4, 0, 0]} />
                <Bar dataKey="callClicks" fill="#1A73E8" name="Call" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Row */}
        <div className="px-4 pt-4 pb-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-3">
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-[#25D366]">
                {data.reduce((sum, d) => sum + d.whatsappClicks, 0)}
              </p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">WhatsApp Leads</p>
            </div>
            <div className="w-px bg-[#E5E7EB]" />
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-[#1A73E8]">
                {data.reduce((sum, d) => sum + d.callClicks, 0)}
              </p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">Call Leads</p>
            </div>
            <div className="w-px bg-[#E5E7EB]" />
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-[#1A1D1F]">
                {data.reduce((sum, d) => sum + d.profileViews, 0)}
              </p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">Profile Views</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
