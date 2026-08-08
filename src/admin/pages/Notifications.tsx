import React, { useState } from 'react';
import { mockNotifications } from '../data/notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, Users, Store, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useShops } from '../contexts/ShopContext';

export default function Notifications() {
  const [target, setTarget] = useState('All Shops');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const { shops } = useShops();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Notification Sent",
      description: `Message sent to ${target}.`,
    });
    setTitle('');
    setMessage('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Composer */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Compose Message
        </h2>
        
        <form onSubmit={handleSend} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Target Audience</Label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => setTarget('All Shops')}
                className={`p-3 text-sm rounded-md border flex flex-col items-center gap-2 transition-colors ${
                  target === 'All Shops' ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/30 border-border text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Store className="w-5 h-5" />
                All Shops
              </button>
              <button 
                type="button"
                onClick={() => setTarget('All Customers')}
                className={`p-3 text-sm rounded-md border flex flex-col items-center gap-2 transition-colors ${
                  target === 'All Customers' ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/30 border-border text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Users className="w-5 h-5" />
                All Customers
              </button>
              <button 
                type="button"
                onClick={() => setTarget('Platform Wide')}
                className={`p-3 text-sm rounded-md border flex flex-col items-center gap-2 transition-colors ${
                  target === 'Platform Wide' ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/30 border-border text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Globe className="w-5 h-5" />
                Platform Wide
              </button>
            </div>
            
            <div className="mt-2">
              <select 
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                onChange={(e) => {
                  if(e.target.value) setTarget(e.target.value);
                }}
                value={['All Shops', 'All Customers', 'Platform Wide'].includes(target) ? '' : target}
              >
                <option value="" disabled>Or select specific shop...</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.name}>{shop.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Notification Title</Label>
            <Input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Policy Update Notice"
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Message</Label>
            <textarea 
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full min-h-[150px] bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
            />
          </div>

          <Button type="submit" className="w-full">
            Send Notification
          </Button>
        </form>
      </div>

      {/* History */}
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
        <h2 className="text-lg font-semibold mb-6">Recent Dispatches</h2>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {mockNotifications.map((notif) => (
              <div key={notif.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-foreground">{notif.title}</h4>
                  <Badge variant="outline" className={notif.status === 'Sent' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                    {notif.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{notif.message}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-3">
                  <span>Target: <strong className="text-foreground">{notif.target}</strong></span>
                  <span>{notif.sentDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
