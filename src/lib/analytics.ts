/**
 * analytics.ts — Central GA4 event tracking for Phoneefy
 *
 * All custom events show up in GA4 under:
 * Reports → Engagement → Events
 *
 * Events tracked:
 * - phone_viewed        : Customer opened a phone listing
 * - phone_image_swiped : Customer swiped through phone images
 * - whatsapp_click     : Customer clicked WhatsApp button
 * - call_click         : Customer clicked Call button
 * - shop_viewed        : Customer opened a shop profile
 * - search_performed   : Customer searched for a phone/brand
 * - brand_tapped       : Customer tapped a brand chip
 * - customer_signup    : New customer registered
 * - customer_login     : Customer logged in
 * - shopkeeper_login   : Shopkeeper logged in
 * - phone_listed       : Shopkeeper added a new phone
 * - phone_marked_sold  : Shopkeeper marked a phone as sold
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function track(eventName: string, params?: Record<string, string | number | boolean>) {
  let attempts = 0;
  const send = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params ?? {});
    } else if (attempts < 10) {
      attempts++;
      setTimeout(send, 300);
    }
  };
  send();
}

// ─── Customer-facing events ───────────────────────────────────────────────────

/** Call when a customer opens a phone listing detail screen */
export function trackPhoneViewed(phoneName: string, brand: string, price: number, shopName: string) {
  track('phone_viewed', {
    phone_name: phoneName,
    brand,
    price,
    shop_name: shopName,
    currency: 'INR',
  });
}

/** Call when a customer swipes to a different image in the gallery */
export function trackPhoneImageSwiped(phoneName: string, imageIndex: number) {
  track('phone_image_swiped', {
    phone_name: phoneName,
    image_index: imageIndex,
  });
}

/** Call when a customer clicks the WhatsApp button on a listing */
export function trackWhatsAppClick(phoneName: string, shopName: string, price: number) {
  track('whatsapp_click', {
    phone_name: phoneName,
    shop_name: shopName,
    price,
    currency: 'INR',
  });
}

/** Call when a customer clicks the Call button on a listing */
export function trackCallClick(phoneName: string, shopName: string) {
  track('call_click', {
    phone_name: phoneName,
    shop_name: shopName,
  });
}

/** Call when a customer opens a shop profile */
export function trackShopViewed(shopName: string, city: string) {
  track('shop_viewed', {
    shop_name: shopName,
    city,
  });
}

/** Call when a customer performs a search */
export function trackSearch(query: string, resultsCount: number) {
  track('search_performed', {
    search_term: query,
    results_count: resultsCount,
  });
}

/** Call when a customer taps a brand chip */
export function trackBrandTapped(brand: string) {
  track('brand_tapped', { brand });
}

/** Call when a new customer signs up */
export function trackCustomerSignup() {
  track('customer_signup');
}

/** Call when a customer logs in */
export function trackCustomerLogin() {
  track('customer_login');
}

// ─── Shopkeeper events ────────────────────────────────────────────────────────

/** Call when a shopkeeper logs in */
export function trackShopkeeperLogin(shopName: string) {
  track('shopkeeper_login', { shop_name: shopName });
}

/** Call when a shopkeeper adds a new phone listing */
export function trackPhoneListed(phoneName: string, brand: string, price: number) {
  track('phone_listed', {
    phone_name: phoneName,
    brand,
    price,
    currency: 'INR',
  });
}

/** Call when a shopkeeper marks a phone as sold */
export function trackPhoneMarkedSold(phoneName: string, brand: string, price: number) {
  track('phone_marked_sold', {
    phone_name: phoneName,
    brand,
    price,
    currency: 'INR',
  });
}
