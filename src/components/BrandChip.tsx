import { brands } from '../data';

interface BrandChipProps {
  onTap: (brandName: string) => void;
}

export default function BrandChip({ onTap }: BrandChipProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x pb-1 px-4">
      {brands.map((brand) => (
        <button
          key={brand.name}
          onClick={() => onTap(brand.name)}
          className="chip-tap flex-shrink-0 snap-start flex flex-col items-center justify-center gap-1.5 bg-white rounded-2xl shadow-sm w-[70px] h-[80px] p-2 select-none"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
            style={{
              backgroundColor: brand.color + '14',
              color: brand.color,
            }}
          >
            {brand.letter}
          </div>
          <span className="text-[11px] font-medium text-[#1A1D1F] text-center leading-none">
            {brand.name}
          </span>
        </button>
      ))}
    </div>
  );
}
