import { brands } from '../data';
import { brandLogos } from '../lib/brandLogos';

interface BrandChipProps {
  onTap: (brandName: string) => void;
}

/** The brand's logo (or a neat fallback if we don't have one). */
function BrandLogo({ name, color, letter }: { name: string; color: string; letter: string }) {
  const logo = brandLogos[name];
  if (logo) {
    const scale = Math.min(52 / logo.w, 24 / logo.h);
    return (
      <svg
        role="img"
        aria-label={`${name} logo`}
        viewBox={`${logo.x} ${logo.y} ${logo.w} ${logo.h}`}
        width={logo.w * scale}
        height={logo.h * scale}
      >
        <path d={logo.d} fill={logo.color} />
      </svg>
    );
  }
  if (name === 'Realme') {
    // No official vector available, so a clean text badge in realme's yellow
    return (
      <span
        role="img"
        aria-label="realme logo"
        className="px-1.5 py-[3px] rounded-md text-[12px] font-extrabold tracking-tight leading-none"
        style={{ background: '#FFC915', color: '#111' }}
      >
        realme
      </span>
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
      style={{ backgroundColor: color + '14', color }}
    >
      {letter}
    </div>
  );
}

export default function BrandChip({ onTap }: BrandChipProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x pb-1 px-4">
      {brands.map((brand) => (
        <button
          key={brand.name}
          onClick={() => onTap(brand.name)}
          aria-label={`Browse ${brand.name} phones`}
          className="chip-tap flex-shrink-0 snap-start flex flex-col items-center justify-between bg-white rounded-2xl shadow-sm w-[76px] h-[84px] pt-3.5 pb-2.5 px-1.5 select-none"
        >
          <div className="h-7 flex items-center justify-center">
            <BrandLogo name={brand.name} color={brand.color} letter={brand.letter} />
          </div>
          <span className="text-[11px] font-medium text-[#1A1D1F] text-center leading-none">{brand.name}</span>
        </button>
      ))}
    </div>
  );
}
