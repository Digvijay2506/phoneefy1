import { useState, useEffect } from 'react';
import { Search, MapPin, Bell, Smartphone, TrendingUp, Store } from 'lucide-react';
import { phones, shops, formatPrice, loadCatalog } from '../data';
import type { Phone, Shop } from '../data';
import AdSlider from '../components/AdSlider';
import BrandChip from '../components/BrandChip';
import PhoneCard from '../components/PhoneCard';
import SkeletonCard from '../components/SkeletonCard';
import BottomNav from '../components/BottomNav';

interface HomeScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPhoneTap: (phone: Phone) => void;
  onShopTap: (shopId: string) => void;
  onSearchTap: (query?: string) => void;
  onAllShopsTap: () => void;
}

export default function HomeScreen({
  activeTab,
  onTabChange,
  onPhoneTap,
  onShopTap,
  onSearchTap,
  onAllShopsTap,
}: HomeScreenProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadCatalog().then(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const featuredPhones = phones.slice(0, 6);
  const nearbyShops = shops.slice(0, 4);

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div
        className="flex items-start justify-between px-4 pt-12 pb-4"
        style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #1A3A5C 100%)' }}
      >
        <div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} color="rgba(255,255,255,0.6)" />
            <span className="text-xs text-white/60">Pune, Maharashtra</span>
          </div>
          <h1 className="text-[22px] font-bold text-white mt-1 leading-tight">
            Find Your Perfect
            <br />
            <span style={{ color: '#4DA6FF' }}>Pre-owned Phone</span>
          </h1>
        </div>
        <button className="btn-tap w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mt-1">
          <Bell size={20} color="white" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 -mt-5">
        <button
          onClick={() => onSearchTap()}
          className="btn-tap w-full bg-white rounded-2xl shadow-sm h-12 flex items-center gap-3 px-4"
        >
          <Search size={18} color="#6B7280" />
          <span className="text-sm text-[#9CA3AF]">Search phones, brands, shops…</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {/* Ad Slider */}
        <div className="mt-5">
          <AdSlider />
        </div>

        {/* Brands */}
        <div className="mt-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-base font-bold text-[#1A1D1F]">Browse by Brand</h2>
          </div>
          <BrandChip onTap={(brand) => onSearchTap(brand)} />
        </div>

        {/* Featured Phones */}
        <div className="mt-5 px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} color="#1A73E8" />
              <h2 className="text-base font-bold text-[#1A1D1F]">Featured Listings</h2>
            </div>
            <button onClick={() => onSearchTap('')} className="text-sm font-semibold text-[#1A73E8]">
              See All
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {featuredPhones.map((phone) => (
                <PhoneCard key={phone.id} phone={phone} onTap={onPhoneTap} />
              ))}
            </div>
          )}
        </div>

        {/* Nearby Shops */}
        <div className="mt-5 px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Store size={16} color="#1A73E8" />
              <h2 className="text-base font-bold text-[#1A1D1F]">Nearby Shops</h2>
            </div>
            <button onClick={onAllShopsTap} className="text-sm font-semibold text-[#1A73E8]">
              See All
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} type="shop" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {nearbyShops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => onShopTap(shop.id)}
                  className="card-tap bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1A73E8]/10 flex items-center justify-center font-bold text-[#1A73E8] text-base">
                    {shop.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1A1D1F] truncate">{shop.name}</p>
                    <p className="text-xs text-[#6B7280] truncate">{shop.address}</p>
                    <p className="text-xs text-[#1A73E8] font-medium mt-0.5">{shop.distance} · {shop.listingCount} listings</p>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className="flex items-center gap-0.5">
                      <span className="text-sm font-bold text-[#1A1D1F]">{shop.rating}</span>
                      <span className="text-yellow-400 text-xs">★</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
