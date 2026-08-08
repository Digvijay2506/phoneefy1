import { Check } from 'lucide-react';
import type { Phone } from '../data';
import { formatPrice, getShopById } from '../data';

interface PhoneCardProps {
  phone: Phone;
  onTap: (phone: Phone) => void;
  layout?: 'grid' | 'list';
}

export default function PhoneCard({ phone, onTap, layout = 'grid' }: PhoneCardProps) {
  const shop = getShopById(phone.shopId);
  const emiAmount = Math.ceil(phone.price / 12);

  if (layout === 'list') {
    return (
      <div
        onClick={() => onTap(phone)}
        className="card-tap bg-white rounded-2xl shadow-sm overflow-hidden flex gap-3.5 p-3.5 cursor-pointer"
      >
        <div className="w-[100px] h-[120px] rounded-xl overflow-hidden bg-gradient-to-br from-[#F5F7FA] to-[#E8ECF0] flex-shrink-0 relative">
          <img
            src={phone.image}
            alt={phone.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <h3 className="text-sm font-semibold text-[#1A1D1F] truncate">{phone.name}</h3>
          <p className="text-xs text-[#6B7280]">{phone.storage} • {phone.color}</p>
          <p className="text-lg font-bold text-[#1A1D1F]">{formatPrice(phone.price)}</p>
          {phone.imeiVerified && (
            <span className="inline-flex items-center gap-1 bg-[rgba(26,122,74,0.1)] text-[#1A7A4A] px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit">
              <Check size={10} strokeWidth={3} /> IMEI Verified
            </span>
          )}
          <p className="text-[11px] text-[#6B7280]">{shop?.name} • {shop?.distance}</p>
          <button className="mt-auto w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: 'rgba(26,115,232,0.08)',
              color: '#1A73E8',
            }}
          >
            View Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onTap(phone)}
      className="card-tap bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer"
    >
      <div className="w-full h-[160px] relative overflow-hidden bg-gradient-to-br from-[#F5F7FA] to-[#E8ECF0]">
        <img
          src={phone.image}
          alt={phone.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {phone.imeiVerified && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-[#1A7A4A] text-white px-2 py-1 rounded-md text-[9px] font-semibold">
            <Check size={10} strokeWidth={3} /> IMEI Verified
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-[#1A1D1F] truncate">{phone.name}</h3>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-bold text-[#1A1D1F]">{formatPrice(phone.price)}</span>
          {phone.originalPrice > phone.price && (
            <span className="text-xs text-[#9CA3AF] line-through">{formatPrice(phone.originalPrice)}</span>
          )}
        </div>
        <p className="text-[11px] text-[#6B7280] mt-1">{shop?.name} • {shop?.distance}</p>
        <span className="inline-block mt-1.5 bg-[rgba(26,115,232,0.08)] text-[#1A73E8] px-2 py-0.5 rounded text-[10px] font-medium">
          EMI From {formatPrice(emiAmount)}/month
        </span>
      </div>
    </div>
  );
}
