import React, { useState } from 'react';
import { mockActivityLogs } from '../data/activityLogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredLogs = mockActivityLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.adminUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Downloading activity_logs.csv...",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search action, user, or target..." 
            className="pl-9 bg-card border-border font-mono text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="border-border bg-card" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="bg-black/40 border border-border rounded-xl overflow-hidden font-mono text-sm shadow-inner shadow-black">
        <div className="p-3 border-b border-border bg-black/60 flex items-center gap-2 text-muted-foreground">
          <Terminal className="w-4 h-4" />
          <span>system_activity_stream</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs text-muted-foreground/70 uppercase bg-black/40 border-b border-border/50">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3 text-primary/80">
                    {log.adminUser}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground/60 text-xs">
                    {log.ipAddress}
                  </td>
                  <td className="px-4 py-3 text-foreground font-semibold">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-foreground/80">
                    {log.target}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                    {log.details}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No logs found matching query.
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
