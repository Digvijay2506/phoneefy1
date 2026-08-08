import { Check, Crown, Calendar, Receipt, Download, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { plans } from '../../dashboard-data';

interface SubscriptionScreenProps {
  onBack?: () => void;
}

const paymentHistory = [
  { id: 'pay-1', plan: 'Pro Plan', amount: 999, date: 'Dec 1, 2025', method: 'UPI', status: 'success', invoice: 'INV-2025-120' },
  { id: 'pay-2', plan: 'Pro Plan', amount: 999, date: 'Nov 1, 2025', method: 'UPI', status: 'success', invoice: 'INV-2025-110' },
  { id: 'pay-3', plan: 'Pro Plan', amount: 999, date: 'Oct 1, 2025', method: 'Card', status: 'success', invoice: 'INV-2025-100' },
  { id: 'pay-4', plan: 'Basic Plan', amount: 499, date: 'Sep 1, 2025', method: 'UPI', status: 'success', invoice: 'INV-2025-090' },
  { id: 'pay-5', plan: 'Basic Plan', amount: 499, date: 'Aug 1, 2025', method: 'UPI', status: 'failed', invoice: 'INV-2025-080' },
];

type Tab = 'plans' | 'history' | 'invoices';

export default function SubscriptionScreen({ onBack }: SubscriptionScreenProps) {
  const [tab, setTab] = useState<Tab>('plans');
  const [confirmPlan, setConfirmPlan] = useState<string | null>(null);

  const currentPlan = plans.find((p) => p.isCurrent);

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div
        className="px-4 pt-12 pb-5"
        style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #1A3A5C 100%)' }}
      >
        {onBack && (
          <button onClick={onBack} className="btn-tap w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <ArrowLeft size={20} color="white" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
            <Crown size={24} color="#FCD34D" />
          </div>
          <div>
            <p className="text-xs text-white/60">Current Plan</p>
            <h1 className="text-lg font-bold text-white">{currentPlan?.name} Plan</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Calendar size={13} color="rgba(255,255,255,0.5)" />
          <p className="text-xs text-white/50">Expires Dec 31, 2026</p>
          <span className="ml-auto px-2.5 py-1 rounded-full bg-[#1A7A4A]/30 text-[#4ADE80] text-[10px] font-bold">ACTIVE</span>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="sticky top-0 z-10 px-4 pt-3 pb-2"
        style={{ background: 'rgba(245,247,250,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E7EB' }}
      >
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-[#E5E7EB]">
          {([
            { key: 'plans', label: 'Plans' },
            { key: 'history', label: 'Payments' },
            { key: 'invoices', label: 'Invoices' },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: tab === t.key ? '#1A73E8' : 'transparent',
                color: tab === t.key ? 'white' : '#6B7280',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 pb-24">
        {/* Plans Tab */}
        {tab === 'plans' && (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                style={{
                  border: plan.isCurrent ? '2px solid #1A73E8' : plan.recommended ? '2px solid transparent' : 'none',
                  boxShadow: plan.recommended && !plan.isCurrent ? '0 0 0 2px #F59E0B' : undefined,
                }}
              >
                {plan.recommended && (
                  <div className="h-1.5" style={{ background: plan.isCurrent ? '#1A73E8' : 'linear-gradient(90deg, #F59E0B, #EF4444)' }} />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#1A1D1F]">{plan.name}</h3>
                        {plan.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-[rgba(26,115,232,0.1)] text-[#1A73E8] text-[10px] font-bold">
                            CURRENT
                          </span>
                        )}
                        {plan.recommended && !plan.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-bold text-[#1A1D1F]">₹{plan.price}</span>
                        <span className="text-sm text-[#6B7280]">/{plan.period}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[rgba(26,122,74,0.1)] flex items-center justify-center flex-shrink-0">
                          <Check size={11} color="#1A7A4A" strokeWidth={3} />
                        </div>
                        <span className="text-xs text-[#6B7280]">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {!plan.isCurrent && (
                    <button
                      onClick={() => setConfirmPlan(plan.name)}
                      className="btn-tap mt-4 w-full h-11 rounded-2xl text-sm font-semibold"
                      style={{
                        background: plan.price > (currentPlan?.price ?? 0)
                          ? 'linear-gradient(135deg, #1A73E8, #0D47A1)'
                          : '#F5F7FA',
                        color: plan.price > (currentPlan?.price ?? 0) ? 'white' : '#6B7280',
                      }}
                    >
                      {plan.price > (currentPlan?.price ?? 0) ? `Upgrade to ${plan.name}` : `Downgrade to ${plan.name}`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment History Tab */}
        {tab === 'history' && (
          <div className="space-y-3">
            {paymentHistory.map((pay) => (
              <div key={pay.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: pay.status === 'success' ? 'rgba(26,122,74,0.1)' : 'rgba(239,68,68,0.1)' }}
                >
                  <Receipt size={18} color={pay.status === 'success' ? '#1A7A4A' : '#EF4444'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1D1F]">{pay.plan}</p>
                  <p className="text-xs text-[#6B7280]">{pay.date} · {pay.method}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#1A1D1F]">₹{pay.amount}</p>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: pay.status === 'success' ? 'rgba(26,122,74,0.1)' : 'rgba(239,68,68,0.1)',
                      color: pay.status === 'success' ? '#1A7A4A' : '#EF4444',
                    }}
                  >
                    {pay.status === 'success' ? 'Paid' : 'Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoices Tab */}
        {tab === 'invoices' && (
          <div className="space-y-3">
            {paymentHistory.filter((p) => p.status === 'success').map((pay) => (
              <div key={pay.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(26,115,232,0.1)] flex items-center justify-center flex-shrink-0">
                  <Receipt size={18} color="#1A73E8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1D1F]">{pay.invoice}</p>
                  <p className="text-xs text-[#6B7280]">{pay.date} · {pay.plan}</p>
                </div>
                <button className="btn-tap w-9 h-9 rounded-xl bg-[rgba(26,115,232,0.08)] flex items-center justify-center">
                  <Download size={16} color="#1A73E8" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade Confirm Modal */}
      {confirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px]">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
              <Crown size={22} color="#F59E0B" />
            </div>
            <h2 className="text-base font-bold text-[#1A1D1F] text-center">Switch to {confirmPlan}?</h2>
            <p className="text-sm text-[#6B7280] text-center mt-2">
              You'll be redirected to the payment gateway to complete the switch.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmPlan(null)} className="flex-1 h-11 rounded-2xl text-sm font-semibold text-[#1A1D1F] bg-[#F5F7FA]">
                Cancel
              </button>
              <button
                onClick={() => setConfirmPlan(null)}
                className="flex-1 h-11 rounded-2xl text-sm font-semibold text-white"
                style={{ background: '#1A73E8' }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
