<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import type { Map as LeafletMap, LatLngTuple } from 'leaflet';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import MapView from '$lib/components/MapView.svelte';

	const Brisbane: LatLngTuple = [-27.4685, 153.0239];
	let mapComponent: MapView;
	let mapElement = $state<LeafletMap | null>(null);

	function handleMapReady(map: LeafletMap) {
		mapElement = map;
		mapComponent.setView(Brisbane, 15);
	}


	function handleSearch(query: string) {
		console.log('Search query:', query);
		// Implement search functionality here
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