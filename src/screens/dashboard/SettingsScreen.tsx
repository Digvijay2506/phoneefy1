import { useState } from 'react';
import {
  ArrowLeft, Moon, Globe, Bell, Lock, Shield, LogOut,
  ChevronRight, Sun, Check,
} from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

type Language = 'English' | 'हिन्दी' | 'मराठी' | 'తెలుగు' | 'தமிழ்';
const LANGUAGES: Language[] = ['English', 'हिन्दी', 'मराठी', 'తెలుగు', 'தமிழ்'];

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-12 h-6 rounded-full transition-all duration-300 flex items-center"
      style={{ background: value ? '#1A73E8' : '#D1D5DB', padding: '2px' }}
    >
      <div
        className="w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300"
        style={{ transform: value ? 'translateX(24px)' : 'translateX(0)' }}
      />
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider px-4 mt-5 mb-2">
      {label}
    </p>
  );
}

export default function SettingsScreen({ onBack, onLogout }: SettingsScreenProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('English');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [notifLeads, setNotifLeads] = useState(true);
  const [notifSold, setNotifSold] = useState(true);
  const [notifOffers, setNotifOffers] = useState(true);
  const [notifSubscription, setNotifSubscription] = useState(true);
  const [notifInventory, setNotifInventory] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const settingsRow = (
    label: string,
    icon: React.ReactNode,
    right: React.ReactNode,
    onClick?: () => void
  ) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-3.5 px-4 py-4 bg-white border-b border-[#F5F7FA] ${onClick ? 'cursor-pointer' : ''}`}
    >
      {icon}
      <span className="flex-1 text-sm font-medium text-[#1A1D1F]">{label}</span>
      {right}
    </div>
  );

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-12 pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(245,247,250,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E7EB' }}
      >
        <button onClick={onBack} className="btn-tap w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <ArrowLeft size={20} color="#1A1D1F" />
        </button>
        <h1 className="text-lg font-bold text-[#1A1D1F]">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
        {/* Appearance */}
        <SectionHeader label="Appearance" />
        <div className="rounded-2xl overflow-hidden mx-4 shadow-sm">
          {settingsRow(
            'Dark Mode',
            <div className="w-9 h-9 rounded-xl bg-[rgba(26,115,232,0.1)] flex items-center justify-center">
              {darkMode ? <Moon size={18} color="#1A73E8" /> : <Sun size={18} color="#1A73E8" />}
            </div>,
            <ToggleSwitch value={darkMode} onChange={setDarkMode} />
          )}
        </div>

        {/* Language */}
        <SectionHeader label="Language" />
        <div className="rounded-2xl overflow-hidden mx-4 shadow-sm">
          {settingsRow(
            'App Language',
            <div className="w-9 h-9 rounded-xl bg-[rgba(26,115,232,0.1)] flex items-center justify-center">
              <Globe size={18} color="#1A73E8" />
            </div>,
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-[#6B7280]">{language}</span>
              <ChevronRight size={16} color="#9CA3AF" />
            </div>,
            () => setShowLanguagePicker(true)
          )}
        </div>

        {/* Notifications */}
        <SectionHeader label="Notifications" />
        <div className="rounded-2xl overflow-hidden mx-4 shadow-sm">
          {settingsRow(
            'New Leads',
            <div className="w-9 h-9 rounded-xl bg-[rgba(26,115,232,0.1)] flex items-center justify-center">
              <Bell size={18} color="#1A73E8" />
            </div>,
            <ToggleSwitch value={notifLeads} onChange={setNotifLeads} />
          )}
          {settingsRow(
            'Sold Alerts',
            <div className="w-9 h-9 rounded-xl bg-[rgba(26,122,74,0.1)] flex items-center justify-center">
              <Bell size={18} color="#1A7A4A" />
            </div>,
            <ToggleSwitch value={notifSold} onChange={setNotifSold} />
          )}
          {settingsRow(
            'Offer Expiry',
            <div className="w-9 h-9 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
              <Bell size={18} color="#8B5CF6" />
            </div>,
            <ToggleSwitch value={notifOffers} onChange={setNotifOffers} />
          )}
          {settingsRow(
            'Subscription Reminders',
            <div className="w-9 h-9 rounded-xl bg-[rgba(245,158,11,0.1)] flex items-center justify-center">
              <Bell size={18} color="#F59E0B" />
            </div>,
            <ToggleSwitch value={notifSubscription} onChange={setNotifSubscription} />
          )}
          {settingsRow(
            'Inventory Reminders',
            <div className="w-9 h-9 rounded-xl bg-[rgba(239,68,68,0.1)] flex items-center justify-center">
              <Bell size={18} color="#EF4444" />
            </div>,
            <ToggleSwitch value={notifInventory} onChange={setNotifInventory} />
          )}
        </div>

        {/* Security */}
        <SectionHeader label="Security" />
        <div className="rounded-2xl overflow-hidden mx-4 shadow-sm">
          {settingsRow(
            'Two-Factor Authentication',
            <div className="w-9 h-9 rounded-xl bg-[rgba(26,115,232,0.1)] flex items-center justify-center">
              <Lock size={18} color="#1A73E8" />
            </div>,
            <ToggleSwitch value={twoFactor} onChange={setTwoFactor} />
          )}
          {settingsRow(
            'Biometric Login',
            <div className="w-9 h-9 rounded-xl bg-[rgba(26,122,74,0.1)] flex items-center justify-center">
              <Shield size={18} color="#1A7A4A" />
            </div>,
            <ToggleSwitch value={biometrics} onChange={setBiometrics} />
          )}
        </div>

        {/* Privacy */}
        <SectionHeader label="Privacy" />
        <div className="rounded-2xl overflow-hidden mx-4 shadow-sm">
          {settingsRow(
            'Privacy Policy',
            <div className="w-9 h-9 rounded-xl bg-[#F5F7FA] flex items-center justify-center">
              <Shield size={18} color="#6B7280" />
            </div>,
            <ChevronRight size={16} color="#9CA3AF" />,
            () => {}
          )}
          {settingsRow(
            'Terms of Service',
            <div className="w-9 h-9 rounded-xl bg-[#F5F7FA] flex items-center justify-center">
              <Shield size={18} color="#6B7280" />
            </div>,
            <ChevronRight size={16} color="#9CA3AF" />,
            () => {}
          )}
        </div>

        {/* Logout */}
        <div className="px-4 mt-5">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="btn-tap w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-red-500 bg-red-50 border border-red-200"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-5">Phoneefy v1.0.0 · Build 2026.08</p>
      </div>

      {/* Language Picker Modal */}
      {showLanguagePicker && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-5 pb-8">
            <h2 className="text-base font-bold text-[#1A1D1F] mb-4">Select Language</h2>
            <div className="space-y-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setShowLanguagePicker(false); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#F5F7FA] text-sm font-medium text-[#1A1D1F]"
                >
                  {lang}
                  {language === lang && <Check size={16} color="#1A73E8" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px]">
            <h2 className="text-base font-bold text-[#1A1D1F] text-center">Sign Out?</h2>
            <p className="text-sm text-[#6B7280] text-center mt-2">You will be signed out from your shopkeeper account.</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-11 rounded-2xl text-sm font-semibold text-[#1A1D1F] bg-[#F5F7FA]"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="flex-1 h-11 rounded-2xl text-sm font-semibold text-white bg-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
