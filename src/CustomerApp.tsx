import { useState, useEffect } from 'react';
import { useShopkeeperSession } from './contexts/ShopkeeperSessionContext';
import { useCustomerSession } from './contexts/CustomerSessionContext';
import { loadCatalog } from './data';

// Components
import BottomNav from './components/BottomNav';
import DashboardNav from './components/DashboardNav';

// Customer Screens
import LandingScreen from './screens/LandingScreen';
import CustomerLoginScreen from './screens/CustomerLoginScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import DeviceDetailScreen from './screens/DeviceDetailScreen';
import ShopProfileScreen from './screens/ShopProfileScreen';
import AllShopsScreen from './screens/AllShopsScreen';
import ShopkeeperLoginScreen from './screens/ShopkeeperLoginScreen';
import PlaceholderScreen from './screens/PlaceholderScreen';

// Dashboard Screens
import DashboardHome from './screens/dashboard/DashboardHome';
import InventoryScreen from './screens/dashboard/InventoryScreen';
import PhoneFormScreen from './screens/dashboard/PhoneFormScreen';
import SubscriptionScreen from './screens/dashboard/SubscriptionScreen';
import ShopkeeperProfileScreen from './screens/dashboard/ShopkeeperProfileScreen';

// New Dashboard Screens
import AnalyticsScreen from './screens/dashboard/AnalyticsScreen';
import OffersScreen from './screens/dashboard/OffersScreen';
import NotificationsScreen from './screens/dashboard/NotificationsScreen';
import SettingsScreen from './screens/dashboard/SettingsScreen';
import HelpSupportScreen from './screens/dashboard/HelpSupportScreen';
import SoldInventoryScreen from './screens/dashboard/SoldInventoryScreen';
import ActivityHistoryScreen from './screens/dashboard/ActivityHistoryScreen';

// Store
import type { InventoryPhone } from './store/phoneStore';
import type { Phone } from './data';

// ─── App-level types ─────────────────────────────────────────────────────────

type CustomerTab = 'home' | 'search' | 'shops' | 'deals' | 'profile';

type DashboardTab = 'dashboard' | 'inventory' | 'subscription' | 'profile';

type DashboardScreen =
  | DashboardTab
  | 'addPhone'
  | 'editPhone'
  | 'soldInventory'
  | 'analytics'
  | 'offers'
  | 'notifications'
  | 'settings'
  | 'help'
  | 'activityHistory';

