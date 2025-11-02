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
		transitRoutes: string[];
		initialCenter?: LatLngTuple;
		initialZoom?: number;
		onMapReady?: (map: LeafletMap) => void;
	}

	let mapElement: HTMLElement;
	let map: LeafletMap;
	let L: typeof import('leaflet');
	let markers: L.Marker[] = [];
	let polylines: L.Polyline[] = [];
	let circles: L.Circle[] = [];
	let vehicleUpdateInterval: ReturnType<typeof setInterval>;
	let clusterGroup: MarkerClusterGroup;
	let routeClusterGroup: MarkerClusterGroup;
	let vehicleInfoList: VehicleInfo[] = [];

	let { transitRoutes, initialCenter = [0, 0], initialZoom = 15, onMapReady }: Props = $props();
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

	$effect(() => {
		applyRouteFilter(transitRoutes);
	});

	export function setView(center: LatLngTuple, zoom: number) {
		map?.setView(center, zoom);
	}

	export function getMap(): LeafletMap | undefined {
		return map;
	}

	// Markers
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

	// Polyline Management
	export function addCircleMarker(
		lat: number,
		lng: number,
		radius: number,
		color: string = secondaryColor
	) {
		if (map) {
			const circle = L.circle([lat, lng], {
				color: color,
				fillColor: color,
				fillOpacity: 0.5,
				radius: radius
			}).addTo(map);
			circles.push(circle);
			return circle;
		}
	}

	export function drawPolyline(
		encodedLine: string,
		name?: string,
		isDotted = false,
		isFirst = false
	) {
		if (map) {
			const points = polyline.decode(encodedLine).map(([lat, lng]) => [lat, lng] as LatLngTuple);
			const color = isDotted ? secondaryColor : primaryColor;
			const line = L.polyline(points, {
				color: color,
				dashArray: isDotted ? '5, 10' : '',
				opacity: 0.8,
				weight: isDotted ? 5 : 6,
				lineJoin: 'round',
				lineCap: 'round'
			}).addTo(map);
			polylines.push(line);

			if (name) {
				line.bindTooltip(name, {
					permanent: false,
					sticky: true,
					className: 'polyline-tooltip'
				});
			}

			if (isFirst) {
				addCircleMarker(points[0][0], points[0][1], 8, color); // Start point
			}

			if (!isDotted) {
				//addCircleMarker(points[0][0], points[0][1], 8, color); // Start point
				addCircleMarker(points[points.length - 1][0], points[points.length - 1][1], 8, color); // End point
			}
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
			circles.forEach((circle) => map.removeLayer(circle));
			polylines.length = 0;
			circles.length = 0;
		}
	}

	// Live Vehicle Tracking
	function initTracking() {
		//create the cluster group for live tracking
		clusterGroup = createDefaultClusterGroup();
		showClusterGroup();

		// create the route cluster group for journeys
		routeClusterGroup = createDefaultClusterGroup();
		map.addLayer(routeClusterGroup);

		updateVehicleLocations();

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

			vehicleInfoList = await response.json();

			clearVehicleMarkers();

			vehicleInfoList.forEach(async (vehicle) => {
				const marker = await vehicleMarkerHelper(vehicle);
				if (marker) {
					clusterGroup.addLayer(marker);
				}
			});
			clusterGroup.refreshClusters();

			applyRouteFilter(transitRoutes);
		} catch {
			console.error('Error fetching vehicle locations');
			clearVehicleMarkers();
		}
	}

	function clearVehicleMarkers() {
		clusterGroup.clearLayers();
		routeClusterGroup.clearLayers();
	}

	async function vehicleMarkerHelper(vehicle: VehicleInfo) {
		const icon = await createVehicleMarker(vehicle, 35);

		if (!vehicle.latitude || !vehicle.longitude) {
			return;
		}

		const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon }).bindPopup(
			`Route: ${vehicle.route} <br>Type: ${vehicle.vehicleType}`
		);

		return marker;
	}

	function createDefaultClusterGroup() {
		return L.markerClusterGroup({
			showCoverageOnHover: false,
			zoomToBoundsOnClick: true,
			maxClusterRadius: 50,
			spiderfyOnMaxZoom: true,
			removeOutsideVisibleBounds: true,
			disableClusteringAtZoom: 18,
			animateAddingMarkers: false
		});
	}

	function filterVehiclesByRoute(routeNames: string[]) {
		const filteredResult: number[] = [];

		vehicleInfoList.forEach((vehicle, index) => {
			if (vehicle.route && routeNames.includes(vehicle.route)) {
				filteredResult.push(index);
			}
		});

		return filteredResult;
	}

	function applyRouteFilter(routeNames: string[]) {
		if (!map) return;
		const filteredIndexes = filterVehiclesByRoute(routeNames);
		routeClusterGroup.clearLayers();

		filteredIndexes.forEach((index) => {
			vehicleMarkerHelper(vehicleInfoList[index]).then((marker) => {
				if (marker) {
					routeClusterGroup.addLayer(marker);
				}
			});
		});

		routeClusterGroup.refreshClusters();
	}

	export function hideClusterGroup() {
		if (!map) return;
		map.removeLayer(clusterGroup);
	}

	export function showClusterGroup() {
		if (!map) return;
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
