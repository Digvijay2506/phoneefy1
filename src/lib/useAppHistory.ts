import { useCallback, useEffect, useRef } from 'react';

/**
 * useAppHistory — makes the phone's back gesture / browser back button move
 * between the app's own screens instead of leaving the website.
 *
 * Phoneefy switches screens with React state (no URLs), so the browser only
 * ever sees ONE page. Pressing back therefore jumps straight out of the site
 * (e.g. back to WhatsApp). This hook adds a browser-history entry every time
 * the screen changes, and restores the matching screen on back.
 *
 * `route` must contain an `m` field (the "mode", e.g. customer vs dashboard).
 * History entries from a different mode (e.g. from before the shopkeeper
 * logged in) are skipped automatically.
 */
export function useAppHistory<T extends { m: string }>(
  route: T,
  apply: (route: T) => void,
  enabled: boolean,
) {
  const key = JSON.stringify(route);
  const routeRef = useRef(route);
  routeRef.current = route;
  const applyRef = useRef(apply);
  applyRef.current = apply;

  const lastKey = useRef<string | null>(null); // null = not started yet
  const idx = useRef(0); // position of the current in-app history entry

  // Start tracking, then add one history entry per screen change
  useEffect(() => {
    if (!enabled) return;

    if (lastKey.current === null) {
      // First time: just label the entry we are already on (no new entry)
      const st = window.history.state;
      idx.current = typeof st?.__idx === 'number' ? st.__idx : 0;
      lastKey.current = key;
      window.history.replaceState({ ...(st || {}), __route: routeRef.current, __idx: idx.current }, '');
      return;
    }

    if (key === lastKey.current) return;
    lastKey.current = key;
    idx.current += 1;
    window.history.pushState({ __route: routeRef.current, __idx: idx.current }, '');
  }, [key, enabled]);

  // Phone back gesture / browser back (and forward)
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (lastKey.current === null) return;
      const st = e.state;
      if (!st || !st.__route) return;

      idx.current = typeof st.__idx === 'number' ? st.__idx : 0;
      const target = st.__route as T;

      // Entry belongs to a different mode (e.g. before login) → keep going back
      if (target.m !== routeRef.current.m) {
        window.history.back();
        return;
      }

      lastKey.current = JSON.stringify(target);
      applyRef.current(target);
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /** In-app back button: go back one screen. Uses `fallback` if there is no earlier screen. */
  const back = useCallback((fallback: () => void) => {
    if (idx.current > 0) window.history.back();
    else fallback();
  }, []);

  return { back };
}
