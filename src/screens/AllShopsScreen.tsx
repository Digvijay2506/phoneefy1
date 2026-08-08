import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Phone, Star, MessageCircle } from 'lucide-react';
import { shops, loadCatalog } from '../data';

interface AllShopsScreenProps {
  onBack: () => void;
  onShopTap: (shopId: string) => void;
}

export default function AllShopsScreen({ onBack, onShopTap }: AllShopsScreenProps) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    let mounted = true;
    loadCatalog().then(() => {
      if (mounted) forceRender((n) => n + 1);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-12 pb-4 sticky top-0 z-10"
        style={{
          background: 'rgba(245,247,250,0.96)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          onClick={onBack}
          className="btn-tap w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <ArrowLeft size={20} color="#1A1D1F" />
        </button>
        <h1 className="text-lg font-bold text-[#1A1D1F]">All Shops</h1>
        <span className="ml-auto text-sm text-[#6B7280]">{shops.length} shops</span>
      </div>

      <div className="flex-1 px-4 pb-6 space-y-3">
        {shops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => onShopTap(shop.id)}
            className="card-tap bg-white rounded-2xl shadow-sm p-4 cursor-pointer"
          >
            <div className="flex items-start gap-3.5">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)' }}
              >
                {shop.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[#1A1D1F] truncate">{shop.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={12} fill="#F59E0B" color="#F59E0B" />
                  <span className="text-xs font-semibold text-[#1A1D1F]">{shop.rating}</span>
                  <span className="text-xs text-[#9CA3AF]">• {shop.listingCount} phones</span>
                </div>
                <div className="flex items-start gap-1 mt-1.5">
                  <MapPin size={12} color="#9CA3AF" className="mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#6B7280] leading-relaxed">{shop.address}</p>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={11} color="#1A73E8" className="flex-shrink-0" />
                  <span className="text-xs font-medium text-[#1A73E8]">{shop.distance} away</span>
                </div>
              </div>
              <button className="btn-tap flex-shrink-0 bg-[#1A73E8] text-white text-xs font-semibold px-4 py-2 rounded-xl">
                View
              </button>
            </div>

            <div className="flex gap-2 mt-3.5 pt-3.5 border-t border-[#F5F7FA]">
              <button
                onClick={(e) => { e.stopPropagation(); window.open(`tel:${shop.phone}`); }}
                className="btn-tap flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(26,115,232,0.08)', color: '#1A73E8' }}
              >
                <Phone size={13} /> Call
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${shop.phone.replace(/\D/g, '')}`); }}
                className="btn-tap flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(37,211,102,0.08)', color: '#25D366' }}
              >
                <MessageCircle size={13} /> WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
