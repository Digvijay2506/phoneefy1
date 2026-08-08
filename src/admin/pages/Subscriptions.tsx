import React from 'react';
import { mockSubscriptions } from '../data/subscriptions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Subscriptions() {
  const { toast } = useToast();

  const handleAction = (action: string, shopName: string) => {
    toast({
      title: "Subscription Updated",
      description: `${action} processed for ${shopName}.`,
    });
  };

  const getPlanColor = (plan: string) => {
    switch(plan) {
      case 'Premium': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Pro': return 'bg-primary/10 text-primary border-primary/20';
      case 'Basic': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Free': return 'bg-secondary text-muted-foreground border-border';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Inactive': return 'bg-secondary text-muted-foreground border-border';
      case 'Cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Total MRR</p>
          <p className="text-2xl font-bold text-foreground">
            ₹{mockSubscriptions.filter(s => s.status === 'Active').reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Subs</p>
          <p className="text-2xl font-bold text-foreground">
            {mockSubscriptions.filter(s => s.status === 'Active').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Premium Tier</p>
          <p className="text-2xl font-bold text-foreground">
            {mockSubscriptions.filter(s => s.plan === 'Premium').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-destructive">
            {mockSubscriptions.filter(s => s.status === 'Cancelled').length}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Shop Name</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Amount/mo</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Period</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{sub.shopName}</div>
                    <div className="text-xs text-muted-foreground mt-1">ID: {sub.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={getPlanColor(sub.plan)}>
                      {sub.plan}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-foreground">
                    ₹{sub.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={getStatusColor(sub.status)}>
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    <div>{sub.startDate}</div>
                    <div>to {sub.endDate}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {sub.status === 'Active' ? (
                        <>
                          <Button variant="outline" size="sm" className="h-8 text-xs border-border bg-card" onClick={() => handleAction('Renew', sub.shopName)}>
                            Renew
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 bg-card" onClick={() => handleAction('Cancel', sub.shopName)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" className="h-8 text-xs border-green-500/20 text-green-500 hover:bg-green-500/10 bg-card" onClick={() => handleAction('Activate', sub.shopName)}>
                          Activate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
