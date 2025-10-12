<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { onDestroy, onMount } from 'svelte';
	import type { Map as LeafletMap, LatLngTuple } from 'leaflet';

	interface Props {
		initialCenter?: LatLngTuple;
		initialZoom?: number;
		onMapReady?: (map: LeafletMap) => void;
	}

	let mapElement: HTMLElement;
	let map: LeafletMap;
	let L: typeof import('leaflet');
	let markers: L.Marker[] = [];

	let { initialCenter = [0, 0], initialZoom = 15, onMapReady }: Props = $props();

	onMount(async () => {
		L = await import('leaflet');

		if (mapElement) {
			map = L.map(mapElement).setView(initialCenter, initialZoom);

			L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
				subdomains: 'abcd',
				maxZoom: 20
			}).addTo(map);
		}

		onMapReady?.(map);
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

	onDestroy(() => {
		map?.remove();
	});
</script>

<div bind:this={mapElement} class="map"></div>

<style>
	.map {
		height: 100%;
		width: 100%;
		background-color: var(--color--foreground);
		z-index: 10;
	}
</style>

