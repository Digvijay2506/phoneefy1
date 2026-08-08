import { ArrowLeft, History, PlusCircle, Edit2, Trash2, ShoppingBag, RotateCcw, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getActivities, subscribeActivity, formatActivityTime } from '../../store/activityStore';
import type { ActivityType } from '../../store/activityStore';

interface ActivityHistoryScreenProps {
  onBack: () => void;
}

const typeConfig: Record<ActivityType, { icon: React.ComponentType<{ size: number; color: string }>; label: string; color: string; bg: string }> = {
  added: { icon: PlusCircle, label: 'Added', color: '#1A7A4A', bg: 'rgba(26,122,74,0.1)' },
  edited: { icon: Edit2, label: 'Edited', color: '#1A73E8', bg: 'rgba(26,115,232,0.1)' },
  deleted: { icon: Trash2, label: 'Deleted', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  marked_sold: { icon: ShoppingBag, label: 'Sold', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  restored: { icon: RotateCcw, label: 'Restored', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
};

type FilterKey = 'all' | ActivityType;
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'added', label: 'Added' },
  { key: 'edited', label: 'Edited' },
  { key: 'marked_sold', label: 'Sold' },
  { key: 'restored', label: 'Restored' },
  { key: 'deleted', label: 'Deleted' },
];

export default function ActivityHistoryScreen({ onBack }: ActivityHistoryScreenProps) {
  const [activities, setActivities] = useState(() => getActivities());
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    const unsub = subscribeActivity(() => {
      setActivities(getActivities());
    });
    return unsub;
  }, []);

  const displayed = filter === 'all'
    ? activities
    : activities.filter((a) => a.type === filter);

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 pt-12 pb-3"
        style={{ background: 'rgba(245,247,250,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E7EB' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="btn-tap w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <ArrowLeft size={20} color="#1A1D1F" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1A1D1F]">Activity History</h1>
            <p className="text-xs text-[#6B7280]">{displayed.length} events</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <Filter size={16} color="#6B7280" />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="chip-tap flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter === f.key ? '#1A73E8' : 'white',
                color: filter === f.key ? 'white' : '#6B7280',
                border: '1px solid',
                borderColor: filter === f.key ? '#1A73E8' : '#E5E7EB',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(26,115,232,0.1)] flex items-center justify-center">
              <History size={28} color="#1A73E8" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1A1D1F]">No activity yet</p>
              <p className="text-xs text-[#6B7280] mt-1">Your inventory actions will appear here</p>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-4 space-y-3">
            {displayed.map((activity, idx) => {
              const { icon: Icon, label, color, bg } = typeConfig[activity.type];
              const isFirst = idx === 0;
              const showDateDivider = isFirst || (
                new Date(activity.timestamp).toDateString() !==
                new Date(displayed[idx - 1].timestamp).toDateString()
              );

              return (
                <div key={activity.id}>
                  {showDateDivider && (
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-[#E5E7EB]" />
                      <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                        {new Date(activity.timestamp).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <div className="flex-1 h-px bg-[#E5E7EB]" />
                    </div>
                  )}

                  <div className="bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                      <Icon size={18} color={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[#1A1D1F]">
                            {activity.phoneBrand} {activity.phoneModel}
                          </p>
                          {activity.details && (
                            <p className="text-xs text-[#6B7280] mt-0.5">{activity.details}</p>
                          )}
                        </div>
                        <span
                          className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: bg, color }}
                        >
                          {label}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9CA3AF] mt-1.5">{formatActivityTime(activity.timestamp)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
