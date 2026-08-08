import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Store, 
  BadgeCheck, 
  ClipboardList, 
  KeyRound, 
  Package, 
  CreditCard, 
  MessageSquareWarning, 
  Bell, 
  BarChart3, 
  Settings, 
  ScrollText,
  LogOut,
  Shield,
  PhoneOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Shop Management', path: '/shops', icon: Store },
  { name: 'Verification', path: '/verification', icon: BadgeCheck },
  { name: 'Registration Requests', path: '/requests', icon: ClipboardList },
  { name: 'Credentials', path: '/credentials', icon: KeyRound },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
  { name: 'Complaints', path: '/complaints', icon: MessageSquareWarning },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Activity Logs', path: '/activity-logs', icon: ScrollText },
];

const toolItems = [
  { name: 'IMEI Verification', path: '/imei-verification', icon: Shield },
  { name: 'CEIR Verification', path: '/ceir-verification', icon: PhoneOff },
];

const bottomItems = [
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  const linkClass = (path: string) => cn(
    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
    isActive(path)
      ? "bg-sidebar-accent text-primary"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
  );

  const iconClass = (path: string) => cn(
    "w-4 h-4 shrink-0",
    isActive(path) ? "text-primary" : "text-sidebar-foreground/50"
  );

  return (
    <div className="w-60 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold font-mono text-sm">P</span>
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">Phoneefy</span>
            <span className="block text-[10px] text-muted-foreground leading-none">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        {/* Main Navigation */}
        <div className="px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className={linkClass(item.path)}>
                <Icon className={iconClass(item.path)} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Tools Section */}
        <div className="px-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 pb-1.5">
            Device Tools
          </p>
          <div className="space-y-0.5">
            {toolItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className={linkClass(item.path)}>
                  <Icon className={iconClass(item.path)} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div className="px-3 space-y-0.5">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className={linkClass(item.path)}>
                <Icon className={iconClass(item.path)} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}
