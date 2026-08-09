import { motion } from 'framer-motion';
import { Smartphone, Store, ChevronRight } from 'lucide-react';

interface LandingScreenProps {
  onSelectCustomerLogin: () => void;
  onSelectGuest: () => void;
  onSelectShopkeeper: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } },
};

export default function LandingScreen({ onSelectCustomerLogin, onSelectGuest, onSelectShopkeeper }: LandingScreenProps) {
  return (
    <div
      className="relative flex flex-col min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0D47A1 0%, #1A73E8 45%, #0F172A 100%)' }}
    >
      {/* Floating decorative orbs */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 220, height: 220, top: -60, right: -60, background: 'rgba(255,255,255,0.08)' }}
        animate={{ y: [0, 18, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 160, height: 160, bottom: 60, left: -50, background: 'rgba(255,255,255,0.06)' }}
        animate={{ y: [0, -16, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      <motion.div
        className="relative flex-1 flex flex-col items-center justify-center px-7 z-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Logo */}
        <motion.div
          variants={item}
          className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-xl mb-5"
          initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.05 }}
        >
          <span className="text-3xl font-black" style={{ color: '#1A73E8' }}>P</span>
        </motion.div>

        <motion.h1 variants={item} className="text-3xl font-bold text-white tracking-tight">
          Phoneefy
        </motion.h1>
        <motion.p variants={item} className="text-sm text-white/70 mt-1.5 text-center max-w-[260px]">
          Verified pre-owned phones from trusted local shops
        </motion.p>

        {/* Entry cards */}
        <motion.div variants={item} className="w-full mt-10 space-y-3">
          <motion.button
            onClick={onSelectCustomerLogin}
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-lg text-left"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)' }}
            >
              <Smartphone size={22} color="white" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-[#1A1D1F]">Customer Login</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Sign in or create an account</p>
            </div>
            <ChevronRight size={18} color="#9CA3AF" />
          </motion.button>

          <motion.button
            onClick={onSelectGuest}
            whileTap={{ scale: 0.96 }}
            className="w-full text-center py-1"
          >
            <span className="text-sm font-medium text-white/75 underline underline-offset-2">
              Continue as Guest
            </span>
          </motion.button>

          <motion.button
            onClick={onSelectShopkeeper}
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            className="w-full rounded-2xl p-4 flex items-center gap-4 shadow-lg text-left mt-2"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/15">
              <Store size={22} color="white" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-white">Shopkeeper Login</p>
              <p className="text-xs text-white/65 mt-0.5">Manage your shop and listings</p>
            </div>
            <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 text-center text-xs text-white/50 pb-8"
      >
        &copy; {new Date().getFullYear()} Phoneefy
      </motion.p>
    </div>
  );
}
