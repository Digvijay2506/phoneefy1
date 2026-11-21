import { useRef, useState } from 'react';
import { Camera, Check, Eye, EyeOff, Shield, Clock, Crown, Store, MapPin, Navigation, Loader2, Package } from 'lucide-react';
import { useShopkeeperSession } from '@/contexts/ShopkeeperSessionContext';
import { supabase, uploadPhoneImage } from '@/lib/supabaseClient';
import { getProfile, updateProfile } from '../../store/shopStore';

interface ShopkeeperProfileScreenProps {
  onNavigateHelp?: () => void;
}

type Tab = 'profile' | 'security';

/** Turns a database error into something a shopkeeper can act on. */
function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e);
  if (/cover_image_url|latitude|longitude|schema cache|column/i.test(msg)) {
    return 'Shop photos need a one-time update on the server. Please ask the Phoneefy admin to finish the setup, then try again.';
  }
  if (/row-level security|permission|not authorized/i.test(msg)) {
    return 'You are not allowed to change this. Please log in again.';
  }
  return msg || 'Something went wrong. Please try again.';
}

export default function ShopkeeperProfileScreen({ onNavigateHelp }: ShopkeeperProfileScreenProps) {
  const { shop, refreshShop, completePasswordChange } = useShopkeeperSession();

  const [tab, setTab] = useState<Tab>('profile');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Real shop details (saved to the database) + business hours/days (not stored on the server yet)
  const extras = getProfile();
  const fromShop = () => ({
    shopName: shop?.name ?? '',
    ownerName: shop?.owner ?? '',
    email: shop?.email ?? '',
    address: shop?.address ?? '',
    city: shop?.city ?? '',
    state: shop?.state ?? '',
    businessDays: extras.businessDays,
    businessHoursOpen: extras.businessHoursOpen,
    businessHoursClose: extras.businessHoursClose,
  });
  const [form, setForm] = useState(fromShop);

  // Photos + location
  const coverInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [locBusy, setLocBusy] = useState(false);
  const [locError, setLocError] = useState('');

  // Security
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);
  const [passBusy, setPassBusy] = useState(false);

  if (!shop) return null;

  const verified = shop.status === 'Verified';
  const since = shop.created_at ? new Date(shop.created_at).getFullYear() : '';
  const hasLocation = typeof shop.latitude === 'number' && typeof shop.longitude === 'number';

  const uploadPhoto = async (file: File | undefined, kind: 'cover' | 'logo') => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose a photo (JPG or PNG).');
      return;
    }
    const setBusy = kind === 'cover' ? setUploadingCover : setUploadingLogo;
    setBusy(true);
    setPhotoError('');
    try {
      const url = await uploadPhoneImage(shop.id, file); // also shrinks the photo so it loads fast
      const column = kind === 'cover' ? 'cover_image_url' : 'avatar_url';
      const { error } = await supabase.from('shops').update({ [column]: url }).eq('id', shop.id);
      if (error) throw error;
      await refreshShop();
    } catch (e) {
      setPhotoError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSetLocation = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setLocError('This browser cannot share your location.');
      return;
    }
    setLocBusy(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { error } = await supabase
            .from('shops')
            .update({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
            .eq('id', shop.id);
          if (error) throw error;
          await refreshShop();
        } catch (e) {
          setLocError(friendlyError(e));
        } finally {
          setLocBusy(false);
        }
      },
      (err) => {
        setLocError(
          err.code === 1
            ? 'Location is blocked. Allow location for this site in your browser settings, then try again.'
            : 'Could not find your location. Try again near a window or outdoors.',
        );
        setLocBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const handleSaveProfile = async () => {
    setSaveError('');
    if (!form.shopName.trim() || !form.ownerName.trim()) {
      setSaveError('Shop name and owner name cannot be empty.');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('shops')
      .update({
        name: form.shopName.trim(),
        owner: form.ownerName.trim(),
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
      })
      .eq('id', shop.id);
    if (error) {
      setSaving(false);
      setSaveError(friendlyError(error));
      return;
    }
    updateProfile({
      businessDays: form.businessDays,
      businessHoursOpen: form.businessHoursOpen,
      businessHoursClose: form.businessHoursClose,
    });
    await refreshShop();
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    setPassError('');
    if (!currentPass) { setPassError('Enter your current password.'); return; }
    if (newPass.length < 8) { setPassError('New password must be at least 8 characters.'); return; }
    if (newPass !== confirmPass) { setPassError('New passwords do not match.'); return; }
    setPassBusy(true);
    // Check the current password is right before changing it
    const { data: u } = await supabase.auth.getUser();
    const email = u.user?.email;
    if (!email) { setPassBusy(false); setPassError('Please log in again.'); return; }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPass });
    if (signInError) { setPassBusy(false); setPassError('Current password is incorrect.'); return; }
    const result = await completePasswordChange(newPass);
    setPassBusy(false);
    if (result.error) { setPassError(result.error); return; }
    setPassSaved(true);
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setTimeout(() => setPassSaved(false), 3000);
  };

  const update = (key: keyof typeof form, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const inputClass = 'w-full h-11 bg-[#F5F7FA] rounded-xl px-4 text-sm text-[#1A1D1F] outline-none border border-transparent focus:border-[#1A73E8] disabled:text-[#9CA3AF]';

  const fields: { label: string; key: keyof typeof form }[] = [
    { label: 'Shop Name', key: 'shopName' },
    { label: 'Owner Name', key: 'ownerName' },
    { label: 'Email', key: 'email' },
    { label: 'Address', key: 'address' },
    { label: 'City', key: 'city' },
    { label: 'State', key: 'state' },
    { label: 'Business Days', key: 'businessDays' },
  ];

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-12 pb-5" style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #1A3A5C 100%)' }}>
        {shop.cover_image_url && (
          <>
            <img src={shop.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,27,42,0.5) 0%, rgba(13,27,42,0.92) 100%)' }} />
          </>
        )}
        <div className="relative flex flex-col items-center gap-3">
          {/* Logo */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}
            >
              {shop.avatar_url ? <img src={shop.avatar_url} alt="Shop logo" className="w-full h-full object-cover" /> : shop.name.charAt(0)}
              {uploadingLogo && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 size={20} color="white" className="animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Change shop logo"
              onClick={() => logoInput.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1A73E8] flex items-center justify-center border-2 border-[#0D1B2A]"
            >
              <Camera size={13} color="white" />
            </button>
            <input
              ref={logoInput}
              data-testid="logo-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { uploadPhoto(e.target.files?.[0], 'logo'); e.target.value = ''; }}
            />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-lg font-bold text-white">{shop.name}</h1>
              {verified && (
                <div className="flex items-center gap-1 bg-[#1A7A4A]/30 px-2 py-0.5 rounded-full">
                  <Shield size={10} color="#4ADE80" />
                  <span className="text-[9px] font-bold text-[#4ADE80]">Verified</span>
                </div>
              )}
            </div>
            <p className="text-xs text-white/60 mt-0.5">{shop.owner}</p>
          </div>
          <div className="flex gap-4 mt-1">
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Package size={12} color="rgba(255,255,255,0.6)" />
                <span className="text-sm font-bold text-white">{shop.total_listings}</span>
              </div>
              <p className="text-[10px] text-white/50">Listings</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Crown size={12} color="#FCD34D" />
                <span className="text-sm font-bold text-white">{shop.subscription}</span>
              </div>
              <p className="text-[10px] text-white/50">Plan</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Clock size={12} color="rgba(255,255,255,0.5)" />
                <span className="text-sm font-bold text-white">{since}</span>
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
            {/* Shop photo + location (what customers see on the home page) */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative h-36 bg-gradient-to-br from-[#1A3A5C] to-[#0D1B2A] flex items-center justify-center">
                {shop.cover_image_url ? (
                  <img src={shop.cover_image_url} alt="Your shop" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center px-6">
                    <Store size={28} color="rgba(255,255,255,0.4)" className="mx-auto" />
                    <p className="text-xs text-white/60 mt-2">No shop photo yet</p>
                  </div>
                )}
                {uploadingCover && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={24} color="white" className="animate-spin" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-bold text-[#1A1D1F]">Shop photo</p>
                  <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                    A clear photo of your shop front. Customers see it on the home page under “Shops Near You”. A wide (landscape) photo looks best.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => coverInput.current?.click()}
                  disabled={uploadingCover}
                  className="btn-tap w-full h-11 rounded-2xl text-[#1A73E8] font-semibold text-sm bg-[rgba(26,115,232,0.08)] flex items-center justify-center gap-2"
                >
                  <Camera size={16} /> {uploadingCover ? 'Uploading…' : shop.cover_image_url ? 'Change shop photo' : 'Add shop photo'}
                </button>
                <input
                  ref={coverInput}
                  data-testid="cover-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { uploadPhoto(e.target.files?.[0], 'cover'); e.target.value = ''; }}
                />
                {photoError && (
                  <div role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{photoError}</div>
                )}

                <div className="border-t border-[#F1F3F7] pt-3">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} color={hasLocation ? '#1A7A4A' : '#9CA3AF'} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1A1D1F]">Shop location</p>
                      <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                        {hasLocation
                          ? 'Saved. Customers nearby will see how far you are and can get directions.'
                          : 'Not set. Stand inside your shop, tap the button below and allow location, so nearby customers can find you.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSetLocation}
                    disabled={locBusy}
                    className="btn-tap mt-3 w-full h-11 rounded-2xl text-[#1A73E8] font-semibold text-sm bg-[rgba(26,115,232,0.08)] flex items-center justify-center gap-2"
                  >
                    {locBusy ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                    {locBusy ? 'Finding your location…' : hasLocation ? 'Update my shop location' : 'Set my shop location'}
                  </button>
                  {locError && (
                    <div role="alert" className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{locError}</div>
                  )}
                </div>
              </div>
            </div>

            {fields.map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5 block">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  disabled={!editing}
                  className={inputClass}
                />
              </div>
            ))}

            {/* Mobile = login ID, so it can't be edited here */}
            <div>
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5 block">Mobile (your login)</label>
              <input value={shop.phone} disabled className={inputClass} />
              <p className="text-[11px] text-[#9CA3AF] mt-1">To change your login number, contact the Phoneefy admin.</p>
            </div>

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

            {saveError && (
              <div role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{saveError}</div>
            )}

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
                    onClick={() => { setEditing(false); setForm(fromShop()); setSaveError(''); }}
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
                { label: 'New Password (min. 8 characters)', val: newPass, setter: setNewPass, show: showNewPass, toggle: setShowNewPass },
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
                    <button type="button" onClick={() => toggle((v: boolean) => !v)} className="p-1">
                      {show ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
                    </button>
                  </div>
                </div>
              ))}

              {passError && (
                <div role="alert" className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{passError}</div>
              )}
              {passSaved && (
                <div className="text-xs text-[#1A7A4A] bg-[rgba(26,122,74,0.1)] rounded-xl px-3 py-2 flex items-center gap-2">
                  <Check size={13} color="#1A7A4A" /> Password updated successfully!
                </div>
              )}

              <button
                onClick={handleChangePassword}
                disabled={passBusy}
                className="btn-tap w-full h-12 rounded-2xl text-sm font-semibold text-white"
                style={{ background: '#1A73E8', opacity: passBusy ? 0.7 : 1 }}
              >
                {passBusy ? 'Updating…' : 'Update Password'}
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
