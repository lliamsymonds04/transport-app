<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import type { Map as LeafletMap, LatLngTuple } from 'leaflet';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import TravelBar from '$lib/components/TravelBar.svelte';
	import { getUserLocation } from '$lib/utils/getUserLocation';
	import type { MapboxFeature } from '$lib/types/mapboxFeature';

	const Brisbane: LatLngTuple = [-27.4685, 153.0239];
	const defaultZoom = 15;
	let mapComponent: MapView;
	let mapElement = $state<LeafletMap | null>(null);
	let searchValue: MapboxFeature | null = $state(null);
	let userCoords: LatLngTuple = $state(Brisbane);
	let locationPermissionGranted = $state(false);
  
	$effect(() => {
		if (searchValue != null) {
			// hide live vehicle markers when a search is active
			mapComponent.hideClusterGroup();
		} else {
      // show live vehicle markers when no search is active and remove polylines/markers
      mapComponent.showClusterGroup();
      mapComponent.clearPolylines();
      mapComponent.clearMarkers();
    }
  })

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

	function drawPolylines(polylines: string[], isLineDotted: boolean[]) {
		if (!mapElement) return;
		mapComponent.clearPolylines();

		polylines.forEach((polylineStr, index) => {
			const dotted = isLineDotted[index];
			mapComponent.drawPolyline(polylineStr, dotted);
		});
	}
</script>

<div class="map-container">
	<MapView bind:this={mapComponent} onMapReady={handleMapReady} />

	<SearchBar onSearchSubmit={handleSearch} proximity={userCoords} bind:searchValue />

	{#if searchValue}
		<TravelBar
			destination={searchValue}
			userLocation={userCoords}
			permissionGranted={locationPermissionGranted}
			{drawPolylines}
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
