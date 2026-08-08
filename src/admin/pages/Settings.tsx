import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Shield, Sliders } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Your changes have been successfully applied.",
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Nav */}
      <div className="w-full md:w-64 space-y-1">
        {[
          { id: 'profile', label: 'Admin Profile', icon: User },
          { id: 'security', label: 'Security & Password', icon: Lock },
          { id: 'roles', label: 'Roles & Permissions', icon: Shield },
          { id: 'system', label: 'System Settings', icon: Sliders },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSave}>
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <Button variant="outline" type="button">Change Avatar</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="System Administrator" className="bg-input border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" defaultValue="admin@phoneefy.com" className="bg-input border-border" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Change Password</h2>
              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="••••••••" className="bg-input border-border" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="••••••••" className="bg-input border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="••••••••" className="bg-input border-border" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">System Configuration</h2>
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border">
                  <div>
                    <Label className="text-base font-semibold">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground mt-1">Disables platform access for all users except admins.</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border">
                  <div>
                    <Label className="text-base font-semibold">Allow New Registrations</Label>
                    <p className="text-sm text-muted-foreground mt-1">Enable or disable new shop registrations.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border">
                  <div>
                    <Label className="text-base font-semibold">System Email Notifications</Label>
                    <p className="text-sm text-muted-foreground mt-1">Send automatic emails to shops upon status changes.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Admin Roles</h2>
              <div className="p-12 text-center text-muted-foreground bg-secondary/20 rounded-xl border border-border">
                Role management requires Super Admin privileges.
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
