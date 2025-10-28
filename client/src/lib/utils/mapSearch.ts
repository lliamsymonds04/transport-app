import type { LatLngTuple } from 'leaflet';
import { env } from '$env/dynamic/public';
import type { MapboxFeature, MapboxSuggestion, SuggestionRaw } from '$lib/types/mapboxFeature';

const MapboxApiKey = env.PUBLIC_MAPBOX_TOKEN;

export async function fetchMapboxSuggestions(
	searchQuery: string,
	sessionToken: string,
	proximity: LatLngTuple | undefined
): Promise<MapboxSuggestion[]> {
	if (searchQuery.length < 3) {
		return [];
	}

	let url =
		`https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(searchQuery)}` +
		`&session_token=${sessionToken}` +
		`&access_token=${MapboxApiKey}` +
		`&limit=5` +
		`&country=au` +
		`&types=address%2Cpoi`;

	if (proximity) {
		url += `&proximity=${proximity[1]},${proximity[0]}`;
	}

	const response = await fetch(url);

	const data = await response.json();
	return data.suggestions.map((suggestion: SuggestionRaw) => ({
		id: suggestion.mapbox_id,
		name: suggestion.name,
		address: suggestion.address,
		distance: suggestion.distance
	}));
}

export async function getFeatureDetails(
	suggestion: MapboxSuggestion,
	sessionToken: string
): Promise<MapboxFeature> {
	// Fetch detailed feature information based on the suggestion
	const url =
		`https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.id}` +
		`?session_token=${sessionToken}` +
		`&access_token=${MapboxApiKey}`;

	const response = await fetch(url);
	const data = await response.json();

	if (data.features && data.features.length > 0) {
		const feature = data.features[0];
		return {
			id: suggestion.id,
			name: suggestion.name,
			coordinates: feature.properties.coordinates
		};
	} else {
		throw new Error('No feature details found');
	}
}
