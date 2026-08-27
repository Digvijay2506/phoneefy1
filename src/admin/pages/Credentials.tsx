import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useShops } from '../contexts/ShopContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Link2, Power, PowerOff, ExternalLink, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Credentials() {
  const { shops, updateShop, generateResetLink } = useShops();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const openReset = (id: string) => { setResetTarget(id); setGeneratedLink(null); };

  const handleGenerateLink = async () => {
    if (!resetTarget) return;
    setGenerating(true);
    const outcome = await generateResetLink(resetTarget);
    setGenerating(false);
    if ('error' in outcome) {
      toast({ title: 'Could not generate link', description: outcome.error, variant: 'destructive' });
      return;
    }
    setGeneratedLink(outcome.resetLink);
    const shop = shops.find((s) => s.id === resetTarget);
    toast({ title: 'Reset link ready', description: `Send it to ${shop?.owner} (${shop?.phone}). Expires in 1 hour.` });
  };

  const handleToggleAccess = async (id: string, currentlyEnabled: boolean, name: string) => {
    await updateShop(id, { accessEnabled: !currentlyEnabled });
    toast({
      title: currentlyEnabled ? 'Login disabled' : 'Login enabled',
      description: `${name} login access has been ${currentlyEnabled ? 'disabled' : 'enabled'}.`,
    });
  };

  const copyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetShop = resetTarget ? shops.find((s) => s.id === resetTarget) : null;

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-primary">How password reset works</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Admin never sees any password. Click "Send Reset Link" to generate a secure 1-hour link — send it to the shopkeeper via WhatsApp or SMS. They click it and set their own new password. You can't see what they choose.
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
                <th className="px-6 py-4 font-medium">Login ID</th>
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
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={shop.passwordNeedsReset ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}>
                      {shop.passwordNeedsReset ? 'Reset Pending' : 'Set by Shopkeeper'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={shop.accessEnabled ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                      {shop.accessEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{shop.lastLogin}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs border-border bg-card" onClick={() => openReset(shop.id)}>
                        <Link2 className="w-3 h-3 mr-1" /> Send Reset Link
                      </Button>
                      {shop.accessEnabled ? (
                        <Button variant="outline" size="sm" className="h-8 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 bg-card" onClick={() => handleToggleAccess(shop.id, true, shop.name)}>
                          <PowerOff className="w-3 h-3 mr-1" /> Disable
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-8 text-xs border-green-500/20 text-green-500 hover:bg-green-500/10 bg-card" onClick={() => handleToggleAccess(shop.id, false, shop.name)}>
                          <Power className="w-3 h-3 mr-1" /> Enable
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

      {/* Generate Reset Link Modal */}
      {resetTarget && resetShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" /> Password Reset Link — {resetShop.name}
            </h3>
            <div className="bg-secondary/50 border border-border rounded-lg p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Shop</p>
              <p className="text-sm font-medium text-foreground">{resetShop.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{resetShop.phone} · {resetShop.shopId}</p>
            </div>

            {!generatedLink ? (
              <>
                <p className="text-sm text-muted-foreground">
                  This generates a secure link that expires in <strong>1 hour</strong>. Send it to the shopkeeper via WhatsApp or SMS — they click it and set their own password. You never see what they choose.
                </p>
                <div className="flex gap-3 justify-end pt-1">
                  <Button variant="outline" className="border-border bg-card" onClick={() => setResetTarget(null)}>Cancel</Button>
                  <Button onClick={handleGenerateLink} disabled={generating}>
                    {generating ? 'Generating…' : 'Generate Link'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-secondary/30 border border-border rounded-lg p-3 break-all text-xs font-mono text-foreground">
                  {generatedLink}
                </div>
                <p className="text-xs text-muted-foreground">Copy this link and send it to the shopkeeper. It expires in 1 hour and works only once.</p>
                <div className="flex gap-3 justify-end pt-1">
                  <Button variant="outline" className="border-border bg-card gap-1.5" onClick={copyLink}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button onClick={() => { setResetTarget(null); setGeneratedLink(null); }}>Done</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
