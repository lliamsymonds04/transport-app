import type { Coordinates } from "./coordinates";

export interface MapboxFeature {
  id: string;
  place_name: string;
  coordinates: Coordinates;
}

export interface Suggestion {
  mapbox_id: string;
  name: string;
  address?: string;
}
