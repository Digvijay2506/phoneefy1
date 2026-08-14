import { LayoutDashboard, Package, CreditCard, User } from 'lucide-react';

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'inventory', label: 'Inventory', icon: Package },
  { key: 'subscription', label: 'Subscription', icon: CreditCard },
  { key: 'profile', label: 'Profile', icon: User },
];

export default function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  return (
    <nav
      className="fixed bottom-0 w-full sm:max-w-[430px] z-50 flex justify-around items-center h-16 px-2"
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
            className="nav-tap flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl select-none relative"
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 2}
              color={isActive ? '#1A73E8' : '#6B7280'}
            />
            <span
              className="text-[10px] leading-none"
              style={{
                color: isActive ? '#1A73E8' : '#6B7280',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                className="absolute bottom-0.5 w-5 h-0.5 rounded-full"
                style={{ backgroundColor: '#1A73E8' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
