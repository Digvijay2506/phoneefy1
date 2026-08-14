import { useState } from 'react';
import { ArrowLeft, Plus, Tag, Percent, IndianRupee, PartyPopper, Trash2, Clock, CheckCircle2, X } from 'lucide-react';
import { getOffers, createOffer, deleteOffer } from '../../store/offersStore';
import type { Offer, OfferType, CreateOfferInput } from '../../store/offersStore';

interface OffersScreenProps {
  onBack: () => void;
}

type Tab = 'active' | 'expired';

const typeConfig = {
  percentage: { icon: Percent, label: 'Percentage', color: '#1A73E8', bg: 'rgba(26,115,232,0.1)' },
  flat: { icon: IndianRupee, label: 'Flat Off', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  festival: { icon: PartyPopper, label: 'Festival', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
};

const statusConfig = {
  active: { label: 'Active', color: '#1A7A4A', bg: 'rgba(26,122,74,0.1)' },
  expired: { label: 'Expired', color: '#6B7280', bg: '#F5F7FA' },
  scheduled: { label: 'Scheduled', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
};

function OfferCard({ offer, onDelete }: { offer: Offer; onDelete: (id: string) => void }) {
  const tc = typeConfig[offer.type];
  const sc = statusConfig[offer.status];
  const Icon = tc.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: tc.bg }}>
            <Icon size={20} color={tc.color} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1D1F]">{offer.name}</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">{tc.label}</p>
          </div>
        </div>
        <button onClick={() => onDelete(offer.id)} className="btn-tap w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
          <Trash2 size={15} color="#EF4444" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F7FA]">
        <div>
          <p className="text-2xl font-bold" style={{ color: tc.color }}>
            {offer.type === 'flat' ? `₹${offer.value}` : `${offer.value}%`}
          </p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">
            {offer.startDate} → {offer.endDate}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: sc.bg, color: sc.color }}>
          {sc.label}
        </span>
      </div>
    </div>
  );
}

function CreateOfferModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<OfferType>('percentage');
  const [value, setValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [festivalName, setFestivalName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) { setError('Please enter an offer name'); return; }
    if (!value || isNaN(Number(value)) || Number(value) <= 0) { setError('Please enter a valid discount value'); return; }
    if (!startDate || !endDate) { setError('Please select start and end dates'); return; }
    if (new Date(startDate) > new Date(endDate)) { setError('End date must be after start date'); return; }

    const input: CreateOfferInput = {
      name: name.trim(),
      type,
      value: Number(value),
      startDate,
      endDate,
      festivalName: type === 'festival' ? festivalName : undefined,
      appliedToAll: true,
    };
    createOffer(input);
    onCreate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full sm:max-w-[430px] mx-auto bg-white rounded-t-3xl p-5 pb-8" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#1A1D1F]">Create New Offer</h2>
          <button onClick={onClose} className="btn-tap w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center">
            <X size={16} color="#6B7280" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#6B7280] uppercase mb-1.5 block">Offer Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monsoon Sale"
              className="w-full h-11 bg-[#F5F7FA] rounded-xl px-4 text-sm text-[#1A1D1F] outline-none border border-transparent focus:border-[#1A73E8]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6B7280] uppercase mb-1.5 block">Offer Type</label>
            <div className="flex gap-2">
              {(['percentage', 'flat', 'festival'] as OfferType[]).map((t) => {
                const { icon: Icon, label, color, bg } = typeConfig[t];
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all"
                    style={{
                      borderColor: type === t ? color : '#E5E7EB',
                      background: type === t ? bg : 'white',
                    }}
                  >
                    <Icon size={16} color={type === t ? color : '#6B7280'} />
                    <span className="text-[10px] font-semibold" style={{ color: type === t ? color : '#6B7280' }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {type === 'festival' && (
            <div>
              <label className="text-xs font-semibold text-[#6B7280] uppercase mb-1.5 block">Festival Name</label>
              <input
                value={festivalName}
                onChange={(e) => setFestivalName(e.target.value)}
                placeholder="e.g. Diwali, Eid, Independence Day"
                className="w-full h-11 bg-[#F5F7FA] rounded-xl px-4 text-sm text-[#1A1D1F] outline-none border border-transparent focus:border-[#1A73E8]"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#6B7280] uppercase mb-1.5 block">
              {type === 'flat' ? 'Flat Discount (₹)' : 'Discount (%)'}
            </label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              type="number"
              min="1"
              max={type === 'percentage' ? '100' : undefined}
              placeholder={type === 'flat' ? '2000' : '10'}
              className="w-full h-11 bg-[#F5F7FA] rounded-xl px-4 text-sm text-[#1A1D1F] outline-none border border-transparent focus:border-[#1A73E8]"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#6B7280] uppercase mb-1.5 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 bg-[#F5F7FA] rounded-xl px-3 text-sm text-[#1A1D1F] outline-none border border-transparent focus:border-[#1A73E8]"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#6B7280] uppercase mb-1.5 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-11 bg-[#F5F7FA] rounded-xl px-3 text-sm text-[#1A1D1F] outline-none border border-transparent focus:border-[#1A73E8]"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <button
            onClick={handleCreate}
            className="btn-tap w-full h-12 rounded-2xl text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)' }}
          >
            Create Offer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OffersScreen({ onBack }: OffersScreenProps) {
  const [tab, setTab] = useState<Tab>('active');
  const [showCreate, setShowCreate] = useState(false);
  const [, forceUpdate] = useState(0);

  const allOffers = getOffers();
  const displayed = allOffers.filter((o) =>
    tab === 'active' ? o.status !== 'expired' : o.status === 'expired'
  );

  const handleDelete = (id: string) => {
    deleteOffer(id);
    forceUpdate((n) => n + 1);
  };

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
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#1A1D1F]">Offers</h1>
          <p className="text-xs text-[#6B7280]">Create and manage discounts</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-tap flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#1A73E8' }}
        >
          <Plus size={16} /> New
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-[#E5E7EB]">
          {(['active', 'expired'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
              style={{
                background: tab === t ? '#1A73E8' : 'transparent',
                color: tab === t ? 'white' : '#6B7280',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Offers List */}
      <div className="flex-1 px-4 pt-4 pb-8 space-y-3">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(26,115,232,0.1)] flex items-center justify-center">
              <Tag size={28} color="#1A73E8" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1A1D1F]">
                {tab === 'active' ? 'No active offers' : 'No expired offers'}
              </p>
              {tab === 'active' && (
                <p className="text-xs text-[#6B7280] mt-1">Create your first offer to attract buyers</p>
              )}
            </div>
            {tab === 'active' && (
              <button
                onClick={() => setShowCreate(true)}
                className="btn-tap flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: '#1A73E8' }}
              >
                <Plus size={16} /> Create Offer
              </button>
            )}
          </div>
        ) : (
          displayed.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onDelete={handleDelete} />
          ))
        )}
      </div>

      {showCreate && (
        <CreateOfferModal
          onClose={() => setShowCreate(false)}
          onCreate={() => forceUpdate((n) => n + 1)}
        />
      )}
    </div>
  );
}
