
import type { RoutesAPIResponse } from "@shared/routeTypes.js";

const cache = new Map<string, { route: RoutesAPIResponse, timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function get(key: string): RoutesAPIResponse | null {
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

export function set(key: string, route: RoutesAPIResponse) {
  cache.set(key, { route, timestamp: Date.now() });
}
