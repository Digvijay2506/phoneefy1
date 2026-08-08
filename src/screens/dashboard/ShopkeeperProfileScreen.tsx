import { useState, useEffect } from 'react';
import { Camera, Check, Eye, EyeOff, Shield, Clock, Star, Crown } from 'lucide-react';
import { getProfile, updateProfile, changePassword, subscribeProfile } from '../../store/shopStore';
import type { ShopProfile } from '../../store/shopStore';

interface ShopkeeperProfileScreenProps {
  onNavigateHelp?: () => void;
}

type Tab = 'profile' | 'security';

export default function ShopkeeperProfileScreen({ onNavigateHelp }: ShopkeeperProfileScreenProps) {
  const [profile, setProfile] = useState<ShopProfile>(() => getProfile());
  const [tab, setTab] = useState<Tab>('profile');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile form state
  const [form, setForm] = useState({ ...profile });

  // Security
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);

  useEffect(() => {
    const unsub = subscribeProfile(() => {
      const p = getProfile();
      setProfile(p);
      setForm({ ...p });
    });
    return unsub;
  }, []);

  const handleSaveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      updateProfile(form);
      setSaving(false);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  };

  const handleChangePassword = () => {
    setPassError('');
    if (newPass !== confirmPass) { setPassError('New passwords do not match.'); return; }
    const result = changePassword(currentPass, newPass);
    if (!result.success) { setPassError(result.error ?? 'Error'); return; }
    setPassSaved(true);
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setTimeout(() => setPassSaved(false), 3000);
  };

  const update = (key: keyof ShopProfile, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const inputClass = 'w-full h-11 bg-[#F5F7FA] rounded-xl px-4 text-sm text-[#1A1D1F] outline-none border border-transparent focus:border-[#1A73E8] disabled:text-[#9CA3AF]';

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div
        className="px-4 pt-12 pb-5"
        style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #1A3A5C 100%)' }}
      >
        <div className="flex flex-col items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}
            >
              {profile.shopName.charAt(0)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1A73E8] flex items-center justify-center border-2 border-[#0D1B2A]">
              <Camera size={13} color="white" />
            </button>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-lg font-bold text-white">{profile.shopName}</h1>
              {profile.verified && (
                <div className="flex items-center gap-1 bg-[#1A7A4A]/30 px-2 py-0.5 rounded-full">
                  <Shield size={10} color="#4ADE80" />
                  <span className="text-[9px] font-bold text-[#4ADE80]">Verified</span>
                </div>
              )}
            </div>
            <p className="text-xs text-white/60 mt-0.5">{profile.ownerName}</p>
          </div>
          <div className="flex gap-4 mt-1">
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Star size={12} fill="#FCD34D" color="#FCD34D" />
                <span className="text-sm font-bold text-white">{profile.rating}</span>
              </div>
              <p className="text-[10px] text-white/50">Rating</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Crown size={12} color="#FCD34D" />
                <span className="text-sm font-bold text-white">{profile.plan}</span>
              </div>
              <p className="text-[10px] text-white/50">Plan</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Clock size={12} color="rgba(255,255,255,0.5)" />
                <span className="text-sm font-bold text-white">{profile.memberSince.split(' ')[1]}</span>
              </div>
              <p className="text-[10px] text-white/50">Since</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="sticky top-0 z-10 px-4 pt-3 pb-2"
        style={{ background: 'rgba(245,247,250,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E7EB' }}
      >
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-[#E5E7EB]">
          {([
            { key: 'profile', label: 'Shop Info' },
            { key: 'security', label: 'Security' },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: tab === t.key ? '#1A73E8' : 'transparent', color: tab === t.key ? 'white' : '#6B7280' }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 pb-24 space-y-4">
        {/* Profile Tab */}
        {tab === 'profile' && (
          <>
            {[
              { label: 'Shop Name', key: 'shopName' as keyof ShopProfile },
              { label: 'Owner Name', key: 'ownerName' as keyof ShopProfile },
              { label: 'Email', key: 'email' as keyof ShopProfile },
              { label: 'Mobile', key: 'mobile' as keyof ShopProfile },
              { label: 'Address', key: 'address' as keyof ShopProfile },
              { label: 'City', key: 'city' as keyof ShopProfile },
              { label: 'State', key: 'state' as keyof ShopProfile },
              { label: 'Business Days', key: 'businessDays' as keyof ShopProfile },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5 block">{label}</label>
                <input
                  value={String(form[key] ?? '')}
                  onChange={(e) => update(key, e.target.value)}
                  disabled={!editing}
                  className={inputClass}
                />
              </div>
            ))}

            {/* Business Hours */}
            <div>
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5 block">Business Hours</label>
              <div className="flex gap-2 items-center">
                <input
                  type="time"
                  value={form.businessHoursOpen}
                  onChange={(e) => update('businessHoursOpen', e.target.value)}
                  disabled={!editing}
                  className={`flex-1 ${inputClass}`}
                />
                <span className="text-sm text-[#9CA3AF]">to</span>
                <input
                  type="time"
                  value={form.businessHoursClose}
                  onChange={(e) => update('businessHoursClose', e.target.value)}
                  disabled={!editing}
                  className={`flex-1 ${inputClass}`}
                />
              </div>
            </div>

            {/* Edit / Save buttons */}
            <div className="pt-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-tap w-full h-12 rounded-2xl text-[#1A73E8] font-semibold text-sm bg-[rgba(26,115,232,0.08)]"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setEditing(false); setForm({ ...profile }); }}
                    className="flex-1 h-12 rounded-2xl text-sm font-semibold text-[#6B7280] bg-[#F5F7FA]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-tap flex-1 h-12 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                    style={{ background: '#1A73E8', opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Saving…' : saved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#1A1D1F]">Change Password</h3>

              {[
                { label: 'Current Password', val: currentPass, setter: setCurrentPass, show: showCurrentPass, toggle: setShowCurrentPass },
                { label: 'New Password', val: newPass, setter: setNewPass, show: showNewPass, toggle: setShowNewPass },
                { label: 'Confirm New Password', val: confirmPass, setter: setConfirmPass, show: showNewPass, toggle: setShowNewPass },
              ].map(({ label, val, setter, show, toggle }) => (
                <div key={label}>
                  <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">{label}</label>
                  <div className="flex items-center bg-[#F5F7FA] rounded-xl h-11 px-4 gap-2 border border-transparent focus-within:border-[#1A73E8]">
                    <input
                      type={show ? 'text' : 'password'}
                      value={val}
                      onChange={(e) => setter(e.target.value)}
                      placeholder="••••••"
                      className="flex-1 text-sm text-[#1A1D1F] outline-none bg-transparent"
                    />
                    <button onClick={() => toggle((v: boolean) => !v)} className="p-1">
                      {show ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
                    </button>
                  </div>
                </div>
              ))}

              {passError && (
                <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{passError}</div>
              )}
              {passSaved && (
                <div className="text-xs text-[#1A7A4A] bg-[rgba(26,122,74,0.1)] rounded-xl px-3 py-2 flex items-center gap-2">
                  <Check size={13} color="#1A7A4A" /> Password updated successfully!
                </div>
              )}

              <button
                onClick={handleChangePassword}
                className="btn-tap w-full h-12 rounded-2xl text-sm font-semibold text-white"
                style={{ background: '#1A73E8' }}
              >
                Update Password
              </button>
            </div>

            {/* Help Link */}
            {onNavigateHelp && (
              <button
                onClick={onNavigateHelp}
                className="btn-tap w-full bg-white rounded-2xl shadow-sm p-4 text-left flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-[#1A1D1F]">Help & Support</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">FAQs, contact us, report a problem</p>
                </div>
                <span className="text-[#1A73E8]">→</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
