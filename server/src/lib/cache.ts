
import type { Route } from "@shared/routeTypes";

const cache = new Map<string, { route: Route, timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function get(key: string): Route | null {
  const cached = cache.get(key);
  if (!cached) {
    return null;
  }

  const isExpired = (Date.now() - cached.timestamp) > CACHE_DURATION_MS;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.route;
}

export function set(key: string, route: Route) {
  cache.set(key, { route, timestamp: Date.now() });
}
