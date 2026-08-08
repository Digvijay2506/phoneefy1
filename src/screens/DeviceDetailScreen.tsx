import { ArrowLeft, Check, Battery, Phone, MessageCircle, Shield, Cpu, HardDrive, Zap, Box, Receipt } from 'lucide-react';
import { getPhoneById, getShopById, formatPrice } from '../data';
import EMICalculator from '../components/EMICalculator';
import StarRating from '../components/StarRating';

interface DeviceDetailScreenProps {
  phoneId: string;
  onBack: () => void;
  onShopTap: (shopId: string) => void;
}

export default function DeviceDetailScreen({ phoneId, onBack, onShopTap }: DeviceDetailScreenProps) {
  const phone = getPhoneById(phoneId);
  const shop = phone ? getShopById(phone.shopId) : null;

  if (!phone || !shop) return null;

  const discount = Math.round(((phone.originalPrice - phone.price) / phone.originalPrice) * 100);

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Image */}
      <div className="relative w-full h-[320px] bg-gradient-to-br from-[#0D1B2A] to-[#1A3A5C]">
        <img
          src={phone.image}
          alt={phone.name}
          className="w-full h-full object-contain p-6"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.opacity = '0.1';
          }}
        />
        <button
          onClick={onBack}
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
        <div className="absolute bottom-4 right-4 bg-[#EF4444] px-2.5 py-1 rounded-lg">
          <span className="text-xs font-bold text-white">{discount}% OFF</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-28 -mt-4 relative">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <h1 className="text-xl font-bold text-[#1A1D1F]">{phone.name}</h1>
          <p className="text-sm text-[#6B7280] mt-1">{phone.storage} · {phone.ram} RAM · {phone.color}</p>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-2xl font-bold text-[#1A1D1F]">{formatPrice(phone.price)}</span>
            <span className="text-base text-[#9CA3AF] line-through">{formatPrice(phone.originalPrice)}</span>
          </div>

          <span className="mt-2 inline-block bg-[rgba(26,122,74,0.1)] text-[#1A7A4A] text-xs font-semibold px-3 py-1 rounded-full">
            Save {formatPrice(phone.originalPrice - phone.price)}
          </span>
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

        {/* EMI */}
        <div className="mt-3">
          <EMICalculator price={phone.price} />
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 py-4"
        style={{
          background: 'rgba(245,247,250,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <div className="flex gap-3">
          <button
            onClick={() => window.open(`tel:${shop.phone}`)}
            className="btn-tap w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-[#E5E7EB]"
          >
            <Phone size={22} color="#1A73E8" />
          </button>
          <button
            onClick={() => window.open(`https://wa.me/${shop.phone.replace(/\D/g, '')}`)}
            className="btn-tap flex-1 h-14 rounded-2xl font-semibold text-base text-white flex items-center justify-center gap-2"
            style={{ background: '#25D366' }}
          >
            <MessageCircle size={20} />
            WhatsApp Seller
          </button>
        </div>
      </div>
    </div>
  );
}
