import { useState, useEffect, useRef } from 'react';
import { Calculator } from 'lucide-react';
import { calculateEMI, formatPrice } from '../data';

interface EMICalculatorProps {
  price: number;
}

const monthOptions = [3, 6, 9, 12, 18, 24, 36];

export default function EMICalculator({ price }: EMICalculatorProps) {
  const [selectedMonths, setSelectedMonths] = useState(12);
  const [animateKey, setAnimateKey] = useState(0);
  const amountRef = useRef<HTMLDivElement>(null);

  const emi = calculateEMI(price, selectedMonths);

  useEffect(() => {
    setAnimateKey((k) => k + 1);
  }, [selectedMonths]);

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)',
        boxShadow: '0 8px 24px rgba(26,115,232,0.25)',
      }}
    >
      <div className="flex items-center gap-2">
        <Calculator size={20} color="white" />
        <h3 className="text-base font-bold text-white">0% Interest EMI Calculator</h3>
      </div>

      <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar snap-x">
        {monthOptions.map((months) => (
          <button
            key={months}
            onClick={() => setSelectedMonths(months)}
            className="chip-tap snap-start flex-shrink-0 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all duration-200 select-none"
            style={{
              background: selectedMonths === months ? 'white' : 'rgba(255,255,255,0.15)',
              color: selectedMonths === months ? '#1A73E8' : 'rgba(255,255,255,0.8)',
            }}
          >
            {months}M
          </button>
        ))}
      </div>

      <div className="mt-5 text-center" ref={amountRef}>
        <p className="text-xs text-white/70">Monthly EMI</p>
        <div
          key={animateKey}
          className="animate-emi-pop inline-flex items-baseline gap-1 mt-1"
        >
          <span className="text-[28px] font-bold text-white">{formatPrice(emi)}</span>
          <span className="text-sm text-white/70">/month</span>
        </div>
        <p className="text-xs text-white/50 mt-1">for {selectedMonths} months at 0% interest</p>
      </div>
    </div>
  );
}
