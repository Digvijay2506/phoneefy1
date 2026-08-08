import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useShops, type NewShopCredentials } from '../contexts/ShopContext';
import { ArrowLeft, Store, Eye, EyeOff, Info, Copy, Check, ShieldCheck } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

export default function AddShop() {
  const { createShop } = useShops();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: '',
    owner: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pinCode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ shopId: string; credentials: NewShopCredentials } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const outcome = await createShop({
      name: form.name.trim(),
      owner: form.owner.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || form.phone.trim(),
      city: form.city.trim(),
      state: form.state,
      pinCode: form.pinCode.trim(),
      address: form.address.trim(),
    });

    setSubmitting(false);

    if ('error' in outcome) {
      toast({ title: 'Could not register shop', description: outcome.error, variant: 'destructive' });
      return;
    }

    setResult({ shopId: outcome.shop.shopId, credentials: outcome.credentials });
    toast({
      title: `Shop registered — ${outcome.shop.shopId}`,
      description: `${form.name} added successfully.`,
    });
  };

  const copyCredentials = () => {
    if (!result) return;
    const text = `Phoneefy Shopkeeper Login\nShop ID: ${result.credentials.shopCode}\nMobile: ${form.phone}\nTemporary Password: ${result.credentials.tempPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass = "w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground";

  // ── Success screen: show the one-time credentials ──────────────────────────
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Shop Registered — {result.shopId}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Share these login details with the shopkeeper. The password is shown only once — after you leave
              this page, use "Reset Password" from Credentials to issue a new one if needed.
            </p>
          </div>

          <div className="bg-secondary/30 border border-border rounded-lg p-4 space-y-3 text-left">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Shop ID</span>
              <span className="font-mono text-sm text-foreground">{result.credentials.shopCode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Login Mobile Number</span>
              <span className="font-mono text-sm text-foreground">{form.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Temporary Password</span>
              <span className="font-mono text-sm text-foreground flex items-center gap-2">
                {showPassword ? result.credentials.tempPassword : '••••••••••'}
                <button type="button" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" className="border-border bg-card" onClick={copyCredentials}>
              {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
              {copied ? 'Copied' : 'Copy Credentials'}
            </Button>
            <Button onClick={() => setLocation('/shops')}>Done — View Shops</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="border-border bg-card" onClick={() => setLocation('/shops')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" /> Register New Shop
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fill in the details — a Shop ID and login password are generated automatically.</p>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 flex items-center gap-3">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <div>
          <p className="text-sm text-primary">
            <span className="font-semibold">Shop ID & password are auto-generated</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            After you submit, you'll see the credentials once so you can share them with the shopkeeper.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop Information */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Shop Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shop Name *</label>
              <input className={inputClass} placeholder="e.g. Galaxy Phone Store" value={form.name} onChange={set('name')} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Owner Name *</label>
              <input className={inputClass} placeholder="e.g. Rahul Sharma" value={form.owner} onChange={set('owner')} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mobile Number *</label>
              <input className={inputClass} placeholder="9876543210" value={form.phone} onChange={set('phone')} required />
              <p className="text-xs text-muted-foreground">This number is what the shopkeeper will log in with.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WhatsApp Number *</label>
              <input className={inputClass} placeholder="9876543210" value={form.whatsapp} onChange={set('whatsapp')} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email <span className="text-muted-foreground/60 normal-case">(optional)</span></label>
            <input type="email" className={inputClass} placeholder="shopkeeper@example.com" value={form.email} onChange={set('email')} />
          </div>
        </div>

        {/* Address */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Shop Address</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Street Address *</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              placeholder="Shop No. 23, FC Road"
              value={form.address}
              onChange={set('address')}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">City *</label>
              <input className={inputClass} placeholder="Pune" value={form.city} onChange={set('city')} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">State *</label>
              <select className={inputClass} value={form.state} onChange={set('state')} required>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">PIN Code *</label>
              <input className={inputClass} placeholder="411004" maxLength={6} value={form.pinCode} onChange={set('pinCode')} required />
            </div>
          </div>
        </div>

        {/* Default Settings */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Default Settings</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Verification Status', value: 'Pending', color: 'text-yellow-400' },
              { label: 'Subscription Plan', value: 'Free', color: 'text-muted-foreground' },
              { label: 'Shop Status', value: 'Active', color: 'text-primary' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-secondary/30 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-sm font-semibold mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">These defaults are set by the system. You can change them from the Shop Profile later.</p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end pb-6">
          <Button type="button" variant="outline" className="border-border bg-card" onClick={() => setLocation('/shops')}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="min-w-32">
            {submitting ? 'Registering...' : 'Register Shop'}
          </Button>
        </div>
      </form>
    </div>
  );
}
