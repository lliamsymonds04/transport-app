import type { RoutesAPIResponse } from '@shared/routeTypes.js';
const RouteEndpoint = 'https://routes.googleapis.com/directions/v2:computeRoutes';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export async function getRoute(start: LatLng, end: LatLng): Promise<RoutesAPIResponse> {
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
        'X-Goog-FieldMask': 'routes.polyline,routes.legs.steps.transitDetails,routes.legs.steps.polyline,routes.legs.steps.travelMode'
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
  console.log(data);
  return data;
}
