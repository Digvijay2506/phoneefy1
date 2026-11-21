import { useRef, useState } from 'react';
import { BadgeCheck, Check, MapPin, Navigation, Smartphone, Store } from 'lucide-react';
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

// Two full cards + a peek of the third on any phone (≈38% of the screen width each)
const CARD_WIDTH = 'w-[38vw] min-w-[128px] max-w-[168px]';

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
      className={`${CARD_WIDTH} flex-shrink-0 snap-start bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-transform`}
      data-testid="shop-card"
    >
      {/* Cover photo */}
      <div className="relative h-[84px] bg-gradient-to-br from-[#1A3A5C] to-[#0D1B2A]">
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
            <Store size={26} color="rgba(255,255,255,0.35)" />
          </div>
        )}
        {shop.verified && (
          <span
            title="Verified shop"
            className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 bg-[#1A7A4A] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md shadow"
          >
            <Check size={9} strokeWidth={3} /> Verified
          </span>
        )}
      </div>

      <div className="px-2.5 pt-2 pb-2.5">
        {/* Logo: only when the shop uploaded one. Sits above the cover so it's never cut off. */}
        {shop.logo && (
          <div
            data-testid="shop-logo"
            className="relative z-10 -mt-7 mb-1 w-9 h-9 rounded-full border-2 border-white bg-white overflow-hidden shadow"
          >
            <img src={shop.logo} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}

        <div className="flex items-center gap-1">
          <h3 className="text-[13px] font-bold text-[#1A1D1F] truncate">{shop.name}</h3>
          {shop.verified && <BadgeCheck size={13} color="#1A73E8" className="flex-shrink-0" />}
        </div>

        {where && (
          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#6B7280]">
            <MapPin size={11} className="flex-shrink-0" />
            <span className="truncate">{where}</span>
          </div>
        )}

        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#6B7280]">
          <Smartphone size={11} className="flex-shrink-0" />
          <span>
            <b className="text-[#1A1D1F]">{shop.listingCount}</b> {shop.listingCount === 1 ? 'phone' : 'phones'}
          </span>
        </div>

        {shop.distanceKm !== null && (
          <div className="mt-0.5 text-[11px] font-semibold text-[#1A73E8]">{formatDistance(shop.distanceKm)}</div>
        )}
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
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${CARD_WIDTH} flex-shrink-0 h-[168px] rounded-2xl bg-white animate-pulse`} />
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
