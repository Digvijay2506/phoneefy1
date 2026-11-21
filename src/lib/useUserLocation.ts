import { useCallback, useEffect, useState } from 'react';
import type { Coords } from '../data';

export type LocationStatus = 'idle' | 'asking' | 'granted' | 'denied' | 'unavailable';

// Shared between every screen so the customer is only asked once.
let cached: Coords | null = null;
let status: LocationStatus =
  typeof navigator !== 'undefined' && 'geolocation' in navigator ? 'idle' : 'unavailable';
const listeners = new Set<() => void>();

function setStatus(next: LocationStatus) {
  status = next;
  listeners.forEach((l) => l());
}

function ask() {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    setStatus('unavailable');
    return;
  }
  setStatus('asking');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      cached = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setStatus('granted');
    },
    (err) => setStatus(err.code === 1 ? 'denied' : 'unavailable'), // 1 = permission denied
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
  );
}

/**
 * The customer's location, used only inside their own browser to work out
 * "how far is each shop". It is never sent to or stored on our servers.
 *
 * We never pop up the permission box by surprise: the customer taps
 * "Show nearest shops first". If they allowed it on an earlier visit, we use it silently.
 */
export function useUserLocation() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const l = () => rerender((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  useEffect(() => {
    if (status !== 'idle') return;
    const perms = typeof navigator !== 'undefined' ? navigator.permissions : undefined;
    perms
      ?.query({ name: 'geolocation' as PermissionName })
      .then((p) => {
        if (p.state === 'granted' && status === 'idle') ask();
      })
      .catch(() => {});
  }, []);

  const request = useCallback(() => ask(), []);

  return { coords: cached, status, request };
}
