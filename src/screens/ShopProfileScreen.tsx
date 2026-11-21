import { ArrowLeft, MapPin, Phone as PhoneIcon, MessageCircle, Star, Shield, Clock, Navigation } from 'lucide-react';
import { getShopById, getPhonesByShop, formatPrice, distanceKm, formatDistance } from '../data';
import { useUserLocation } from '../lib/useUserLocation';
import type { Phone } from '../data';
import PhoneCard from '../components/PhoneCard';
import BottomNav from '../components/BottomNav';

interface ShopProfileScreenProps {
  shopId: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack: () => void;
  onPhoneTap: (phone: Phone) => void;
}

export default function ShopProfileScreen({ shopId, activeTab, onTabChange, onBack, onPhoneTap }: ShopProfileScreenProps) {
  const shop = getShopById(shopId);
  const { coords } = useUserLocation();
  const phones = getPhonesByShop(shopId);

  const away =
    shop && coords && shop.lat !== null && shop.lng !== null
      ? formatDistance(distanceKm(coords, { lat: shop.lat, lng: shop.lng }))
      : null;
  const hasLocation = !!shop && shop.lat !== null && shop.lng !== null;

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Shop not found</p>
      </div>
    );
  }

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Hero Header */}
      <div className="relative overflow-hidden px-4 pt-12 pb-6" style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #1A3A5C 100%)' }}>
        {shop.coverImage && (
          <>
            <img src={shop.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,27,42,0.5) 0%, rgba(13,27,42,0.92) 100%)' }} />
          </>
        )}
        <button
          onClick={onBack}
          aria-label="Back"
          className="btn-tap relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6"
        >
          <ArrowLeft size={20} color="white" />
        </button>

        <div className="relative flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            {shop.logo ? <img src={shop.logo} alt="" className="w-full h-full object-cover" /> : shop.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">{shop.name}</h1>
              {shop.verified && (
                <div className="flex items-center gap-1 bg-[#1A7A4A] px-2 py-0.5 rounded-full">
                  <Shield size={10} color="white" />
                  <span className="text-[9px] font-bold text-white">Verified</span>
                </div>
              )}
            </div>
            <p className="text-xs text-white/70 mt-0.5">{shop.listingCount} {shop.listingCount === 1 ? 'phone' : 'phones'} listed</p>
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin size={12} color="rgba(255,255,255,0.6)" />
              <p className="text-xs text-white/60">{shop.address}</p>
            </div>
          </div>
        </div>

        <div className="relative flex gap-2 mt-5">
          <button
            onClick={() => window.open(`tel:${shop.phone}`)}
            className="btn-tap flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
          >
            <PhoneIcon size={16} /> Call
          </button>
          <button
            onClick={() => window.open(`https://wa.me/${shop.phone.replace(/\D/g, '')}`)}
            className="btn-tap flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
            style={{ background: '#25D366', color: 'white' }}
          >
            <MessageCircle size={16} /> WhatsApp
          </button>
        </div>
        {hasLocation && (
          <button
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`, '_blank')}
            className="btn-tap relative mt-2 w-full h-11 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
          >
            <Navigation size={16} /> Get directions{away ? ` · ${away}` : ''}
          </button>
        )}
      </div>

      {/* Info Cards */}
      <div className="flex gap-3 px-4 mt-4">
        <div className="flex-1 bg-white rounded-2xl p-3 text-center shadow-sm">
          <p className="text-lg font-bold text-[#1A73E8]">{shop.listingCount}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">Listings</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 text-center shadow-sm">
          <p className="text-lg font-bold" style={{ color: shop.verified ? '#1A7A4A' : '#6B7280' }}>{shop.verified ? 'Yes' : 'New'}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">Verified</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1">
            <Clock size={14} color="#1A73E8" />
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">{away ?? shop.distance}</p>
        </div>
      </div>

      {/* Listings */}
      <div className="px-4 mt-5 pb-24">
        <h2 className="text-base font-bold text-[#1A1D1F] mb-3">
          Available Phones ({phones.length})
        </h2>
        {phones.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-[#6B7280] text-sm">No listings available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {phones.map((phone) => (
              <PhoneCard key={phone.id} phone={phone} onTap={onPhoneTap} />
            ))}
          </div>
        )}
      </div>

      {/* Home / Search / Shops / Deals / Profile — always visible */}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
