import type { RoutesAPIResponse } from '@shared/routeTypes';
import { get, set } from './cache.js';
const RouteEndpoint = 'https://routes.googleapis.com/directions/v2:computeRoutes';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export async function getRoute(start: LatLng, end: LatLng): Promise<RoutesAPIResponse> {
  const cacheKey = `${start.latitude},${start.longitude},${end.latitude},${end.longitude}`;
  const cachedresponse = get(cacheKey);
  if (cachedresponse) {
    return cachedresponse;
  }

  // Todo: add leave time and arrival time options
  const api_key = process.env.GOOGLE_MAPS_API_KEY;
  if (!api_key) {
    throw new Error('GOOGLE_MAPS_API_KEY is not set in environment variables');
  }

  const resp = await fetch(
    RouteEndpoint,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,
        //'X-Goog-FieldMask': '*'
        'X-Goog-FieldMask': 'routes.legs.distanceMeters,routes.legs.duration,routes.legs.steps.staticDuration,routes.legs.steps.travelMode,routes.legs.steps.polyline,routes.legs.steps.transitDetails'
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: start,
          },
        },
        destination: {
          location: {
            latLng: end,
          },
        },
        travelMode: 'TRANSIT',
        // computeAlternativeRoutes: false,
        languageCode: "en-AU",
        units: "METRIC"
      }),
    }
  );

  if (!resp.ok) {
    throw new Error(`Failed to fetch route: ${resp.statusText}`);
  }

  const data = (await resp.json()) as RoutesAPIResponse;
  if (data.routes && data.routes.length > 0) {
    //set(cacheKey, data.routes[0]);
    set(cacheKey, data);
  }
  return data;
}
