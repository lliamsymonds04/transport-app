import type { Coordinates } from "./coordinates";

export interface MapboxFeature {
  id: string;
  name: string;
  coordinates: Coordinates;
}

export interface MapboxSuggestion {
  id: string;
  name: string;
  address?: string;
  distance?: number;
}

export interface SuggestionRaw {
	mapbox_id: string;
	name: string;
	address: string;
	distance?: number;
}
