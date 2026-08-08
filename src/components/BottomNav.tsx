import { Home, Search, Store, Tag, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'search', label: 'Search', icon: Search },
  { key: 'shops', label: 'Shops', icon: Store },
  { key: 'deals', label: 'Deals', icon: Tag },
  { key: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 w-full max-w-[390px] z-50 flex justify-around items-center h-16 px-2"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        borderTop: '1px solid #E5E7EB',
      }}
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.key;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className="nav-tap flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl select-none"
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 2}
              color={isActive ? '#1A73E8' : '#6B7280'}
            />
            <span
              className="text-[11px] font-medium leading-none"
              style={{
                color: isActive ? '#1A73E8' : '#6B7280',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                className="absolute bottom-1 w-6 h-0.5 rounded-full"
                style={{ backgroundColor: '#1A73E8' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
