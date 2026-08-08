/**
 * offersStore.ts — In-memory offer management store.
 */

export type OfferType = 'percentage' | 'flat' | 'festival';

export interface Offer {
  id: string;
  name: string;
  type: OfferType;
  value: number;       // percentage or flat rupees
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  status: 'active' | 'expired' | 'scheduled';
  festivalName?: string; // for festival type
  appliedToAll: boolean;
  createdAt: number;
}

function computeStatus(offer: Pick<Offer, 'startDate' | 'endDate'>): 'active' | 'expired' | 'scheduled' {
  const now = new Date();
  const start = new Date(offer.startDate);
  const end = new Date(offer.endDate);
  if (now < start) return 'scheduled';
  if (now > end) return 'expired';
  return 'active';
}

const SEED_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    name: 'Monsoon Discount',
    type: 'percentage',
    value: 10,
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    status: 'active',
    appliedToAll: true,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'offer-2',
    name: 'Independence Day Special',
    type: 'festival',
    value: 15,
    startDate: '2026-08-10',
    endDate: '2026-08-20',
    status: 'scheduled',
    festivalName: 'Independence Day',
    appliedToAll: false,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'offer-3',
    name: 'Summer Sale',
    type: 'flat',
    value: 2000,
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'expired',
    appliedToAll: true,
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
  },
];

let _offers: Offer[] = [...SEED_OFFERS];
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach((fn) => fn());
}

export function subscribeOffers(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

export function getOffers(): Offer[] {
  return _offers.map((o) => ({ ...o, status: computeStatus(o) }));
}

export function getActiveOffers(): Offer[] {
  return getOffers().filter((o) => o.status === 'active');
}

export function getExpiredOffers(): Offer[] {
  return getOffers().filter((o) => o.status === 'expired');
}

export interface CreateOfferInput {
  name: string;
  type: OfferType;
  value: number;
  startDate: string;
  endDate: string;
  festivalName?: string;
  appliedToAll: boolean;
}

export function createOffer(input: CreateOfferInput): Offer {
  const offer: Offer = {
    ...input,
    id: `offer-${Date.now()}`,
    status: computeStatus(input),
    createdAt: Date.now(),
  };
  _offers = [offer, ..._offers];
  notify();
  return offer;
}

export function deleteOffer(id: string): void {
  _offers = _offers.filter((o) => o.id !== id);
  notify();
}
