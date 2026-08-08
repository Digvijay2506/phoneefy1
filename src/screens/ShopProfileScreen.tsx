import { ArrowLeft, MapPin, Phone as PhoneIcon, MessageCircle, Star, Shield, Clock } from 'lucide-react';
import { getShopById, getPhonesByShop, formatPrice } from '../data';
import type { Phone } from '../data';
import PhoneCard from '../components/PhoneCard';
import StarRating from '../components/StarRating';

interface ShopProfileScreenProps {
  shopId: string;
  onBack: () => void;
  onPhoneTap: (phone: Phone) => void;
}

export default function ShopProfileScreen({ shopId, onBack, onPhoneTap }: ShopProfileScreenProps) {
  const shop = getShopById(shopId);
  const phones = getPhonesByShop(shopId);

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
      <div className="relative px-4 pt-12 pb-6" style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #1A3A5C 100%)' }}>
        <button
          onClick={onBack}
          className="btn-tap w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6"
        >
          <ArrowLeft size={20} color="white" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            {shop.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">{shop.name}</h1>
              <div className="flex items-center gap-1 bg-[#1A7A4A] px-2 py-0.5 rounded-full">
                <Shield size={10} color="white" />
                <span className="text-[9px] font-bold text-white">Verified</span>
              </div>
            </div>
            <StarRating rating={shop.rating} size={13} />
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin size={12} color="rgba(255,255,255,0.6)" />
              <p className="text-xs text-white/60">{shop.address}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
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
      </div>

      {/* Info Cards */}
      <div className="flex gap-3 px-4 mt-4">
        <div className="flex-1 bg-white rounded-2xl p-3 text-center shadow-sm">
          <p className="text-lg font-bold text-[#1A73E8]">{shop.listingCount}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">Listings</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 text-center shadow-sm">
          <p className="text-lg font-bold text-[#1A73E8]">{shop.rating}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">Rating</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1">
            <Clock size={14} color="#1A73E8" />
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">{shop.distance}</p>
        </div>
      </div>

      {/* Listings */}
      <div className="px-4 mt-5 pb-6">
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
    </div>
  );
}