// Which dashboard tabs show the bottom nav
const DASH_NAV_TABS: DashboardTab[] = ['dashboard', 'inventory', 'subscription', 'profile'];

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { shop, loading: sessionLoading, logout } = useShopkeeperSession();
  const { customer, loading: customerSessionLoading, logout: customerLogout } = useCustomerSession();

  // Mode — driven by whether a shopkeeper is actually signed in
  const isDashboard = Boolean(shop);

  // Kick off the public catalog fetch as early as possible, regardless of
  // which screen ends up mounting first.
  useEffect(() => {
    loadCatalog();
  }, []);

  // Customer side
  const [hasEnteredCustomerMode, setHasEnteredCustomerMode] = useState(false);
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [showAllShops, setShowAllShops] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // If a customer session is restored on reload, skip straight past the landing screen
  useEffect(() => {
    if (customer) setHasEnteredCustomerMode(true);
  }, [customer]);

  // Dashboard side
  const [dashTab, setDashTab] = useState<DashboardTab>('dashboard');
  const [dashScreen, setDashScreen] = useState<DashboardScreen>('dashboard');
  const [editingPhone, setEditingPhone] = useState<InventoryPhone | null>(null);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const goToDashScreen = (screen: string) => {
    setDashScreen(screen as DashboardScreen);
    // Keep the tab in sync for known tab screens
    if (DASH_NAV_TABS.includes(screen as DashboardTab)) {
      setDashTab(screen as DashboardTab);
    }
  };

  const handleDashTabChange = (tab: string) => {
    setDashTab(tab as DashboardTab);
    setDashScreen(tab as DashboardScreen);
  };

  const handleDashBack = () => {
    // Return to whichever nav tab was active
    setDashScreen(dashTab);
  };

  const handleLogout = async () => {
    await logout();
    setDashScreen('dashboard');
    setDashTab('dashboard');
    setHasEnteredCustomerMode(false);
  };

  // ─── Render: restoring an existing session ───────────────────────────────

  if (sessionLoading || customerSessionLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ background: '#E8ECF0' }}>
        <div className="w-8 h-8 border-2 border-[#1A73E8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Render: Customer mode ────────────────────────────────────────────────

  if (!isDashboard) {
    // Landing — choose Customer Login, Guest, or Shopkeeper before anything else
    if (!hasEnteredCustomerMode && !showLogin && !showCustomerLogin) {
      return (
        <div className="flex justify-center min-h-screen" style={{ background: '#0D47A1' }}>
          <div className="w-full max-w-[390px] relative">
            <LandingScreen
              onSelectCustomerLogin={() => setShowCustomerLogin(true)}
              onSelectGuest={() => setHasEnteredCustomerMode(true)}
              onSelectShopkeeper={() => setShowLogin(true)}
            />
          </div>
        </div>
      );
    }

    // Customer login/signup screen
    if (showCustomerLogin) {
      return (
        <div className="flex justify-center min-h-screen" style={{ background: '#E8ECF0' }}>
          <div className="w-full max-w-[390px] relative">
            <CustomerLoginScreen
              onDone={() => { setShowCustomerLogin(false); setHasEnteredCustomerMode(true); }}
              onBack={() => setShowCustomerLogin(false)}
            />
          </div>
        </div>
      );
    }

    // Shopkeeper login screen
    if (showLogin) {
      return (
        <div className="flex justify-center min-h-screen" style={{ background: '#E8ECF0' }}>
          <div className="w-full max-w-[390px] relative">
            <ShopkeeperLoginScreen
              onLogin={() => setShowLogin(false)}
              onBack={() => setShowLogin(false)}
            />
          </div>
        </div>
      );
    }

    // Device Detail
    if (selectedPhoneId) {
      return (
        <div className="flex justify-center min-h-screen" style={{ background: '#E8ECF0' }}>
          <div className="w-full max-w-[390px] relative">
            <DeviceDetailScreen
              phoneId={selectedPhoneId}
              onBack={() => setSelectedPhoneId(null)}
              onShopTap={(shopId) => { setSelectedPhoneId(null); setSelectedShopId(shopId); }}
            />
          </div>
        </div>
      );
    }

    // Shop Profile
    if (selectedShopId) {
      return (
        <div className="flex justify-center min-h-screen" style={{ background: '#E8ECF0' }}>
          <div className="w-full max-w-[390px] relative">
            <ShopProfileScreen
              shopId={selectedShopId}
              onBack={() => setSelectedShopId(null)}
              onPhoneTap={(phone: Phone) => { setSelectedShopId(null); setSelectedPhoneId(phone.id); }}
            />
          </div>
        </div>
      );
    }

    // All Shops
    if (showAllShops) {
      return (
        <div className="flex justify-center min-h-screen" style={{ background: '#E8ECF0' }}>
          <div className="w-full max-w-[390px] relative">
            <AllShopsScreen
              onBack={() => setShowAllShops(false)}
              onShopTap={(shopId) => { setShowAllShops(false); setSelectedShopId(shopId); }}
            />
          </div>
        </div>
      );
    }

    // Search
    if (customerTab === 'search') {
      return (
        <div className="flex justify-center min-h-screen" style={{ background: '#E8ECF0' }}>
          <div className="w-full max-w-[390px] relative">
            <SearchScreen
              initialQuery={searchQuery}
              activeTab={customerTab}
              onTabChange={(tab) => { setCustomerTab(tab as CustomerTab); setSearchQuery(''); }}
              onPhoneTap={(phone: Phone) => setSelectedPhoneId(phone.id)}
              onShopTap={(shopId) => setSelectedShopId(shopId)}
            />
          </div>
        </div>
      );
    }

    // Placeholder tabs (deals, shops)
    if (customerTab === 'deals' || customerTab === 'shops') {
      return (
        <div className="flex justify-center min-h-screen" style={{ background: '#E8ECF0' }}>
          <div className="w-full max-w-[390px] relative">
            <PlaceholderScreen
              tabKey={customerTab}
              activeTab={customerTab}
              onTabChange={(tab) => setCustomerTab(tab as CustomerTab)}
            />
          </div>
        </div>
      );
    }

    // Profile tab
    if (customerTab === 'profile') {
      return (
        <div className="flex justify-center min-h-screen" style={{ background: '#E8ECF0' }}>
          <div className="w-full max-w-[390px] relative flex flex-col min-h-screen">
            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 pb-20">
              {customer ? (
                <>
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)' }}
                  >
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-[#1A1D1F]">{customer.name}</h2>
                    <p className="text-sm text-[#6B7280] mt-1">{customer.phone}</p>
                  </div>
                  <button
                    onClick={async () => { await customerLogout(); setHasEnteredCustomerMode(false); setCustomerTab('home'); }}
                    className="btn-tap w-full h-12 rounded-2xl text-sm font-semibold text-red-500 bg-red-50 border border-red-200"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-sm font-medium text-[#1A73E8]"
                  >
                    Are you a shopkeeper? Sign in here
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)' }}
                  >
                    <span className="text-3xl">👤</span>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-[#1A1D1F]">You're browsing as a guest</h2>
                    <p className="text-sm text-[#6B7280] mt-2">
                      Sign in to save favourites, track offers, and check out faster.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCustomerLogin(true)}
                    className="btn-tap w-full h-14 rounded-2xl text-white font-semibold text-base"
                    style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)' }}
                  >
                    Log In / Sign Up
                  </button>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="btn-tap w-full h-14 rounded-2xl text-[#1A1D1F] font-semibold text-base bg-white border border-[#E5E7EB]"
                  >
                    Sign in as Shopkeeper
                  </button>
                </>
              )}
            </div>
            <BottomNav activeTab={customerTab} onTabChange={(tab) => setCustomerTab(tab as CustomerTab)} />
          </div>
        </div>
      );
    }

    // Home
    return (
      <div className="flex justify-center min-h-screen" style={{ background: '#E8ECF0' }}>
        <div className="w-full max-w-[390px] relative">
          <HomeScreen
            activeTab={customerTab}
            onTabChange={(tab) => setCustomerTab(tab as CustomerTab)}
            onPhoneTap={(phone: Phone) => setSelectedPhoneId(phone.id)}
            onShopTap={(shopId) => setSelectedShopId(shopId)}
            onSearchTap={(query) => { setSearchQuery(query ?? ''); setCustomerTab('search'); }}
            onAllShopsTap={() => setShowAllShops(true)}
          />
        </div>
      </div>
    );
  }

  // ─── Render: Dashboard mode ───────────────────────────────────────────────

  const showDashNav = DASH_NAV_TABS.includes(dashScreen as DashboardTab);

  return (
    <div className="flex justify-center min-h-screen" style={{ background: '#E8ECF0' }}>
      <div className="w-full max-w-[390px] relative">
        {/* Screen routing */}
        {dashScreen === 'dashboard' && (
          <DashboardHome
            onNavigate={goToDashScreen}
            shopName={shop?.name ?? ''}
            ownerName={shop?.owner ?? ''}
          />
        )}

        {dashScreen === 'inventory' && (
          <InventoryScreen
            onAddPhone={() => { setEditingPhone(null); setDashScreen('addPhone'); }}
            onEditPhone={(phone) => { setEditingPhone(phone); setDashScreen('editPhone'); }}
            onSoldInventory={() => setDashScreen('soldInventory')}
          />
        )}

        {dashScreen === 'subscription' && (
          <SubscriptionScreen />
        )}

        {dashScreen === 'profile' && (
          <ShopkeeperProfileScreen
            onNavigateHelp={() => setDashScreen('help')}
          />
        )}

        {/* Phone form screens */}
        {dashScreen === 'addPhone' && (
          <PhoneFormScreen
            onSave={() => setDashScreen('inventory')}
            onBack={handleDashBack}
          />
        )}

        {dashScreen === 'editPhone' && editingPhone && (
          <PhoneFormScreen
            phone={editingPhone}
            onSave={() => { setEditingPhone(null); setDashScreen('inventory'); }}
            onBack={handleDashBack}
          />
        )}

        {/* New screens */}
        {dashScreen === 'analytics' && (
          <AnalyticsScreen onBack={handleDashBack} />
        )}

        {dashScreen === 'offers' && (
          <OffersScreen onBack={handleDashBack} />
        )}

        {dashScreen === 'notifications' && (
          <NotificationsScreen onBack={handleDashBack} />
        )}

        {dashScreen === 'settings' && (
          <SettingsScreen
            onBack={handleDashBack}
            onLogout={handleLogout}
          />
        )}

        {dashScreen === 'help' && (
          <HelpSupportScreen onBack={handleDashBack} />
        )}

        {dashScreen === 'soldInventory' && (
          <SoldInventoryScreen onBack={handleDashBack} />
        )}

        {dashScreen === 'activityHistory' && (
          <ActivityHistoryScreen onBack={handleDashBack} />
        )}

        {/* Dashboard bottom nav */}
        {showDashNav && (
          <DashboardNav activeTab={dashTab} onTabChange={handleDashTabChange} />
        )}
      </div>
    </div>
  );
}
