import { useEffect, useRef, useState } from 'react';
import { banners } from '../data';

export default function AdSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        if (scrollRef.current) {
          const scrollWidth = scrollRef.current.scrollWidth / banners.length;
          scrollRef.current.scrollTo({
            left: scrollWidth * next,
            behavior: 'smooth',
          });
        }
        return next;
      });
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const itemWidth = scrollRef.current.scrollWidth / banners.length;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="px-4">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x rounded-2xl"
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="snap-center flex-shrink-0 w-full rounded-2xl overflow-hidden relative"
            style={{ minWidth: 'calc(100% - 0px)', height: '180px' }}
          >
            <img
              src={banner.image}
              alt={banner.headline}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
            <div className="glass absolute left-4 top-1/2 -translate-y-1/2 rounded-2xl p-4 max-w-[55%]">
              <p className="text-[10px] font-medium text-white/80 uppercase tracking-wider">
                {banner.shopName}
              </p>
              <p className="text-base font-bold text-white mt-1 leading-tight">
                {banner.headline}
              </p>
              <p className="text-xs text-white/70 mt-1">
                {banner.subheadline}
              </p>
              <button className="mt-2.5 bg-white text-[#1A73E8] text-[11px] font-semibold px-4 py-1.5 rounded-full btn-tap">
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-2.5">
        {banners.map((_, idx) => (
          <div
            key={idx}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: activeIndex === idx ? '20px' : '6px',
              backgroundColor: activeIndex === idx ? '#1A73E8' : '#E5E7EB',
              borderRadius: activeIndex === idx ? '3px' : '9999px',
            }}
          />
        ))}
      </div>
    </div>
  );
}
