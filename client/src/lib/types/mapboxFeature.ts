import type { Coordinates } from "./coordinates";
export interface MapboxFeature {
    id: string;
    place_name: string;
    coordinates: Coordinates;
}
