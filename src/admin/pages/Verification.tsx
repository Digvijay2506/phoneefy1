import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, CalendarDays, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useShops } from '../contexts/ShopContext';
import type { Shop } from '../types';

export default function Verification() {
  const { toast } = useToast();
  const { shops, updateShop } = useShops();
  // Only show shops that are not fully approved or rejected outright, or those with scheduled visits
  const verificationQueue = shops.filter((shop) =>
    shop.verificationStatus === 'Pending' ||
    shop.verificationStatus === 'Visit Scheduled'
  );

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Pending': return <Clock className="w-4 h-4 mr-1" />;
      case 'Visit Scheduled': return <CalendarDays className="w-4 h-4 mr-1" />;
      case 'Approved': return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case 'Rejected': return <XCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Visit Scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const handleAction = async (action: 'Schedule Visit' | 'Approve' | 'Reject', shop: Shop) => {
    if (action === 'Schedule Visit') {
      await updateShop(shop.id, { verificationStatus: 'Visit Scheduled' });
    } else if (action === 'Approve') {
      await updateShop(shop.id, { verificationStatus: 'Approved', status: 'Verified' });
    } else {
      await updateShop(shop.id, { verificationStatus: 'Rejected', status: 'Rejected' });
    }
    toast({
      title: 'Verification Updated',
      description: `${action} for ${shop.name}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Verification Queue ({verificationQueue.length})</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {verificationQueue.map((shop) => (
          <div key={shop.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row gap-5">
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">{shop.name}</h3>
                  <Badge variant="outline" className={`flex items-center ${getStatusColor(shop.verificationStatus)}`}>
                    {getStatusIcon(shop.verificationStatus)}
                    {shop.verificationStatus}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Owner: {shop.owner}</p>
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{shop.address}</span>
              </div>
              
              <div className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-md">
                <strong>Admin Notes:</strong> No notes added yet.
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:w-40 sm:border-l sm:border-border sm:pl-5 shrink-0">
              {shop.verificationStatus === 'Pending' && (
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleAction('Schedule Visit', shop)}>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Schedule Visit
                </Button>
              )}
              <Button size="sm" className="w-full justify-start bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction('Approve', shop)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => handleAction('Reject', shop)}>
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        ))}
        {verificationQueue.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
            No shops pending verification.
          </div>
        )}
      </div>
    </div>
  );
}
