import { useState, useEffect, useRef } from 'react';
import { Search, X, Store, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { searchPhones, loadCatalog } from '../data';
import type { Phone, Shop } from '../data';
import PhoneCard from '../components/PhoneCard';
import SkeletonCard from '../components/SkeletonCard';
import BottomNav from '../components/BottomNav';
import { trackSearch } from '@/lib/analytics';

interface SearchScreenProps {
  initialQuery?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPhoneTap: (phone: Phone) => void;
  onShopTap: (shopId: string) => void;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'under10k', label: 'Under ₹10K' },
  { key: '10k20k', label: '₹10K–₹20K' },
  { key: 'over20k', label: 'Over ₹20K' },
  { key: 'imeiVerified', label: 'IMEI Verified' },
];

export default function SearchScreen({
  initialQuery = '',
  activeTab,
  onTabChange,
  onPhoneTap,
  onShopTap,
}: SearchScreenProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState('all');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    doSearch(initialQuery, 'all');
  }, []);

  const doSearch = (q: string, f: string) => {
    setLoading(true);
    loadCatalog().then(() => {
      const result = searchPhones(q, f);
      setPhones(result.phones);
      setShops(result.shops);
      setLoading(false);
      if (q.trim()) trackSearch(q.trim(), result.phones.length + result.shops.length);
    });
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    doSearch(val, filter);
  };

  const handleFilter = (f: string) => {
    setFilter(f);
    doSearch(query, f);
  };

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Search Header */}
      <div
        className="sticky top-0 z-20 px-4 pt-12 pb-3"
        style={{ background: 'rgba(245,247,250,0.97)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2.5 bg-white rounded-2xl shadow-sm px-4 h-12 border border-[#E5E7EB]">
          <Search size={18} color="#6B7280" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search phones, brands, shops…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="flex-1 text-sm text-[#1A1D1F] outline-none bg-transparent placeholder:text-[#9CA3AF]"
          />
          {query && (
            <button onClick={() => handleQueryChange('')} className="btn-tap">
              <X size={16} color="#9CA3AF" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilter(f.key)}
              className="chip-tap flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter === f.key ? '#1A73E8' : 'white',
                color: filter === f.key ? 'white' : '#6B7280',
                border: '1px solid',
                borderColor: filter === f.key ? '#1A73E8' : '#E5E7EB',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 px-4 pb-20">
        {/* Header Row */}
        <div className="flex items-center justify-between py-3">
          <p className="text-sm text-[#6B7280]">
            {loading ? 'Searching…' : `${phones.length + shops.length} results`}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setLayout('grid')} className="btn-tap w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <LayoutGrid size={16} color={layout === 'grid' ? '#1A73E8' : '#6B7280'} />
            </button>
            <button onClick={() => setLayout('list')} className="btn-tap w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <List size={16} color={layout === 'list' ? '#1A73E8' : '#6B7280'} />
            </button>
          </div>
        </div>

        {loading ? (
          layout === 'grid'
            ? <div className="grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            : <div className="space-y-3">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} type="list" />)}
              </div>
        ) : (
          <>
            {shops.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#6B7280] mb-2 flex items-center gap-2">
                  <Store size={14} /> Shops
                </h3>
                <div className="space-y-2">
                  {shops.map((shop) => (
                    <div
                      key={shop.id}
                      onClick={() => onShopTap(shop.id)}
                      className="card-tap bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#1A73E8]/10 flex items-center justify-center font-bold text-[#1A73E8]">
                        {shop.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#1A1D1F]">{shop.name}</p>
                        <p className="text-xs text-[#6B7280]">{shop.distance} · {shop.listingCount} listings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {phones.length === 0 && shops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Search size={48} color="#E5E7EB" />
                <p className="text-[#6B7280] text-sm text-center">No results for "{query}"</p>
              </div>
            ) : layout === 'grid' ? (
              <div className="grid grid-cols-2 gap-3">
                {phones.map((phone) => (
                  <PhoneCard key={phone.id} phone={phone} onTap={onPhoneTap} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {phones.map((phone) => (
                  <PhoneCard key={phone.id} phone={phone} onTap={onPhoneTap} layout="list" />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
