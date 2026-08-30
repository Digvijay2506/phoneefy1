import { useState } from 'react';
import { Eye, EyeOff, Store, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useShopkeeperSession } from '@/contexts/ShopkeeperSessionContext';
import { trackShopkeeperLogin } from '@/lib/analytics';

interface ShopkeeperLoginScreenProps {
  onLogin: () => void;
  onBack: () => void;
}

type Step = 'login' | 'change-password';

export default function ShopkeeperLoginScreen({ onLogin, onBack }: ShopkeeperLoginScreenProps) {
  const { loginWithId, completePasswordChange, shop } = useShopkeeperSession();

  const [step, setStep] = useState<Step>('login');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!loginId || !password) {
      setError('Please enter your mobile number / Shop ID and password.');
      return;
    }
    setLoading(true);
    const result = await loginWithId(loginId, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsPasswordChange) {
      setStep('change-password');
      return;
    }
    trackShopkeeperLogin(shop?.name ?? loginId);
    onLogin();
  };

  const handleChangePassword = async () => {
    setError('');
    if (newPw.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await completePasswordChange(newPw);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onLogin();
  };

  if (step === 'change-password') {
    return (
      <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
        <div className="relative flex items-center justify-center pt-14 pb-8 px-6">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #1A7A4A 0%, #0D4A2A 100%)' }}
            >
              <ShieldCheck size={30} color="white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-[#1A1D1F]">Set a New Password</h1>
              <p className="text-sm text-[#6B7280] mt-1 px-4">
                You signed in with a temporary password. Please set your own password to continue.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#1A1D1F] block mb-2">New Password</label>
            <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm border border-[#E5E7EB] h-[50px] px-4">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 8 characters"
                className="flex-1 text-sm text-[#1A1D1F] outline-none bg-transparent"
                autoFocus
              />
              <button onClick={() => setShowNewPw(!showNewPw)} className="p-1">
                {showNewPw ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1A1D1F] block mb-2">Confirm New Password</label>
            <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm border border-[#E5E7EB] h-[50px] px-4">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter new password"
                className="flex-1 text-sm text-[#1A1D1F] outline-none bg-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="btn-tap w-full h-[52px] rounded-2xl text-white font-semibold text-base transition-opacity mt-2"
            style={{ background: 'linear-gradient(135deg, #1A7A4A 0%, #0D4A2A 100%)', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving…' : 'Set Password & Continue'}
          </button>
        </div>

        <div className="h-10" />
      </div>
    );
  }

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div className="relative flex items-center justify-center pt-14 pb-8 px-6">
        <button
          onClick={onBack}
          className="btn-tap absolute left-4 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <ArrowLeft size={20} color="#1A1D1F" />
        </button>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)' }}
          >
            <Store size={30} color="white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#1A1D1F]">Shopkeeper Login</h1>
            <p className="text-sm text-[#6B7280] mt-1">Sign in to manage your shop</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-[#1A1D1F] block mb-2">Mobile Number or Shop ID</label>
          <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm border border-[#E5E7EB] h-[50px] px-4">
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="9876543210 or PHN0001"
              className="flex-1 text-sm text-[#1A1D1F] outline-none bg-transparent"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1A1D1F] block mb-2">Password</label>
          <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm border border-[#E5E7EB] h-[50px] px-4">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="flex-1 text-sm text-[#1A1D1F] outline-none bg-transparent"
            />
            <button onClick={() => setShowPass(!showPass)} className="p-1">
              {showPass
                ? <EyeOff size={18} color="#9CA3AF" />
                : <Eye size={18} color="#9CA3AF" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="pt-2 text-right">
          <span className="text-sm font-medium text-[#9CA3AF]">Forgot password? Contact your admin.</span>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-tap w-full h-[52px] rounded-2xl text-white font-semibold text-base transition-opacity"
          style={{
            background: 'linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>

      <div className="h-10" />
    </div>
  );
}
