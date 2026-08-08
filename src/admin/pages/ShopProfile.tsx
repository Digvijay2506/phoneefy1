import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useShops } from '../contexts/ShopContext';
import {
  ArrowLeft, Store, Phone, MessageCircle, Mail, MapPin, CreditCard,
  BadgeCheck, Clock, Users, Package, Calendar, LogIn, KeyRound,
  Eye, EyeOff, Shield, Power, PowerOff
} from 'lucide-react';

export default function ShopProfile() {
  const { shops, updateShop, resetShopPassword } = useShops();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Parse shop id from URL: /shops/:id
  const shopId = location.split('/').pop() || '';
  const shop = shops.find((s) => s.id === shopId);

  // Reset password modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [generatedPw, setGeneratedPw] = useState<string | null>(null);
  const [showNewPw, setShowNewPw] = useState(false);

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Store className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Shop not found.</p>
        <Button variant="outline" onClick={() => setLocation('/shops')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Shops
        </Button>
      </div>
    );
  }

  const handleResetPassword = async () => {
    setResetting(true);
    const outcome = await resetShopPassword(shop.id);
    setResetting(false);

    if ('error' in outcome) {
      toast({ title: 'Could not reset password', description: outcome.error, variant: 'destructive' });
      return;
    }

    setGeneratedPw(outcome.tempPassword);
    toast({
      title: 'Temporary password set',
      description: `Share the new temporary password with ${shop.owner} (${shop.phone}).`,
    });
  };

  const handleToggleAccess = () => {
    const next = !shop.accessEnabled;
    updateShop(shop.id, { accessEnabled: next });
    toast({
      title: next ? 'Login access enabled' : 'Login access disabled',
      description: `${shop.name} login has been ${next ? 'enabled' : 'disabled'}.`,
    });
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

  const getShopStatusColor = (s: string) => {
    switch (s) {
      case 'Active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Inactive': return 'bg-secondary text-muted-foreground border-border';
      case 'Suspended': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="border-border bg-card" onClick={() => setLocation('/shops')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              {shop.name}
            </h1>
            <p className="text-sm text-muted-foreground font-mono mt-0.5">{shop.shopId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border bg-card"
            onClick={() => { setGeneratedPw(null); setShowNewPw(false); setShowResetModal(true); }}
          >
            <KeyRound className="w-4 h-4 mr-1" /> Reset Password
          </Button>
          {shop.accessEnabled ? (
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/20 text-destructive hover:bg-destructive/10 bg-card"
              onClick={handleToggleAccess}
            >
              <PowerOff className="w-4 h-4 mr-1" /> Disable Login
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-green-500/20 text-green-500 hover:bg-green-500/10 bg-card"
              onClick={handleToggleAccess}
            >
              <Power className="w-4 h-4 mr-1" /> Enable Login
            </Button>
          )}
        </div>
      </div>

      {/* Password Reset Alert */}
      {shop.passwordNeedsReset && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-400">Temporary Password Active</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Shopkeeper has not yet set a new password. Remind them to log in and create a new password.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Identity & Contact */}
        <div className="lg:col-span-2 space-y-4">
          {/* Identity Card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Identity</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={Store} label="Shop ID" value={shop.shopId} mono />
              <InfoRow icon={Store} label="Internal ID" value={shop.id} mono />
              <InfoRow icon={Store} label="Shop Name" value={shop.name} />
              <InfoRow icon={Users} label="Owner Name" value={shop.owner} />
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={Phone} label="Mobile Number" value={shop.phone} />
              <InfoRow icon={MessageCircle} label="WhatsApp" value={shop.whatsapp} />
              <InfoRow icon={Mail} label="Email" value={shop.email || '—'} />
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <InfoRow icon={MapPin} label="Street Address" value={shop.address} />
              </div>
              <InfoRow icon={MapPin} label="City" value={shop.city} />
              <InfoRow icon={MapPin} label="State" value={shop.state} />
              <InfoRow icon={MapPin} label="PIN Code" value={shop.pinCode} />
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={Calendar} label="Joined Date" value={shop.joinedDate} />
              <InfoRow icon={LogIn} label="Last Login" value={shop.lastLogin} />
              <InfoRow icon={KeyRound} label="Last Password Reset" value={shop.lastPasswordReset} />
              <InfoRow icon={Package} label="Total Listings" value={String(shop.totalListings)} />
            </div>
          </div>
        </div>

        {/* Right: Status Panel */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Status</h3>
            <div className="space-y-3">
              <StatusRow label="Verification" badge={<Badge variant="outline" className={getStatusColor(shop.status)}>{shop.status}</Badge>} />
              <StatusRow label="Shop Status" badge={<Badge variant="outline" className={getShopStatusColor(shop.shopStatus)}>{shop.shopStatus}</Badge>} />
              <StatusRow label="Login Access" badge={
                <Badge variant="outline" className={shop.accessEnabled ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                  {shop.accessEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              } />
              <StatusRow label="Verification Status" badge={
                <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border text-xs">
                  {shop.verificationStatus}
                </Badge>
              } />
              <StatusRow label="Password" badge={
                <Badge variant="outline" className={shop.passwordNeedsReset ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}>
                  {shop.passwordNeedsReset ? 'Temp Active' : 'Set by User'}
                </Badge>
              } />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Subscription</h3>
            <div className="space-y-3">
              <StatusRow label="Plan" badge={
                <Badge variant="outline" className="bg-secondary text-muted-foreground border-border">
                  {shop.subscription}
                </Badge>
              } />
              <StatusRow label="Monthly Fee" badge={<span className="text-sm font-mono text-muted-foreground">₹0</span>} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Security Notice</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Passwords are never visible to admin. Use Reset Password to set a new temporary password and share it with the shopkeeper. They must change it on first login.
            </p>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" /> Reset Password — {shop.name}
            </h3>

            {!generatedPw ? (
              <>
                <p className="text-sm text-muted-foreground">
                  This generates a brand-new temporary password for this shopkeeper. Their current password stops
                  working immediately, and they'll be required to set a new one on their next login.
                </p>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" className="border-border bg-card" onClick={() => setShowResetModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleResetPassword} disabled={resetting}>
                    {resetting ? 'Generating…' : 'Generate New Password'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-secondary/30 border border-border rounded-lg p-3 flex items-center justify-between">
                  <span className="font-mono text-sm text-foreground">
                    {showNewPw ? generatedPw : '••••••••••'}
                  </span>
                  <button type="button" onClick={() => setShowNewPw((v) => !v)} className="text-muted-foreground hover:text-foreground">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This password is shown only once. Share it with the shopkeeper now.
                </p>
                <div className="flex justify-end pt-1">
                  <Button onClick={() => { setShowResetModal(false); setGeneratedPw(null); setShowNewPw(false); }}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono = false }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="w-3 h-3" /> {label}
      </p>
      <p className={`text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );
}

function StatusRow({ label, badge }: { label: string; badge: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground">{label}</p>
      {badge}
    </div>
  );
}
