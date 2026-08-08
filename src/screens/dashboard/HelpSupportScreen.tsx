import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, Phone, Flag, Info, Mail, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface HelpSupportScreenProps {
  onBack: () => void;
}

const FAQs = [
  {
    q: 'How do I add a new phone to my inventory?',
    a: 'Go to the Inventory tab and tap the "+" button in the top right corner. Fill in the phone details such as brand, model, price, condition, and IMEI number, then tap Save.',
  },
  {
    q: 'How does IMEI verification work?',
    a: 'When you add a phone with its IMEI number, Phoneefy cross-checks it against our database. Verified phones get a green IMEI Verified badge visible to buyers, which significantly increases trust and buyer inquiries.',
  },
  {
    q: 'What happens when I mark a phone as sold?',
    a: 'The phone moves to Sold Inventory with a 24-hour countdown. During this time you can restore it (if the sale falls through) or permanently delete it. After 24 hours it is auto-deleted from Sold Inventory.',
  },
  {
    q: 'How do I upgrade my subscription plan?',
    a: 'Go to the Subscription tab in the dashboard. You\'ll see all available plans. Tap "Choose Plan" on the plan you want to upgrade to and follow the payment steps.',
  },
  {
    q: 'Can I create discount offers for my shop?',
    a: 'Yes! Go to Dashboard → tap the Offers quick action. You can create percentage discounts, flat-rate discounts, or festival-themed offers with custom start and end dates.',
  },
  {
    q: 'How do I contact a buyer who showed interest?',
    a: 'Check your Analytics screen to see WhatsApp and Call click counts per listing. Buyers initiate contact directly through WhatsApp or phone call from your listing — you\'ll receive those calls and messages on your registered mobile.',
  },
  {
    q: 'How many listings can I have on the Basic plan?',
    a: 'The Basic plan allows up to 10 active listings. The Pro plan allows up to 50, and the Premium plan allows unlimited listings.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-[#1A1D1F] leading-snug">{q}</span>
        {open
          ? <ChevronUp size={18} color="#1A73E8" className="flex-shrink-0" />
          : <ChevronDown size={18} color="#9CA3AF" className="flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-[#6B7280] leading-relaxed border-t border-[#F5F7FA] pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function HelpSupportScreen({ onBack }: HelpSupportScreenProps) {
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
        <div>
          <h1 className="text-lg font-bold text-[#1A1D1F]">Help & Support</h1>
          <p className="text-xs text-[#6B7280]">We're here to help</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {/* Hero */}
        <div className="mx-4 mt-4 rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)' }}
        >
          <h2 className="text-base font-bold">How can we help you?</h2>
          <p className="text-xs text-white/70 mt-1">Browse FAQs or reach out directly — our team is here 9 AM – 6 PM, Mon–Sat.</p>
        </div>

        {/* Quick Actions */}
        <div className="px-4 mt-4 grid grid-cols-2 gap-3">
          {[
            { icon: MessageCircle, label: 'Chat Support', sub: 'WhatsApp us', color: '#25D366', bg: 'rgba(37,211,102,0.1)', action: () => window.open('https://wa.me/919876543210') },
            { icon: Phone, label: 'Call Support', sub: '+91 98765 43210', color: '#1A73E8', bg: 'rgba(26,115,232,0.1)', action: () => window.open('tel:+919876543210') },
            { icon: Mail, label: 'Email Us', sub: 'support@phoneefy.com', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', action: () => window.open('mailto:support@phoneefy.com') },
            { icon: Flag, label: 'Report Problem', sub: 'Something went wrong?', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', action: () => {} },
          ].map(({ icon: Icon, label, sub, color, bg, action }) => (
            <button
              key={label}
              onClick={action}
              className="btn-tap bg-white rounded-2xl p-4 text-left shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5" style={{ background: bg }}>
                <Icon size={20} color={color} />
              </div>
              <p className="text-sm font-bold text-[#1A1D1F]">{label}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">{sub}</p>
            </button>
          ))}
        </div>

        {/* FAQ */}
        <div className="px-4 mt-5">
          <h2 className="text-sm font-bold text-[#1A1D1F] mb-3">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* About Phoneefy */}
        <div className="px-4 mt-5">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(26,115,232,0.1)] flex items-center justify-center">
                <Info size={20} color="#1A73E8" />
              </div>
              <h3 className="text-sm font-bold text-[#1A1D1F]">About Phoneefy</h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Phoneefy is India's trusted marketplace for pre-owned smartphones. We connect verified shopkeepers with local buyers through an easy, transparent, and secure platform. Every listing on Phoneefy is from a real physical shop.
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              {[
                { label: 'Version', value: '1.0.0' },
                { label: 'Build', value: '2026.08' },
                { label: 'Terms', value: 'View →' },
                { label: 'Privacy Policy', value: 'View →' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#F5F7FA] last:border-0">
                  <span className="text-xs text-[#9CA3AF]">{label}</span>
                  <span className="text-xs font-medium text-[#1A73E8]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
