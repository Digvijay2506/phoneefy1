import { useState, useEffect } from 'react';
import { Plus, Search, Package, Eye, MessageCircle, CheckCircle, Edit2, Trash2, ShoppingBag, X } from 'lucide-react';
import {
  getInventory,
  deletePhone,
  markAsSold,
  subscribeInventory,
} from '../../store/phoneStore';
import type { InventoryPhone } from '../../store/phoneStore';
import { addToSoldInventory } from '../../store/soldInventoryStore';
import { logActivity } from '../../store/activityStore';

interface InventoryScreenProps {
  onAddPhone: () => void;
  onEditPhone: (phone: InventoryPhone) => void;
  onSoldInventory: () => void;
}

type Filter = 'all' | 'available' | 'sold';

function InventoryCard({
  phone,
  onEdit,
  onMarkSold,
  onDelete,
}: {
  phone: InventoryPhone;
  onEdit: (p: InventoryPhone) => void;
  onMarkSold: (p: InventoryPhone) => void;
  onDelete: (p: InventoryPhone) => void;
}) {
  const conditionColor = {
    'Like New': '#1A7A4A',
    'Good': '#1A73E8',
    'Fair': '#F59E0B',
    'Poor': '#EF4444',
  }[phone.condition] ?? '#6B7280';

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex gap-3 p-4">
        <div className="w-[80px] h-[90px] rounded-xl overflow-hidden flex-shrink-0 bg-[#F5F7FA] relative">
          <img
            src={phone.images[0] || '/phones/iphone-13.jpg'}
            alt={phone.model}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.2'; }}
          />
          {phone.status === 'sold' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">SOLD</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#1A1D1F] truncate">{phone.brand} {phone.model}</h3>
              <p className="text-xs text-[#6B7280]">{phone.storage} · {phone.ram} RAM</p>
            </div>
            <span
              className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: conditionColor + '14', color: conditionColor }}
            >
              {phone.condition}
            </span>
          </div>
          <p className="text-base font-bold text-[#1A1D1F] mt-1.5">₹{phone.price.toLocaleString()}</p>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Eye size={11} color="#9CA3AF" />
              <span className="text-[11px] text-[#6B7280]">{phone.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={11} color="#9CA3AF" />
              <span className="text-[11px] text-[#6B7280]">{phone.whatsappClicks}</span>
            </div>
            {phone.imeiVerified && (
              <div className="flex items-center gap-1">
                <CheckCircle size={11} color="#1A7A4A" />
                <span className="text-[11px] text-[#1A7A4A]">IMEI</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {phone.status !== 'sold' && (
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={() => onEdit(phone)}
            className="btn-tap flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(26,115,232,0.08)', color: '#1A73E8' }}
          >
            <Edit2 size={13} /> Edit
          </button>
          <button
            onClick={() => onMarkSold(phone)}
            className="btn-tap flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(26,122,74,0.08)', color: '#1A7A4A' }}
          >
            <ShoppingBag size={13} /> Mark Sold
          </button>
          <button
            onClick={() => onDelete(phone)}
            className="btn-tap w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center"
          >
            <Trash2 size={15} color="#EF4444" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function InventoryScreen({ onAddPhone, onEditPhone, onSoldInventory }: InventoryScreenProps) {
  const [inventory, setInventory] = useState(() => getInventory());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [confirmDelete, setConfirmDelete] = useState<InventoryPhone | null>(null);
  const [confirmSold, setConfirmSold] = useState<InventoryPhone | null>(null);

  useEffect(() => {
    const unsub = subscribeInventory(() => setInventory(getInventory()));
    return unsub;
  }, []);

  const displayed = inventory
    .filter((p) => {
      if (filter === 'available') return p.status === 'available';
      if (filter === 'sold') return p.status === 'sold';
      return true;
    })
    .filter((p) =>
      !query ||
      `${p.brand} ${p.model} ${p.storage}`.toLowerCase().includes(query.toLowerCase())
    );

  const soldCount = inventory.filter((p) => p.status === 'sold').length;

  const handleMarkSold = async () => {
    if (!confirmSold) return;
    const updated = await markAsSold(confirmSold.id);
    if (updated) {
      addToSoldInventory(updated);
      logActivity('marked_sold', updated.brand, updated.model, `₹${updated.price.toLocaleString()}`);
    }
    setConfirmSold(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    logActivity('deleted', confirmDelete.brand, confirmDelete.model);
    await deletePhone(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 pt-12 pb-3"
        style={{ background: 'rgba(245,247,250,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E7EB' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-[#1A1D1F]">Inventory</h1>
            <p className="text-xs text-[#6B7280]">{inventory.filter((p) => p.status === 'available').length} active listings</p>
          </div>
          <div className="flex items-center gap-2">
            {soldCount > 0 && (
              <button
                onClick={onSoldInventory}
                className="btn-tap flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700"
              >
                <ShoppingBag size={13} /> {soldCount} Sold
              </button>
            )}
            <button
              onClick={onAddPhone}
              className="btn-tap w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ background: '#1A73E8' }}
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5 bg-white rounded-xl shadow-sm px-3.5 h-10 border border-[#E5E7EB]">
          <Search size={15} color="#6B7280" />
          <input
            type="search"
            placeholder="Search inventory…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm text-[#1A1D1F] outline-none bg-transparent placeholder:text-[#9CA3AF]"
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X size={14} color="#9CA3AF" />
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mt-2.5 overflow-x-auto no-scrollbar">
          {(['all', 'available', 'sold'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="chip-tap flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
              style={{
                background: filter === f ? '#1A73E8' : 'white',
                color: filter === f ? 'white' : '#6B7280',
                border: '1px solid',
                borderColor: filter === f ? '#1A73E8' : '#E5E7EB',
              }}
            >
              {f === 'all' ? `All (${inventory.length})` : f === 'available' ? `Available (${inventory.filter(p => p.status === 'available').length})` : `Sold (${soldCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-24 space-y-3">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(26,115,232,0.1)] flex items-center justify-center">
              <Package size={28} color="#1A73E8" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1A1D1F]">
                {query ? 'No matching phones' : 'No phones yet'}
              </p>
              {!query && (
                <p className="text-xs text-[#6B7280] mt-1">Add your first phone listing</p>
              )}
            </div>
            {!query && (
              <button
                onClick={onAddPhone}
                className="btn-tap flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: '#1A73E8' }}
              >
                <Plus size={16} /> Add Phone
              </button>
            )}
          </div>
        ) : (
          displayed.map((phone) => (
            <InventoryCard
              key={phone.id}
              phone={phone}
              onEdit={onEditPhone}
              onMarkSold={(p) => setConfirmSold(p)}
              onDelete={(p) => setConfirmDelete(p)}
            />
          ))
        )}
      </div>

      {/* Mark Sold Confirm */}
      {confirmSold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px]">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(26,122,74,0.1)] flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={22} color="#1A7A4A" />
            </div>
            <h2 className="text-base font-bold text-[#1A1D1F] text-center">Mark as Sold?</h2>
            <p className="text-sm text-[#6B7280] text-center mt-2">
              {confirmSold.brand} {confirmSold.model} will move to Sold Inventory with a 24-hour countdown.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmSold(null)} className="flex-1 h-11 rounded-2xl text-sm font-semibold text-[#1A1D1F] bg-[#F5F7FA]">
                Cancel
              </button>
              <button onClick={handleMarkSold} className="flex-1 h-11 rounded-2xl text-sm font-semibold text-white" style={{ background: '#1A7A4A' }}>
                Mark Sold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px]">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} color="#EF4444" />
            </div>
            <h2 className="text-base font-bold text-[#1A1D1F] text-center">Delete Listing?</h2>
            <p className="text-sm text-[#6B7280] text-center mt-2">
              {confirmDelete.brand} {confirmDelete.model} will be permanently removed from your inventory.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-11 rounded-2xl text-sm font-semibold text-[#1A1D1F] bg-[#F5F7FA]">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 h-11 rounded-2xl text-sm font-semibold text-white bg-red-500">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
