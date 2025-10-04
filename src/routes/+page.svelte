<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';
	import type { Map as LeafletMap, LatLngTuple } from 'leaflet';
	import SearchBar from '$lib/components/SearchBar.svelte';

	const Brisbane: LatLngTuple = [-27.4685, 153.0239];

	let mapElement: HTMLElement;
	let map: LeafletMap;

	onMount(async () => {
		const L = await import('leaflet');

		if (mapElement) {
			map = L.map(mapElement).setView(Brisbane, 15);

			L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
				subdomains: 'abcd',
				maxZoom: 20
			}).addTo(map);
		}
	});

	function handleSearch(query: string) {
		console.log('Search query:', query);
		// Implement search functionality here
	}
	
</script>

<div class="map-container">
	<div bind:this={mapElement} class="map"></div>

	<SearchBar onSearchSubmit={handleSearch} />

</div>

<style>
	.map-container {
		position: relative;
		height: 100vh;
		width: 100%;
	}

	.map {
		height: 100%;
		width: 100%;
		background-color: var(--color--foreground);
	}
</style>