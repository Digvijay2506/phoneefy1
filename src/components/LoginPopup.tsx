import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';
import { useCustomerSession } from '@/contexts/CustomerSessionContext';
import { useShopkeeperSession } from '@/contexts/ShopkeeperSessionContext';
import { trackCustomerLogin, trackCustomerSignup } from '@/lib/analytics';

const SEEN_KEY = 'phoneefy_login_prompt';

/** Other parts of the app listen for this to open the shopkeeper login screen. */
export const OPEN_SHOPKEEPER_LOGIN_EVENT = 'phoneefy:open-shopkeeper-login';

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === 'seen';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, 'seen');
  } catch {
    /* private mode: it just may ask again */
  }
}

type Mode = 'login' | 'signup';

/**
 * A friendly, OPTIONAL "log in?" popup when the website opens.
 * Customers can close it (X, "Continue without login", Esc, or tapping outside)
 * and keep browsing. It shows once per visit, and never to someone already logged in.
 */
export default function LoginPopup() {
  const { customer, loading: customerLoading, login, signUp } = useCustomerSession();
  const { shop, loading: shopLoading } = useShopkeeperSession();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Pop up shortly after the website opens (once the login state is known)
  useEffect(() => {
    if (customerLoading || shopLoading) return;
    if (customer || shop) return;
    if (alreadySeen()) return;
    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, [customerLoading, shopLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    setOpen(false);
    markSeen();
  };

  // Logged in (here or elsewhere) → nothing more to ask
  useEffect(() => {
    if (open && (customer || shop)) close();
  }, [customer, shop]); // eslint-disable-line react-hooks/exhaustive-deps

  // Esc closes; page behind doesn't scroll while the popup is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone.trim() || !password) { setError('Please enter your mobile number and password.'); return; }
    if (mode === 'signup') {
      if (!name.trim()) { setError('Please enter your name.'); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
    }
    setBusy(true);
    const result = mode === 'signup' ? await signUp(name, phone, password) : await login(phone, password);
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    if (mode === 'signup') trackCustomerSignup(); else trackCustomerLogin();
    close();
  };

  const goShopkeeper = () => {
    close();
    window.dispatchEvent(new Event(OPEN_SHOPKEEPER_LOGIN_EVENT));
  };

  const input = 'w-full h-11 bg-[#F5F7FA] rounded-xl px-4 text-sm text-[#1A1D1F] outline-none border border-transparent focus:border-[#1A73E8]';

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-5"
      style={{ background: 'rgba(11,15,26,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={close}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-popup-title"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[360px] max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#F5F7FA] flex items-center justify-center"
        >
          <X size={18} color="#1A1D1F" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black"
            style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)' }}
          >
            P
          </div>
          <h2 id="login-popup-title" className="text-lg font-bold text-[#1A1D1F] mt-3">Welcome to Phoneefy</h2>
          <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">
            Log in to save your details and contact shops faster. It's optional — you can keep browsing without an account.
          </p>
        </div>

        <div className="flex bg-[#EEF1F5] rounded-xl p-1 mt-4">
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === m ? 'bg-white text-[#1A1D1F] shadow-sm' : 'text-[#6B7280]'}`}
            >
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              aria-label="Your name"
              className={input}
            />
          )}
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number"
            autoComplete="tel"
            aria-label="Mobile number"
            className={input}
          />
          <div className="flex items-center bg-[#F5F7FA] rounded-xl h-11 px-4 gap-2 border border-transparent focus-within:border-[#1A73E8]">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Password (min. 8 characters)' : 'Password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              aria-label="Password"
              className="flex-1 text-sm text-[#1A1D1F] outline-none bg-transparent"
            />
            <button type="button" aria-label={showPass ? 'Hide password' : 'Show password'} onClick={() => setShowPass((v) => !v)} className="p-1">
              {showPass ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
            </button>
          </div>
          {mode === 'signup' && (
            <input
              type={showPass ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              autoComplete="new-password"
              aria-label="Confirm password"
              className={input}
            />
          )}

          {error && (
            <div role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-2xl text-white font-semibold text-sm transition-opacity"
            style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)', opacity: busy ? 0.7 : 1 }}
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <button
          type="button"
          onClick={close}
          className="w-full mt-3 h-11 rounded-2xl text-sm font-semibold text-[#1A1D1F] bg-[#F5F7FA]"
        >
          Continue without login
        </button>

        <p className="text-center text-xs text-[#6B7280] mt-4">
          Are you a shopkeeper?{' '}
          <button type="button" onClick={goShopkeeper} className="font-semibold text-[#1A73E8]">
            Log in here
          </button>
        </p>
      </motion.div>
    </div>,
    document.body,
  );
}
