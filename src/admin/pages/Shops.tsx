import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useShops } from '../contexts/ShopContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Filter, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Shops() {
  const { shops, updateShop } = useShops();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { toast } = useToast();

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.shopId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || shop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string, name: string) => {
    updateShop(id, { status: 'Verified', shopStatus: 'Active', verificationStatus: 'Approved' });
    toast({ title: 'Shop approved', description: `${name} has been verified and activated.` });
  };

  const handleBlock = (id: string, name: string) => {
    updateShop(id, { status: 'Blocked', shopStatus: 'Suspended', accessEnabled: false });
    toast({ title: 'Shop blocked', description: `${name} access has been suspended.` });
  };

  const handleUnblock = (id: string, name: string) => {
    updateShop(id, { status: 'Verified', shopStatus: 'Active', accessEnabled: true });
    toast({ title: 'Shop unblocked', description: `${name} has been restored.` });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Blocked': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'New': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shops, owners, Shop ID, phone..."
            className="pl-9 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border bg-card">
                <Filter className="w-4 h-4 mr-2" />
                Status: {statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {['All', 'Verified', 'Pending', 'Rejected', 'Blocked', 'New'].map((status) => (
                <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setLocation('/shops/add')} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Shop
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Shop ID</th>
                <th className="px-6 py-4 font-medium">Shop Details</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Registered</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredShops.map((shop) => (
                <tr key={shop.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5">
                      {shop.shopId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{shop.name}</div>
                    <div className="text-muted-foreground mt-0.5 text-xs">{shop.city}, {shop.state}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-foreground">{shop.owner}</div>
                    <div className="text-muted-foreground mt-0.5 text-xs font-mono">{shop.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={getStatusColor(shop.status)}>
                      {shop.status}
                    </Badge>
                    {shop.passwordNeedsReset && (
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px] py-0">
                          Temp Pw
                        </Badge>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {shop.registeredDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLocation(`/shops/${shop.id}`)}>
                          View Profile
                        </DropdownMenuItem>
                        {shop.status !== 'Verified' && (
                          <DropdownMenuItem onClick={() => handleApprove(shop.id, shop.name)}>
                            Approve
                          </DropdownMenuItem>
                        )}
                        {shop.status !== 'Blocked' ? (
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10"
                            onClick={() => handleBlock(shop.id, shop.name)}
                          >
                            Block
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-500 focus:bg-green-500/10"
                            onClick={() => handleUnblock(shop.id, shop.name)}
                          >
                            Unblock
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredShops.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No shops found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground text-right">
        Showing {filteredShops.length} of {shops.length} shops
      </p>
    </div>
  );
}
