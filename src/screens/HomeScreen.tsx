import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Bell, TrendingUp } from 'lucide-react';
import { phones, formatPrice, loadCatalog } from '../data';
import type { Phone } from '../data';
import AdSlider from '../components/AdSlider';
import BrandChip from '../components/BrandChip';
import PhoneCard from '../components/PhoneCard';
import SkeletonCard from '../components/SkeletonCard';
import BottomNav from '../components/BottomNav';

interface HomeScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPhoneTap: (phone: Phone) => void;
  onSearchTap: (query?: string) => void;
}

const sectionContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const sectionItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } },
};

export default function HomeScreen({
  activeTab,
  onTabChange,
  onPhoneTap,
  onSearchTap,
}: HomeScreenProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadCatalog().then(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const featuredPhones = phones.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="flex items-start justify-between px-4 pt-12 pb-4"
        style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #1A3A5C 100%)' }}
      >
        <div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} color="rgba(255,255,255,0.6)" />
            <span className="text-xs text-white/60">Pune, Maharashtra</span>
          </div>
          <h1 className="text-[22px] font-bold text-white mt-1 leading-tight">
            Find Your Perfect
            <br />
            <span style={{ color: '#4DA6FF' }}>Pre-owned Phone</span>
          </h1>
        </div>
        <button className="btn-tap w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mt-1">
          <Bell size={20} color="white" />
        </button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
        className="px-4 -mt-5"
      >
        <motion.button
          onClick={() => onSearchTap()}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white rounded-2xl shadow-sm h-12 flex items-center gap-3 px-4"
        >
          <Search size={18} color="#6B7280" />
          <span className="text-sm text-[#9CA3AF]">Search phones, brands…</span>
        </motion.button>
      </motion.div>

      {/* Body */}
      <motion.div
        variants={sectionContainer}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto no-scrollbar pb-20"
      >
        {/* Ad Slider */}
        <motion.div variants={sectionItem} className="mt-5">
          <AdSlider />
        </motion.div>

        {/* Brands */}
        <motion.div variants={sectionItem} className="mt-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-base font-bold text-[#1A1D1F]">Browse by Brand</h2>
          </div>
          <BrandChip onTap={(brand) => onSearchTap(brand)} />
        </motion.div>

        {/* Featured Phones */}
        <motion.div variants={sectionItem} className="mt-5 px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} color="#1A73E8" />
              <h2 className="text-base font-bold text-[#1A1D1F]">Featured Listings</h2>
            </div>
            <button onClick={() => onSearchTap('')} className="text-sm font-semibold text-[#1A73E8]">
              See All
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {featuredPhones.map((phone) => (
                <PhoneCard key={phone.id} phone={phone} onTap={onPhoneTap} />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
