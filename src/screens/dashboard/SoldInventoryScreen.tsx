import { ArrowLeft, PackageCheck, RotateCcw, Trash2, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  getSoldInventory,
  deleteSoldEntry,
  removeFromSoldInventory,
  formatCountdown,
  timeUntilExpiry,
  subscribeSold,
} from '../../store/soldInventoryStore';
import type { SoldEntry } from '../../store/soldInventoryStore';
import { restorePhone } from '../../store/phoneStore';
import { logActivity } from '../../store/activityStore';

interface SoldInventoryScreenProps {
  onBack: () => void;
}

function CountdownTimer({ entry }: { entry: SoldEntry }) {
  const [remaining, setRemaining] = useState(() => timeUntilExpiry(entry));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(timeUntilExpiry(entry));
    }, 1000);
    return () => clearInterval(interval);
  }, [entry]);

  const pct = Math.max(0, remaining / (24 * 60 * 60 * 1000));
  const isUrgent = remaining < 3 * 60 * 60 * 1000; // < 3h

  return (
    <div className="flex items-center gap-2">
      <Clock size={12} color={isUrgent ? '#EF4444' : '#F59E0B'} />
      <span
        className="text-[11px] font-bold tabular-nums"
        style={{ color: isUrgent ? '#EF4444' : '#F59E0B' }}
      >
        {formatCountdown(remaining)}
      </span>
      <div className="flex-1 h-1 rounded-full bg-[#E5E7EB] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct * 100}%`,
            background: isUrgent ? '#EF4444' : '#F59E0B',
          }}
        />
      </div>
    </div>
  );
}

function SoldCard({
  entry,
  onRestore,
  onDelete,
}: {
  entry: SoldEntry;
  onRestore: (entry: SoldEntry) => void;
  onDelete: (entry: SoldEntry) => void;
}) {
  const { phone } = entry;
  const soldDate = new Date(entry.soldAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Top */}
      <div className="flex gap-3 p-4">
        <div
          className="w-[80px] h-[90px] rounded-xl overflow-hidden flex-shrink-0 bg-[#F5F7FA] flex items-center justify-center"
        >
          <img
            src={phone.images[0] || '/phones/iphone-13.jpg'}
            alt={phone.model}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1A1D1F]">{phone.brand} {phone.model}</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">{phone.storage} · {phone.colour}</p>
            </div>
            <span className="flex items-center gap-1 bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
              SOLD
            </span>
          </div>
          <p className="text-base font-bold text-[#1A7A4A] mt-1.5">₹{phone.price.toLocaleString()}</p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">Sold: {soldDate}</p>
        </div>
      </div>

      {/* Countdown */}
      <div className="px-4 pb-3">
        <CountdownTimer entry={entry} />
        <p className="text-[10px] text-[#9CA3AF] mt-1">Auto-deletes in 24h from sale time</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={() => onRestore(entry)}
          className="btn-tap flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-semibold"
          style={{ background: 'rgba(26,115,232,0.08)', color: '#1A73E8' }}
        >
          <RotateCcw size={14} /> Restore Listing
        </button>
        <button
          onClick={() => onDelete(entry)}
          className="btn-tap flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-semibold bg-red-50 text-red-500"
        >
          <Trash2 size={14} /> Delete Permanently
        </button>
      </div>
    </div>
  );
}

export default function SoldInventoryScreen({ onBack }: SoldInventoryScreenProps) {
  const [entries, setEntries] = useState(() => getSoldInventory());
  const [confirmDelete, setConfirmDelete] = useState<SoldEntry | null>(null);

  useEffect(() => {
    const unsub = subscribeSold(() => {
      setEntries(getSoldInventory());
    });
    return unsub;
  }, []);

  const handleRestore = async (entry: SoldEntry) => {
    removeFromSoldInventory(entry.id);
    await restorePhone(entry.phone.id);
    logActivity('restored', entry.phone.brand, entry.phone.model, 'Restored from Sold Inventory');
    setEntries(getSoldInventory());
  };

  const handleDeleteConfirm = () => {
    if (!confirmDelete) return;
    deleteSoldEntry(confirmDelete.id);
    setEntries(getSoldInventory());
    setConfirmDelete(null);
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
          <h1 className="text-lg font-bold text-[#1A1D1F]">Sold Inventory</h1>
          <p className="text-xs text-[#6B7280]">{entries.length} phone{entries.length !== 1 ? 's' : ''} · auto-expire after 24h</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Info Banner */}
        <div className="mx-4 mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertCircle size={16} color="#F59E0B" className="mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Sold phones are kept here for 24 hours. Restore if the sale falls through, or delete permanently to clear records.
          </p>
        </div>

        {/* List */}
        <div className="px-4 pt-4 pb-8 space-y-3">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(26,122,74,0.1)] flex items-center justify-center">
                <PackageCheck size={28} color="#1A7A4A" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#1A1D1F]">No sold phones</p>
                <p className="text-xs text-[#6B7280] mt-1">Phones you mark as sold will appear here</p>
              </div>
            </div>
          ) : (
            entries.map((entry) => (
              <SoldCard
                key={entry.id}
                entry={entry}
                onRestore={handleRestore}
                onDelete={(e) => setConfirmDelete(e)}
              />
            ))
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px]">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} color="#EF4444" />
            </div>
            <h2 className="text-base font-bold text-[#1A1D1F] text-center">Delete Permanently?</h2>
            <p className="text-sm text-[#6B7280] text-center mt-2">
              {confirmDelete.phone.brand} {confirmDelete.phone.model} will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-11 rounded-2xl text-sm font-semibold text-[#1A1D1F] bg-[#F5F7FA]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 h-11 rounded-2xl text-sm font-semibold text-white bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
