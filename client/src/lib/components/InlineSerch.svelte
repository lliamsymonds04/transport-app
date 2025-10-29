<script lang="ts">
	import type { LatLngTuple } from 'leaflet';
	import type { MapboxFeature, MapboxSuggestion } from '$lib/types/mapboxFeature';
	import { fetchMapboxSuggestions, getFeatureDetails } from '$lib/utils/mapSearch';

	interface Props {
		onSearchSubmit: (feature: MapboxFeature) => void;
		searchValue: MapboxFeature | null;
		sessionToken: string;
		proximity?: LatLngTuple;
	}

	let { onSearchSubmit, proximity, searchValue = $bindable(), sessionToken }: Props = $props();
</script>
