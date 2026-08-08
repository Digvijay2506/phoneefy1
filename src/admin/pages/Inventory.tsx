import React, { useState } from 'react';
import { mockPhones } from '../data/phones';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Filter, Trash2, RefreshCcw, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { toast } = useToast();

  const filteredPhones = mockPhones.filter(phone => {
    const matchesSearch = phone.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          phone.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          phone.shopName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || phone.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (action: string, model: string) => {
    toast({
      title: "Inventory Action",
      description: `${action} on listing: ${model}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Available': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Sold': return 'bg-secondary text-secondary-foreground border-border';
      case 'Deleted': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search phones, brands, or shops..." 
            className="pl-9 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-secondary/50 rounded-md p-1 border border-border">
            {['All', 'Available', 'Sold', 'Deleted'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  statusFilter === f 
                    ? 'bg-card text-foreground shadow-sm border border-border' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Device Details</th>
                <th className="px-6 py-4 font-medium">Shop</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Listed Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPhones.map((phone) => (
                <tr key={phone.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{phone.model}</div>
                    <div className="text-xs text-muted-foreground mt-1">{phone.brand} • {phone.id}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {phone.shopName}
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-foreground">
                    ₹{phone.price.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={getStatusColor(phone.status)}>
                      {phone.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {phone.listedDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction('View Details', phone.model)}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {phone.status !== 'Deleted' ? (
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleAction('Delete Listing', phone.model)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Force Delete
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAction('Restore Listing', phone.model)}>
                            <RefreshCcw className="w-4 h-4 mr-2 text-green-500" /> Restore
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredPhones.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No phones found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
