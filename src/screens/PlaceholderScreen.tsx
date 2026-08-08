import { Tag, Store, User } from 'lucide-react';
import BottomNav from '../components/BottomNav';

interface PlaceholderScreenProps {
  tabKey: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const config: Record<string, { icon: React.ComponentType<{ size: number; color: string }>; label: string; description: string }> = {
  deals: { icon: Tag, label: 'Deals', description: 'Exclusive deals and offers coming soon!' },
  shops: { icon: Store, label: 'Shops', description: 'Browse all shops near you coming soon!' },
  profile: { icon: User, label: 'Profile', description: 'Your buyer profile coming soon!' },
};

export default function PlaceholderScreen({ tabKey, activeTab, onTabChange }: PlaceholderScreenProps) {
  const { icon: Icon, label, description } = config[tabKey] ?? config.deals;

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: 'rgba(26,115,232,0.1)',
          }}
        >
          <Icon size={36} color="#1A73E8" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#1A1D1F]">{label}</h2>
          <p className="text-sm text-[#6B7280] mt-2">{description}</p>
        </div>
        <div
          className="px-5 py-2.5 rounded-full"
          style={{ background: 'rgba(26,115,232,0.08)' }}
        >
          <span className="text-sm font-semibold text-[#1A73E8]">Coming Soon</span>
        </div>
      </div>
      <div className="h-16" />
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
