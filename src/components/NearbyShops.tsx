import { useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, Check, MapPin, Navigation, Store } from 'lucide-react';
import { formatDistance } from '../data';
import type { ShopWithDistance } from '../data';
import type { LocationStatus } from '../lib/useUserLocation';

interface NearbyShopsProps {
  shops: ShopWithDistance[];
  loading: boolean;
  locationStatus: LocationStatus;
  onRequestLocation: () => void;
  onShopTap: (shopId: string) => void;
  onSeeAll: () => void;
}

/** The little "show nearest first" prompt under the section title */
export function LocationChip({
  status,
  onRequest,
  className = '',
}: {
  status: LocationStatus;
  onRequest: () => void;
  className?: string;
}) {
  if (status === 'granted') return null;
  if (status === 'asking') {
    return <p className={`text-xs text-[#6B7280] ${className}`}>Finding your location…</p>;
  }
  if (status === 'denied') {
    return (
      <p className={`text-xs text-[#6B7280] ${className}`}>
        Location is off, so we're showing all shops. Turn it on in your browser settings to see distances.
      </p>
    );
  }
  return (
    <button
      type="button"
      onClick={onRequest}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A73E8] bg-[rgba(26,115,232,0.08)] px-3 py-1.5 rounded-full ${className}`}
    >
      <Navigation size={12} />
      {status === 'unavailable' ? "Couldn't get your location — try again" : 'Show nearest shops first'}
    </button>
  );
}

function ShopCard({ shop, onTap }: { shop: ShopWithDistance; onTap: () => void }) {
  const where = shop.city || shop.address;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${shop.name}`}
      onClick={onTap}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(); } }}
      className="w-[80%] max-w-[320px] flex-shrink-0 snap-start bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
      data-testid="shop-card"
    >
      {/* Cover photo */}
      <div className="relative h-[112px] bg-gradient-to-br from-[#1A3A5C] to-[#0D1B2A]">
        {shop.coverImage ? (
          <img
            src={shop.coverImage}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store size={34} color="rgba(255,255,255,0.35)" />
          </div>
        )}
        {shop.verified && (
          <span
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1A7A4A] flex items-center justify-center shadow"
            title="Verified shop"
          >
            <Check size={14} color="white" strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="px-3 pb-3">
        {/* Logo overlapping the cover */}
        <div className="-mt-6 w-12 h-12 rounded-full border-2 border-white bg-[#1A73E8] overflow-hidden flex items-center justify-center text-white font-bold shadow">
          {shop.logo ? (
            <img src={shop.logo} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            shop.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex items-center gap-1 mt-1.5">
          <h3 className="text-[15px] font-bold text-[#1A1D1F] truncate">{shop.name}</h3>
          {shop.verified && <BadgeCheck size={15} color="#1A73E8" className="flex-shrink-0" />}
        </div>

        {where && (
          <div className="flex items-center gap-1 mt-0.5 text-xs text-[#6B7280]">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{where}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#6B7280]">
            <b className="text-[#1A1D1F]">{shop.listingCount}</b> {shop.listingCount === 1 ? 'phone' : 'phones'}
            {shop.distanceKm !== null && (
              <>
                {' · '}
                <span className="text-[#1A73E8] font-semibold">{formatDistance(shop.distanceKm)}</span>
              </>
            )}
          </span>
          <span className="w-7 h-7 rounded-full bg-[#F5F7FA] flex items-center justify-center">
            <ArrowRight size={14} color="#1A1D1F" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function NearbyShops({
  shops,
  loading,
  locationStatus,
  onRequestLocation,
  onShopTap,
  onSeeAll,
}: NearbyShopsProps) {
  const row = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (!loading && shops.length === 0) return null;

  const handleScroll = () => {
    const el = row.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const step = first.offsetWidth + 12; // card + gap
    if (!step) return;
    setActive(Math.max(0, Math.min(shops.length - 1, Math.round(el.scrollLeft / step))));
  };

  return (
    <div>
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-2">
          <Store size={16} color="#1A73E8" />
          <h2 className="text-base font-bold text-[#1A1D1F]">Shops Near You</h2>
        </div>
        <button onClick={onSeeAll} className="text-sm font-semibold text-[#1A73E8]">
          See All
        </button>
      </div>

      <LocationChip status={locationStatus} onRequest={onRequestLocation} className="mx-4 mb-3" />

      {loading ? (
        <div className="flex gap-3 px-4 overflow-hidden">
          {[0, 1].map((i) => (
            <div key={i} className="w-[80%] flex-shrink-0 h-[212px] rounded-2xl bg-white animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div
            ref={row}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-4 no-scrollbar px-4 pb-1"
          >
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} onTap={() => onShopTap(shop.id)} />
            ))}
          </div>
          {shops.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3" aria-hidden="true">
              {shops.map((s, i) => (
                <span
                  key={s.id}
                  data-dot={i === active ? 'active' : 'idle'}
                  className="rounded-full transition-all duration-200"
                  style={{ width: i === active ? 16 : 6, height: 6, background: i === active ? '#1A73E8' : '#CBD5E1' }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
