import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  /** Controlled position (e.g. thumbnails / dots elsewhere on the page). Leave out to let the carousel manage itself. */
  index?: number;
  onIndexChange?: (index: number) => void;
  onImageClick?: (index: number) => void;
  /** Size of the carousel, e.g. "h-[190px]" */
  className?: string;
  /** Classes for each photo, e.g. "object-contain p-3" */
  imgClassName?: string;
  /** Little dots at the bottom (indicator only) */
  showDots?: boolean;
  /** Left/right buttons for mouse users (only appear on devices that can hover) */
  arrows?: boolean;
}

/**
 * Swipe left/right to change photo. Built on the browser's own scroll-snap,
 * so it feels native on phones and never fights with up/down page scrolling.
 */
export default function ImageCarousel({
  images,
  alt,
  index,
  onIndexChange,
  onImageClick,
  className = 'h-full',
  imgClassName = 'object-contain',
  showDots = true,
  arrows = false,
}: ImageCarouselProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [inner, setInner] = useState(index ?? 0);
  const current = index ?? inner;
  const settled = useRef(index ?? 0); // photo the scroller is currently showing
  const lockUntil = useRef(0); // ignore scroll events while we animate to a photo
  const frame = useRef(0);

  const width = () => scroller.current?.clientWidth || 0;

  const scrollToIndex = useCallback((i: number, smooth: boolean) => {
    const el = scroller.current;
    const w = el?.clientWidth || 0;
    if (!el || !w) return;
    settled.current = i;
    if (smooth) lockUntil.current = Date.now() + 450;
    el.scrollTo({ left: i * w, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Opening already on photo #3 (e.g. the full-screen viewer): start there, no animation
  useLayoutEffect(() => {
    if ((index ?? 0) > 0) scrollToIndex(index as number, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // The page changed the photo (thumbnail tapped, etc.): move to it
  useEffect(() => {
    if (index === undefined || index === settled.current) return;
    scrollToIndex(index, true);
  }, [index, scrollToIndex]);

  // Phone rotated / window resized: stay on the same photo
  useEffect(() => {
    const onResize = () => scrollToIndex(settled.current, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [scrollToIndex]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const handleScroll = () => {
    if (Date.now() < lockUntil.current) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = scroller.current;
      const w = width();
      if (!el || !w) return;
      const i = Math.max(0, Math.min(images.length - 1, Math.round(el.scrollLeft / w)));
      if (i !== settled.current) {
        settled.current = i;
        setInner(i);
        onIndexChange?.(i);
      }
    });
  };

  const go = (i: number) => {
    if (i < 0 || i > images.length - 1) return;
    setInner(i);
    onIndexChange?.(i);
    scrollToIndex(i, true);
  };

  const many = images.length > 1;

  return (
    <div className={`relative group ${className}`}>
      <div
        ref={scroller}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar overscroll-x-contain"
        data-testid="image-carousel"
      >
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="w-full h-full flex-shrink-0 snap-center snap-always">
            <img
              src={src}
              alt={i === 0 ? alt : `${alt} — photo ${i + 1}`}
              className={`w-full h-full select-none ${imgClassName}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
              onClick={onImageClick ? () => onImageClick(i) : undefined}
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0.15';
              }}
            />
          </div>
        ))}
      </div>

      {many && showDots && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none" aria-hidden="true">
          {images.map((_, i) => (
            <span
              key={i}
              data-dot={i === current ? 'active' : 'idle'}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === current ? 14 : 5,
                height: 5,
                background: i === current ? '#1A73E8' : 'rgba(26,35,50,0.28)',
              }}
            />
          ))}
        </div>
      )}

      {many && arrows && (
        <>
          {current > 0 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => { e.stopPropagation(); go(current - 1); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {current < images.length - 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => { e.stopPropagation(); go(current + 1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
