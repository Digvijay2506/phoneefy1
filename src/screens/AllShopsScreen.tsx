import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Star, MessageCircle, Store } from 'lucide-react';
import { shops, loadCatalog } from '../data';
import BottomNav from '../components/BottomNav';
import { trackShopViewed, trackWhatsAppClick, trackCallClick } from '@/lib/analytics';

interface AllShopsScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onShopTap: (shopId: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } },
};

export default function AllShopsScreen({ activeTab, onTabChange, onShopTap }: AllShopsScreenProps) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    let mounted = true;
    loadCatalog().then(() => {
      if (mounted) forceRender((n) => n + 1);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="flex items-center gap-3 px-4 pt-12 pb-5"
        style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #1A3A5C 100%)' }}
      >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <Store size={20} color="white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">All Shops</h1>
          <p className="text-xs text-white/60">{shops.length} verified shops near you</p>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 px-4 pt-4 pb-24 space-y-3"
      >
        {shops.map((shop) => (
          <motion.div
            key={shop.id}
            variants={item}
            whileHover={{ y: -2, boxShadow: '0 10px 24px rgba(15,23,42,0.10)' }}
            whileTap={{ scale: 0.985 }}
            onClick={() => { onShopTap(shop.id); trackShopViewed(shop.name, shop.distance); }}
            className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer"
          >
            <div className="flex items-start gap-3.5">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)' }}
              >
                {shop.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[#1A1D1F] truncate">{shop.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={12} fill="#F59E0B" color="#F59E0B" />
                  <span className="text-xs font-semibold text-[#1A1D1F]">{shop.rating}</span>
                  <span className="text-xs text-[#9CA3AF]">• {shop.listingCount} phones</span>
                </div>
                <div className="flex items-start gap-1 mt-1.5">
                  <MapPin size={12} color="#9CA3AF" className="mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#6B7280] leading-relaxed">{shop.address}</p>
                </div>
                {shop.distance && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={11} color="#1A73E8" className="flex-shrink-0" />
                    <span className="text-xs font-medium text-[#1A73E8]">{shop.distance}</span>
                  </div>
                )}
              </div>
              <button className="btn-tap flex-shrink-0 bg-[#1A73E8] text-white text-xs font-semibold px-4 py-2 rounded-xl">
                View
              </button>
            </div>

            <div className="flex gap-2 mt-3.5 pt-3.5 border-t border-[#F5F7FA]">
              <button
                onClick={(e) => { e.stopPropagation(); window.open(`tel:${shop.phone}`); trackCallClick('shop_directory', shop.name); }}
                className="btn-tap flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(26,115,232,0.08)', color: '#1A73E8' }}
              >
                <Phone size={13} /> Call
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${shop.phone.replace(/\D/g, '')}`); trackWhatsAppClick('shop_directory', shop.name, 0); }}
                className="btn-tap flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(37,211,102,0.08)', color: '#25D366' }}
              >
                <MessageCircle size={13} /> WhatsApp
              </button>
            </div>
          </motion.div>
        ))}

        {shops.length === 0 && (
          <div className="text-center text-sm text-[#9CA3AF] pt-16">No shops registered yet.</div>
        )}
      </motion.div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
