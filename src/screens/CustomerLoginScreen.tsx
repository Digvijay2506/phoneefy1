import { useState } from 'react';
import { Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import { useCustomerSession } from '@/contexts/CustomerSessionContext';
import { trackCustomerSignup, trackCustomerLogin } from '@/lib/analytics';

interface CustomerLoginScreenProps {
  onDone: () => void;
  onBack: () => void;
}

type Mode = 'login' | 'signup';

export default function CustomerLoginScreen({ onDone, onBack }: CustomerLoginScreenProps) {
  const { login, signUp } = useCustomerSession();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!phone.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setLoading(true);
      const result = await signUp(name, phone, password);
      setLoading(false);
      if (result.error) { setError(result.error); return; }
      trackCustomerSignup();
      onDone();
      return;
    }

    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    trackCustomerLogin();
    onDone();
  };

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
            <User size={30} color="white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#1A1D1F]">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {mode === 'login' ? 'Sign in to continue' : 'Sign up to save favourites & track offers'}
            </p>
          </div>
        </div>
      </div>

      {/* Mode switcher */}
      <div className="px-6">
        <div className="flex bg-[#EEF1F5] rounded-xl p-1">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'login' ? 'bg-white text-[#1A1D1F] shadow-sm' : 'text-[#6B7280]'}`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-[#1A1D1F] shadow-sm' : 'text-[#6B7280]'}`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-5 space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="text-sm font-semibold text-[#1A1D1F] block mb-2">Full Name</label>
            <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm border border-[#E5E7EB] h-[50px] px-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1 text-sm text-[#1A1D1F] outline-none bg-transparent"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-semibold text-[#1A1D1F] block mb-2">Mobile Number</label>
          <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm border border-[#E5E7EB] h-[50px] px-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
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
              placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Enter your password'}
              className="flex-1 text-sm text-[#1A1D1F] outline-none bg-transparent"
            />
            <button onClick={() => setShowPass(!showPass)} className="p-1">
              {showPass ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
            </button>
          </div>
        </div>

        {mode === 'signup' && (
          <div>
            <label className="text-sm font-semibold text-[#1A1D1F] block mb-2">Confirm Password</label>
            <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm border border-[#E5E7EB] h-[50px] px-4">
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="flex-1 text-sm text-[#1A1D1F] outline-none bg-transparent"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-tap w-full h-[52px] rounded-2xl text-white font-semibold text-base transition-opacity mt-2"
          style={{
            background: 'linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </div>

      <div className="h-10" />
    </div>
  );
}
