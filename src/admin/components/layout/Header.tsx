import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  // Simple breadcrumb logic based on route
  const getPageTitle = () => {
    if (location === '/') return 'Dashboard';
    const path = location.split('/')[1];
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="search" 
            placeholder="Search anything..." 
            className="w-full bg-secondary/50 border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
          />
        </div>

        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-secondary/50 p-1 rounded-full transition-colors focus:outline-none">
              <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLocation('/settings')}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
