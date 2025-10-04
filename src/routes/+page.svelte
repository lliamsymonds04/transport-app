<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import type { Map as LeafletMap, LatLngTuple } from 'leaflet';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import type { MapboxFeature } from '$lib/types/mapboxFeature';

	const Brisbane: LatLngTuple = [-27.4685, 153.0239];
	let mapComponent: MapView;
	let mapElement = $state<LeafletMap | null>(null);

	function handleMapReady(map: LeafletMap) {
		mapElement = map;
		mapComponent.setView(Brisbane, 15);
	}


	function handleSearch(mapboxFeature: MapboxFeature) {
		// console.log('Search query:', query);
		// Implement search functionality here

		// zoom to the searched location
		if (mapElement && mapboxFeature.coordinates) {
			const coords: LatLngTuple = [mapboxFeature.coordinates.latitude, mapboxFeature.coordinates.longitude];
			mapElement.setView(coords, 15);

			// add a marker at the searched location
			mapComponent.addMarker(coords[0], coords[1], mapboxFeature.place_name);
			
		}
	}
	
</script>

<div class="map-container">
	<MapView bind:this={mapComponent} onMapReady={handleMapReady} />

	<SearchBar onSearchSubmit={handleSearch} proximity={Brisbane} />

</div>

<style>
	.map-container {
		position: relative;
		height: 100vh;
		width: 100%;
	}
</style>