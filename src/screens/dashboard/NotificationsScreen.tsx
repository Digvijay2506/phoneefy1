import { ArrowLeft, Bell, CheckCheck, Trash2, Zap, ShoppingBag, Tag, CreditCard, Package, Info } from 'lucide-react';
import { useState } from 'react';
import {
  getNotifications,
  markAllRead,
  markRead,
  deleteNotification,
  getUnreadCount,
  formatNotifTime,
} from '../../store/notificationsStore';
import type { NotificationType } from '../../store/notificationsStore';

interface NotificationsScreenProps {
  onBack: () => void;
}

const typeConfig: Record<NotificationType, { icon: React.ComponentType<{ size: number; color: string }>; color: string; bg: string }> = {
  lead: { icon: Zap, color: '#1A73E8', bg: 'rgba(26,115,232,0.1)' },
  sold: { icon: ShoppingBag, color: '#1A7A4A', bg: 'rgba(26,122,74,0.1)' },
  offer: { icon: Tag, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  subscription: { icon: CreditCard, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  inventory: { icon: Package, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  info: { icon: Info, color: '#6B7280', bg: '#F5F7FA' },
};

export default function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const [, forceUpdate] = useState(0);

  const notifications = getNotifications();
  const unread = getUnreadCount();

  const handleMarkAllRead = () => {
    markAllRead();
    forceUpdate((n) => n + 1);
  };

  const handleMarkRead = (id: string) => {
    markRead(id);
    forceUpdate((n) => n + 1);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    forceUpdate((n) => n + 1);
  };

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
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#1A1D1F]">Notifications</h1>
            {unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#1A73E8] text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280]">{notifications.length} total</p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAllRead} className="btn-tap flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-xs font-semibold text-[#1A73E8]">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(26,115,232,0.1)] flex items-center justify-center">
              <Bell size={28} color="#1A73E8" />
            </div>
            <p className="text-sm font-semibold text-[#1A1D1F]">All caught up!</p>
            <p className="text-xs text-[#6B7280]">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F7FA]">
            {notifications.map((notif) => {
              const { icon: Icon, color, bg } = typeConfig[notif.type];
              return (
                <div
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id)}
                  className="flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors"
                  style={{ background: notif.read ? 'transparent' : 'rgba(26,115,232,0.03)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${notif.read ? 'font-medium text-[#6B7280]' : 'font-bold text-[#1A1D1F]'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-[#1A73E8] flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1">{formatNotifTime(notif.timestamp)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                    className="btn-tap w-7 h-7 rounded-full bg-[#F5F7FA] flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <Trash2 size={12} color="#9CA3AF" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
