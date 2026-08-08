import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, MessageSquarePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useShops } from '../contexts/ShopContext';
import type { Shop } from '../types';

export default function Requests() {
  const [filter, setFilter] = useState('New');
  const { toast } = useToast();
  const { shops, updateShop } = useShops();

  // For requests, we primarily look at 'New' or 'Pending' status shops
  const requests = shops.filter((shop) =>
    (filter === 'All' && (shop.status === 'New' || shop.status === 'Pending' || shop.status === 'Rejected')) ||
    shop.status === filter
  );

  const handleAction = async (action: 'Approved' | 'Rejected' | 'Requested more info', shop: Shop) => {
    if (action === 'Approved') {
      await updateShop(shop.id, { status: 'Verified', verificationStatus: 'Approved' });
    } else if (action === 'Rejected') {
      await updateShop(shop.id, { status: 'Rejected', verificationStatus: 'Rejected' });
    }
    toast({
      title: 'Request Processed',
      description: `${shop.name} request has been ${action.toLowerCase()}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border pb-4">
        {['New', 'Pending', 'Rejected', 'All'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === f 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((shop) => (
          <div key={shop.id} className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full md:w-3/4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Shop Name</p>
                <p className="font-medium text-foreground">{shop.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Owner</p>
                <p className="text-foreground text-sm">{shop.owner}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
                <p className="text-sm text-foreground">{shop.email}</p>
                <p className="text-xs text-muted-foreground">{shop.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Submitted</p>
                <p className="text-sm text-foreground">{shop.registeredDate}</p>
                <Badge variant="outline" className="mt-1 bg-secondary text-xs">{shop.status}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <Button size="icon" variant="outline" className="border-border hover:bg-secondary" title="Request Info" onClick={() => handleAction('Requested more info', shop)}>
                <MessageSquarePlus className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button size="icon" variant="outline" className="border-green-500/30 hover:bg-green-500/10" title="Approve" onClick={() => handleAction('Approved', shop)}>
                <Check className="w-4 h-4 text-green-500" />
              </Button>
              <Button size="icon" variant="outline" className="border-red-500/30 hover:bg-red-500/10" title="Reject" onClick={() => handleAction('Rejected', shop)}>
                <X className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
            No registration requests found for filter: {filter}.
          </div>
        )}
      </div>
    </div>
  );
}
