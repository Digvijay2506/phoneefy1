import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Check, Battery, Phone, MessageCircle, Shield, Cpu, HardDrive, Zap, Box, X, Maximize2 } from 'lucide-react';
import { getPhoneById, getShopById, formatPrice } from '../data';
import StarRating from '../components/StarRating';
import BottomNav from '../components/BottomNav';
import ImageCarousel from '../components/ImageCarousel';
import { trackPhoneViewed, trackPhoneImageSwiped, trackWhatsAppClick, trackCallClick } from '@/lib/analytics';

interface DeviceDetailScreenProps {
  phoneId: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack: () => void;
  onShopTap: (shopId: string) => void;
}

export default function DeviceDetailScreen({ phoneId, activeTab, onTabChange, onBack, onShopTap }: DeviceDetailScreenProps) {
  const phone = getPhoneById(phoneId);
  const shop = phone ? getShopById(phone.shopId) : null;
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState(false); // full-screen photo viewer

  // Track phone view when screen opens
  useEffect(() => {
    if (phone && shop) trackPhoneViewed(phone.name, phone.brand, phone.price, shop.name);
  }, []);  // eslint-disable-line

  if (!phone || !shop) return null;

  const allImages = phone.images ?? [phone.image];

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Image Gallery */}
      <div className="relative w-full bg-gradient-to-br from-[#0D1B2A] to-[#1A3A5C]">
        {/* Main image */}
        <div className="relative w-full h-[400px]">
          <ImageCarousel
            images={allImages}
            alt={phone.name}
            index={activeImg}
            onIndexChange={(i) => { setActiveImg(i); trackPhoneImageSwiped(phone.name, i); }}
            onImageClick={() => setZoom(true)}
            showDots={false}
            arrows
            className="h-full"
            imgClassName="object-contain p-3 cursor-zoom-in"
          />
          <button
            onClick={onBack}
            aria-label="Back"
            className="btn-tap absolute top-12 left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </button>
          {phone.imeiVerified && (
            <div className="absolute top-12 right-4 flex items-center gap-1 bg-[#1A7A4A] px-3 py-1.5 rounded-full">
              <Shield size={12} color="white" />
              <span className="text-[11px] font-semibold text-white">IMEI Verified</span>
            </div>
          )}
          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 text-white text-[10px] font-medium px-2 py-1 rounded-full pointer-events-none">
            <Maximize2 size={10} /> {allImages.length > 1 ? 'Swipe · tap to zoom' : 'Tap photo to zoom'}
          </div>
          {/* Dot indicator */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); trackPhoneImageSwiped(phone.name, i); }}
                  aria-label={`Photo ${i + 1}`}
                  data-dot={i === activeImg ? 'active' : 'idle'}
                  className="rounded-full transition-all pointer-events-auto"
                  style={{
                    width: i === activeImg ? 20 : 6,
                    height: 6,
                    background: i === activeImg ? 'white' : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip — only shown when there are multiple images */}
        {allImages.length > 1 && (
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => { setActiveImg(i); trackPhoneImageSwiped(phone.name, i); }}
                className="flex-shrink-0 rounded-xl overflow-hidden transition-all"
                style={{
                  width: 58, height: 58,
                  border: i === activeImg ? '2px solid white' : '2px solid transparent',
                  opacity: i === activeImg ? 1 : 0.55,
                  background: 'rgba(255,255,255,0.08)',
                }}
              >
                <img src={img} alt={`view ${i + 1}`} className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-44 -mt-4 relative">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <h1 className="text-xl font-bold text-[#1A1D1F]">{phone.name}</h1>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-2xl font-bold text-[#1A1D1F]">{formatPrice(phone.price)}</span>
          </div>
        </div>

        {/* Specs */}
        <div className="bg-white rounded-3xl shadow-sm p-5 mt-3">
          <h3 className="text-sm font-bold text-[#1A1D1F] mb-4">Specifications</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: HardDrive, label: 'Storage', value: phone.storage },
              { icon: Cpu, label: 'RAM', value: phone.ram },
              { icon: Zap, label: 'Condition', value: phone.condition },
              ...(phone.batteryHealth !== undefined
                ? [{ icon: Battery, label: 'Battery', value: `${phone.batteryHealth}%` }]
                : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 bg-[#F5F7FA] rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(26,115,232,0.1)] flex items-center justify-center">
                  <Icon size={15} color="#1A73E8" />
                </div>
                <div>
                  <p className="text-[10px] text-[#9CA3AF]">{label}</p>
                  <p className="text-xs font-semibold text-[#1A1D1F]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div className="bg-white rounded-3xl shadow-sm p-5 mt-3">
          <h3 className="text-sm font-bold text-[#1A1D1F] mb-3 flex items-center gap-2">
            <Box size={16} color="#1A73E8" /> Accessories
          </h3>
          <div className="flex flex-wrap gap-2">
            {phone.accessories.map((acc) => (
              <span key={acc} className="flex items-center gap-1 bg-[#F5F7FA] border border-[#E5E7EB] px-3 py-1.5 rounded-full text-xs font-medium text-[#1A1D1F]">
                <Check size={10} color="#1A7A4A" strokeWidth={3} /> {acc}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        {phone.description && (
          <div className="bg-white rounded-3xl shadow-sm p-5 mt-3">
            <h3 className="text-sm font-bold text-[#1A1D1F] mb-3">Description</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">{phone.description}</p>
          </div>
        )}

        {/* Shop Card */}
        <div
          onClick={() => onShopTap(shop.id)}
          className="card-tap bg-white rounded-3xl shadow-sm p-5 mt-3 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1A73E8]/10 flex items-center justify-center text-lg font-bold text-[#1A73E8]">
              {shop.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#1A1D1F]">{shop.name}</p>
              <StarRating rating={shop.rating} size={12} />
              <p className="text-xs text-[#6B7280] mt-0.5">{shop.address}</p>
            </div>
          </div>
        </div>

        {/* Bottom padding spacer */}
        <div className="h-4" />
      </div>

      {/* Bottom CTA */}
      <div
        className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full sm:max-w-[430px] px-4 py-3 z-40"
        style={{
          background: 'rgba(245,247,250,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <div className="flex gap-3">
          <button
            onClick={() => { window.open(`tel:${shop.phone}`); trackCallClick(phone.name, shop.name); }}
            className="btn-tap w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-[#E5E7EB]"
          >
            <Phone size={22} color="#1A73E8" />
          </button>
          <button
            onClick={() => { window.open(`https://wa.me/${shop.phone.replace(/\D/g, '')}`); trackWhatsAppClick(phone.name, shop.name, phone.price); }}
            className="btn-tap flex-1 h-14 rounded-2xl font-semibold text-base text-white flex items-center justify-center gap-2"
            style={{ background: '#25D366' }}
          >
            <MessageCircle size={20} />
            WhatsApp Seller
          </button>
        </div>
      </div>

      {/* Home / Search / Shops / Deals / Profile — always visible */}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />

      {/* Full-screen photo viewer */}
      {zoom && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={() => setZoom(false)}
        >
          {/* Swipe left/right through the photos, full screen */}
          <div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
            <ImageCarousel
              images={allImages}
              alt={phone.name}
              index={activeImg}
              onIndexChange={setActiveImg}
              showDots={false}
              arrows
              className="h-full"
              imgClassName="object-contain"
            />
          </div>
          <button
            aria-label="Close photo"
            onClick={() => setZoom(false)}
            className="absolute top-12 right-4 w-11 h-11 rounded-full bg-white/15 flex items-center justify-center"
          >
            <X size={22} color="white" />
          </button>
          {allImages.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 text-center text-white/80 text-xs font-medium pointer-events-none">
              {activeImg + 1} / {allImages.length} · swipe for more
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
