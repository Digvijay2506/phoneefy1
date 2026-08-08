import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Store, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type Tab = 'admin' | 'shopkeeper';
type ShopkeeperStep = 'login' | 'change-password' | 'success';

export default function Login() {
  const [tab, setTab] = useState<Tab>('admin');

  const { login, bootstrapAdmin, adminExists } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // ── Admin login / bootstrap state ──────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  // ── Shopkeeper login state ──────────────────────────────────────────────────
  const [loginId, setLoginId] = useState('');
  const [shopPw, setShopPw] = useState('');
  const [showShopPw, setShowShopPw] = useState(false);
  const [shopkeeperStep, setShopkeeperStep] = useState<ShopkeeperStep>('login');
  const [shopSubmitting, setShopSubmitting] = useState(false);
  const [pendingShopId, setPendingShopId] = useState<string | null>(null);

  // Change-password state
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // ── Admin: first-time setup or normal login ─────────────────────────────────
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (adminExists === false) {
      if (password.length < 8) {
        toast({ title: 'Password too short', description: 'Use at least 8 characters.', variant: 'destructive' });
        return;
      }
      if (password !== confirmPw) {
        toast({ title: 'Passwords do not match', variant: 'destructive' });
        return;
      }
      setSubmittingAdmin(true);
      const { error } = await bootstrapAdmin(email.trim(), password);
      setSubmittingAdmin(false);
      if (error) {
        toast({ title: 'Could not create admin account', description: error, variant: 'destructive' });
        return;
      }
      setLocation('/');
      return;
    }

    setSubmittingAdmin(true);
    const { error } = await login(email.trim(), password);
    setSubmittingAdmin(false);
    if (error) {
      toast({ title: 'Login failed', description: error, variant: 'destructive' });
      return;
    }
    setLocation('/');
  };

  // ── Shopkeeper Login (secondary path — main portal is the Phoneefy app) ────
  const handleShopkeeperLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = loginId.trim();
    const pw = shopPw.trim();
    if (!id || !pw) return;

    setShopSubmitting(true);

    const digits = id.replace(/\D/g, '');
    const { data: shop } = await supabase
      .from('shops')
      .select('id, login_email, access_enabled, password_needs_reset')
      .or(`phone.eq.${digits},shop_code.eq.${id.toUpperCase()}`)
      .maybeSingle();

    if (!shop || !shop.access_enabled || !shop.login_email) {
      setShopSubmitting(false);
      toast({
        title: 'Invalid credentials',
        description: 'Mobile Number or Shop ID not found, or login is disabled.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: shop.login_email, password: pw });
    setShopSubmitting(false);

    if (error) {
      toast({ title: 'Invalid password', description: 'Please check your password and try again.', variant: 'destructive' });
      return;
    }

    setPendingShopId(shop.id);
    if (shop.password_needs_reset) {
      setShopkeeperStep('change-password');
    } else {
      // Already fully set up — send them to the real shopkeeper portal
      await supabase.from('shops').update({ last_login: new Date().toISOString() }).eq('id', shop.id);
      setShopkeeperStep('success');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) {
      toast({ title: 'Password too short', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (newPw !== confirmNewPw) {
      toast({ title: 'Passwords do not match', description: 'Please re-enter matching passwords.', variant: 'destructive' });
      return;
    }
    setShopSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (!error && pendingShopId) {
      await supabase
        .from('shops')
        .update({ password_needs_reset: false, last_login: new Date().toISOString() })
        .eq('id', pendingShopId);
    }
    setShopSubmitting(false);
    if (error) {
      toast({ title: 'Could not update password', description: error.message, variant: 'destructive' });
      return;
    }
    setShopkeeperStep('success');
  };

  const inputClass =
    'w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-lg bg-primary mx-auto flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold font-mono text-xl">P</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Phoneefy</h1>
          <p className="text-sm text-muted-foreground mt-1">Secure Platform Control Center</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-secondary/50 rounded-lg p-1 border border-border mb-5">
          <button
            onClick={() => { setTab('admin'); setShopkeeperStep('login'); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'admin' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Admin Login
          </button>
          <button
            onClick={() => { setTab('shopkeeper'); setShopkeeperStep('login'); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'shopkeeper' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Shopkeeper Login
          </button>
        </div>

        {/* ── Admin Panel ── */}
        {tab === 'admin' && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
            {adminExists === false && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2.5 mb-4 flex items-start gap-2">
                <UserPlus className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-primary font-medium">Create the admin account</p>
                  <p className="text-xs text-muted-foreground mt-0.5">No admin exists yet — the first account you create here becomes the permanent admin.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showAdminPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPw((v) => !v)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showAdminPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminExists === false && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <input
                    type={showAdminPw ? 'text' : 'password'}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              )}

              <Button type="submit" disabled={submittingAdmin} className="w-full mt-4 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                {submittingAdmin
                  ? 'Please wait…'
                  : adminExists === false
                    ? 'Create Admin Account'
                    : 'Secure Login'}
              </Button>
            </form>
          </div>
        )}

        {/* ── Shopkeeper Login Panel ── */}
        {tab === 'shopkeeper' && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
            {shopkeeperStep === 'login' && (
              <form onSubmit={handleShopkeeperLogin} className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2.5 mb-2">
                  <p className="text-sm text-primary font-medium">Login using your Mobile Number or Shop ID.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Mobile Number or Shop ID</label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="9876543210  or  PHN0001"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <input
                      type={showShopPw ? 'text' : 'password'}
                      value={shopPw}
                      onChange={(e) => setShopPw(e.target.value)}
                      placeholder="Enter your password"
                      className={`${inputClass} pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowShopPw((v) => !v)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showShopPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={shopSubmitting} className="w-full mt-4 gap-2">
                  <Store className="w-4 h-4" />
                  {shopSubmitting ? 'Signing in…' : 'Login'}
                </Button>

                <p className="text-center text-xs text-muted-foreground pt-1">
                  Forgot password? Contact your Phoneefy admin.
                </p>
              </form>
            )}

            {shopkeeperStep === 'change-password' && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5">
                  <p className="text-sm text-yellow-400 font-semibold">Create Your New Password</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You logged in with a temporary password. Please set a new permanent password to continue.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={`${inputClass} pr-10`}
                      required
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      value={confirmNewPw}
                      onChange={(e) => setConfirmNewPw(e.target.value)}
                      placeholder="Re-enter new password"
                      className={`${inputClass} pr-10`}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={shopSubmitting} className="w-full mt-4 gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {shopSubmitting ? 'Saving…' : 'Set New Password & Continue'}
                </Button>
              </form>
            )}

            {shopkeeperStep === 'success' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-base font-semibold text-foreground">You're logged in</h3>
                <p className="text-sm text-muted-foreground">
                  Head to the main Phoneefy app to manage your inventory, analytics, offers, and subscriptions.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-border bg-card"
                  onClick={() => {
                    supabase.auth.signOut();
                    setShopkeeperStep('login'); setLoginId(''); setShopPw(''); setNewPw(''); setConfirmNewPw('');
                  }}
                >
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Phoneefy Platform. All rights reserved.
        </div>
      </div>
    </div>
  );
}
