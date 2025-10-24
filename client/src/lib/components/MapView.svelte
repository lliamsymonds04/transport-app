<script lang="ts">
	import 'leaflet/dist/leaflet.css';
  import 'leaflet.markercluster/dist/MarkerCluster.css';
  import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
	import { onDestroy, onMount } from 'svelte';
	import type { Map as LeafletMap, LatLngTuple, MarkerClusterGroup } from 'leaflet';
	import polyline from '@mapbox/polyline';
	import { env } from '$env/dynamic/public';
  import { createVehicleMarker } from '$lib/utils/VehicleMarker.js';
  import type { VehicleInfo } from '@shared/vehicleInfo.js';
  const url = env.PUBLIC_SERVER_API_URL || 'http://localhost:3000';

	interface Props {
		initialCenter?: LatLngTuple;
		initialZoom?: number;
		onMapReady?: (map: LeafletMap) => void;
	}

	let mapElement: HTMLElement;
	let map: LeafletMap;
	let L: typeof import('leaflet');
	let markers: L.Marker[] = [];
	let polylines: L.Polyline[] = [];
  let vehicleUpdateInterval: ReturnType<typeof setInterval>;
  let clusterGroup: MarkerClusterGroup;

	let { initialCenter = [0, 0], initialZoom = 15, onMapReady }: Props = $props();
	let primaryColor: string = $state('#3388ff');
	let secondaryColor: string = $state('#ffffff');

	onMount(async () => {
    const leafletModule = await import('leaflet');
    L = leafletModule.default;
    
    await import('leaflet.markercluster');

		if (mapElement) {
			map = L.map(mapElement).setView(initialCenter, initialZoom);

			L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
				subdomains: 'abcd',
				maxZoom: 20
			}).addTo(map);
		}

		primaryColor = getComputedStyle(document.documentElement)
			.getPropertyValue('--color-primary')
			.trim();

		secondaryColor = getComputedStyle(document.documentElement)
			.getPropertyValue('--color-secondary')
			.trim();
		onMapReady?.(map);

    initTracking();
	});

	export function setView(center: LatLngTuple, zoom: number) {
		map?.setView(center, zoom);
	}

	export function getMap(): LeafletMap | undefined {
		return map;
	}

	export function addMarker(lat: number, lng: number, popupText?: string) {
		if (map) {
			const marker = L.marker([lat, lng]).addTo(map);
			if (popupText) {
				marker.bindPopup(popupText);
			}
			markers.push(marker);
			return marker;
		}
	}

	export function clearMarkers() {
		markers.forEach((marker) => map.removeLayer(marker));
		markers = [];
	}

	export function removeMarker(marker: L.Marker) {
		map.removeLayer(marker);
		markers = markers.filter((m) => m !== marker);
	}

	export function drawPolyline(encodedLine: string, isDotted: boolean = false) {
		if (map) {
			const points = polyline.decode(encodedLine).map(([lat, lng]) => [lat, lng] as LatLngTuple);
			const line = L.polyline(points, {
				color: isDotted ? secondaryColor : primaryColor,
				dashArray: isDotted ? '5, 10' : '',
				opacity: 0.8,
				weight: 5,
				lineJoin: 'round',
				lineCap: 'round'
			}).addTo(map);
			polylines.push(line);
		}
	}

	export function fitPolylines() {
		if (map && polylines.length > 0) {
			const group = L.featureGroup(polylines);
			map.fitBounds(group.getBounds());
		}
	}

	export function clearPolylines() {
		if (map && polylines.length > 0) {
			polylines.forEach((line) => map.removeLayer(line));
			polylines.length = 0;
		}
	}

  // Live Vehicle Tracking
  function initTracking() {
    createClusterGroup();
    updateVehicleLocations()

    vehicleUpdateInterval = setInterval(() => {
      updateVehicleLocations();
    }, 60000);
  }

  async function updateVehicleLocations() {
    try {
      const response = await fetch(`${url}/vehicle-locations`);

      if (!response.ok) {
        throw new Error('Failed to fetch vehicle locations');
      }

      const data: VehicleInfo[] = await response.json();

      clearVehicleMarkers();
      console.log(data.length + ' vehicles tracked');

      data.forEach((vehicle) => {
        addVehicleMarker(vehicle);
      });
      clusterGroup.refreshClusters();
    } catch {
      console.error('Error fetching vehicle locations');
      clearVehicleMarkers();
    }
  }

  function clearVehicleMarkers() {
    clusterGroup.clearLayers();
  }

  async function addVehicleMarker(vehicle: VehicleInfo) {
    const icon = await createVehicleMarker(vehicle, 35);

    if (!vehicle.latitude || !vehicle.longitude) {
      return;
    }

    const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon })
      .bindPopup(`Route: ${vehicle.route} <br>Type: ${vehicle.vehicleType}`);

    clusterGroup.addLayer(marker);
  }

  function createClusterGroup() {
    clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      disableClusteringAtZoom: 18,
      animateAddingMarkers: false,
    });
    map.addLayer(clusterGroup);
  }

	onDestroy(() => {
		map?.remove();

    // if the interval is set clear it
    if (vehicleUpdateInterval) {
      clearInterval(vehicleUpdateInterval);
    }
	});
</script>

<div bind:this={mapElement} class="map"></div>

<style>
	.map {
		height: 100%;
		width: 100%;
		background-color: var(--color--foreground);
		z-index: 0;
	}
</style>
