import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useShops } from '../contexts/ShopContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, KeyRound, Power, PowerOff, Eye, EyeOff, ExternalLink, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Credentials() {
  const { shops, updateShop, resetShopPassword } = useShops();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState(false);

  const openReset = (id: string) => {
    setResetTarget(id);
    setGeneratedPassword(null);
    setShowPw(false);
  };

  const handleResetSubmit = async () => {
    if (!resetTarget) return;
    setResetting(true);
    const outcome = await resetShopPassword(resetTarget);
    setResetting(false);

    if ('error' in outcome) {
      toast({ title: 'Could not reset password', description: outcome.error, variant: 'destructive' });
      return;
    }

    setGeneratedPassword(outcome.tempPassword);
    const shop = shops.find((s) => s.id === resetTarget);
    toast({
      title: 'Temporary password set',
      description: `Share the new temporary password with ${shop?.owner} (${shop?.phone}).`,
    });
  };

  const handleToggleAccess = async (id: string, currentlyEnabled: boolean, name: string) => {
    await updateShop(id, { accessEnabled: !currentlyEnabled });
    toast({
      title: currentlyEnabled ? 'Login disabled' : 'Login enabled',
      description: `${name} login access has been ${currentlyEnabled ? 'disabled' : 'enabled'}.`,
    });
  };

  const copyPassword = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetShop = resetTarget ? shops.find((s) => s.id === resetTarget) : null;

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-destructive">Security Notice</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Admin cannot view current passwords. Resetting generates a brand-new temporary password —
            share it with the shopkeeper. They must set their own password on next login.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Shop</th>
                <th className="px-6 py-4 font-medium">Login ID (Mobile / Shop ID)</th>
                <th className="px-6 py-4 font-medium">Password Status</th>
                <th className="px-6 py-4 font-medium">Access</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4">
                    <button
                      className="font-medium text-foreground hover:text-primary transition-colors text-left flex items-center gap-1 group"
                      onClick={() => setLocation(`/shops/${shop.id}`)}
                    >
                      {shop.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60" />
                    </button>
                    <div className="text-xs font-mono text-primary/70 mt-0.5">{shop.shopId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-foreground font-mono text-xs">{shop.phone}</div>
                    <div className="text-muted-foreground font-mono text-xs mt-0.5">{shop.shopId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={
                        shop.passwordNeedsReset
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          : 'bg-green-500/10 text-green-500 border-green-500/20'
                      }
                    >
                      {shop.passwordNeedsReset ? 'Temp Active — Awaiting Reset' : 'Set by Shopkeeper'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={
                        shop.accessEnabled
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }
                    >
                      {shop.accessEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {shop.lastLogin}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-border bg-card"
                        onClick={() => openReset(shop.id)}
                      >
                        <KeyRound className="w-3 h-3 mr-1" />
                        Reset Password
                      </Button>
                      {shop.accessEnabled ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 bg-card"
                          onClick={() => handleToggleAccess(shop.id, true, shop.name)}
                        >
                          <PowerOff className="w-3 h-3 mr-1" />
                          Disable
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs border-green-500/20 text-green-500 hover:bg-green-500/10 bg-card"
                          onClick={() => handleToggleAccess(shop.id, false, shop.name)}
                        >
                          <Power className="w-3 h-3 mr-1" />
                          Enable
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

      {/* Reset Password Modal */}
      {resetTarget && resetShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" /> Reset Password
            </h3>
            <div className="bg-secondary/50 border border-border rounded-lg p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Shop</p>
              <p className="text-sm font-medium text-foreground">{resetShop.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{resetShop.phone} · {resetShop.shopId}</p>
            </div>

            {!generatedPassword ? (
              <>
                <p className="text-sm text-muted-foreground">
                  This generates a brand-new temporary password for this shopkeeper. Their current password will
                  stop working immediately, and they'll be required to set a new one on their next login.
                </p>
                <div className="flex gap-3 justify-end pt-1">
                  <Button
                    variant="outline"
                    className="border-border bg-card"
                    onClick={() => setResetTarget(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleResetSubmit} disabled={resetting}>
                    {resetting ? 'Generating…' : 'Generate New Password'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-secondary/30 border border-border rounded-lg p-3 flex items-center justify-between">
                  <span className="font-mono text-sm text-foreground">
                    {showPw ? generatedPassword : '••••••••••'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button type="button" onClick={copyPassword} className="text-muted-foreground hover:text-foreground">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  This password is shown only once. Share it with the shopkeeper now.
                </p>
                <div className="flex justify-end pt-1">
                  <Button onClick={() => setResetTarget(null)}>Done</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
