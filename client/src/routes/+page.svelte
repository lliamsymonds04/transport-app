<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import TravelBar from '$lib/components/TravelBar.svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { getUserLocation } from '$lib/utils/getUserLocation';
	import type { MapboxFeature } from '$lib/types/mapboxFeature';
	import type { Map as LeafletMap, LatLngTuple } from 'leaflet';

	const Brisbane: LatLngTuple = [-27.4685, 153.0239];
	const defaultZoom = 15;
	let mapComponent: MapView;
	let mapElement = $state<LeafletMap | null>(null);
	let searchValue: MapboxFeature | null = $state(null);
	let userCoords: LatLngTuple = $state(Brisbane);
	let locationPermissionGranted = $state(false);
	let transitRoutes: string[] = $state([]);

	let sessionToken = uuidv4();

	$effect(() => {
		if (searchValue != null) {
			// hide live vehicle markers when a search is active
			mapComponent.hideClusterGroup();
		} else {
			// show live vehicle markers when no search is active and remove polylines/markers
			mapComponent.showClusterGroup();
			mapComponent.clearPolylines();
			mapComponent.clearMarkers();
			mapComponent.clearRouteMarkers();
		}
	});

	async function loadUserLocation() {
		try {
			const userLocation = await getUserLocation();
			console.log('User location:', userLocation);
			if (userLocation) {
				const coords: LatLngTuple = [userLocation.coords.latitude, userLocation.coords.longitude];
				mapComponent.setView(coords, defaultZoom);
				userCoords = coords;
				locationPermissionGranted = true;
			}
		} catch (error) {
			console.error('Error getting user location:', error);
		}
	}

	function handleMapReady(map: LeafletMap) {
		mapElement = map;
		mapComponent.setView(Brisbane, defaultZoom);

		loadUserLocation();
	}

	function handleSearch(mapboxFeature: MapboxFeature) {
		// zoom to the searched location
		if (mapElement && mapboxFeature.coordinates) {
			const coords: LatLngTuple = [
				mapboxFeature.coordinates.latitude,
				mapboxFeature.coordinates.longitude
			];
			mapElement.setView(coords, 15);

			// add a marker at the searched location
			mapComponent.clearMarkers();
			mapComponent.addMarker(coords[0], coords[1], mapboxFeature.name);
		}
	}

	function displayRoute(transitNames: string[], polylines: string[], isLineDotted: boolean[]) {
		if (!mapElement) return;
		mapComponent.clearPolylines();

		let transitIndex = 0;
		polylines.forEach((polylineStr, index) => {
			const dotted = isLineDotted[index];
			let name = '';
			if (!dotted && transitIndex < transitNames.length) {
				name = transitNames[transitIndex];
				transitIndex++;
			}
			mapComponent.drawPolyline(polylineStr, name, dotted, index == 0);
		});

		// add filter for live vehicles based on transitNames
		transitRoutes = transitNames;
	}
</script>

<div class="map-container">
	<MapView bind:this={mapComponent} onMapReady={handleMapReady} {transitRoutes} />

	<SearchBar onSearchSubmit={handleSearch} proximity={userCoords} {sessionToken} bind:searchValue />

	{#if searchValue}
		<TravelBar
			destination={searchValue}
			userLocation={userCoords}
			permissionGranted={locationPermissionGranted}
			{sessionToken}
			{displayRoute}
		/>
	{/if}
</div>

<style>
	.map-container {
		position: relative;
		height: 100vh;
		width: 100%;
	}
</style>
