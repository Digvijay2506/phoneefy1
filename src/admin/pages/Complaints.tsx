import React, { useState } from 'react';
import { mockComplaints } from '../data/complaints';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, ExternalLink, Check, Ban } from 'lucide-react';

export default function Complaints() {
  const [activeTab, setActiveTab] = useState<'Customer' | 'Shop'>('Customer');
  const { toast } = useToast();

  const filteredComplaints = mockComplaints.filter(c => c.type === activeTab);

  const handleAction = (action: string, id: string) => {
    toast({
      title: "Complaint Updated",
      description: `Complaint ${id} marked as ${action}.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'In Review': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Closed': return 'bg-secondary text-muted-foreground border-border';
      default: return 'bg-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-destructive';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border pb-4">
        <button
          onClick={() => setActiveTab('Customer')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'Customer' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:bg-secondary/50'
          }`}
        >
          Customer Complaints
        </button>
        <button
          onClick={() => setActiveTab('Shop')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'Shop' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:bg-secondary/50'
          }`}
        >
          Shop Complaints
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredComplaints.map((complaint) => (
          <div key={complaint.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {complaint.id}
                  </span>
                  <Badge variant="outline" className={getStatusColor(complaint.status)}>
                    {complaint.status}
                  </Badge>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority} Priority
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mt-2">{complaint.subject}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{complaint.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm bg-secondary/20 rounded-lg p-3">
              <div>
                <span className="text-muted-foreground">Complainant:</span> 
                <span className="font-medium text-foreground ml-2">{complaint.complainant}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Against:</span> 
                <span className="font-medium text-foreground ml-2">{complaint.against}</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-2 mb-2 text-foreground font-medium">
                <MessageSquare className="w-4 h-4 text-primary" /> Details:
              </span>
              {complaint.details}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" className="bg-card border-border hover:bg-secondary">
                <ExternalLink className="w-4 h-4 mr-2" /> View Full Thread
              </Button>
              {complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
                <>
                  <Button variant="outline" size="sm" className="border-green-500/20 text-green-500 hover:bg-green-500/10 bg-card" onClick={() => handleAction('Resolved', complaint.id)}>
                    <Check className="w-4 h-4 mr-2" /> Resolve
                  </Button>
                  <Button variant="outline" size="sm" className="border-destructive/20 text-destructive hover:bg-destructive/10 bg-card" onClick={() => handleAction('Rejected', complaint.id)}>
                    <Ban className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
        {filteredComplaints.length === 0 && (
          <div className="py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
            No {activeTab.toLowerCase()} complaints found.
          </div>
        )}
      </div>
    </div>
  );
}
