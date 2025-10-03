<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';
    import type { Map as LeafletMap, LatLngTuple } from 'leaflet';

	const Brisbane: LatLngTuple = [-27.4685, 153.0239];

    let mapElement = $state<HTMLElement>();
    let map = $state<LeafletMap>();
    

	onMount(async () => {
		const L = await import('leaflet');

        if (mapElement) {

            map = L.map(mapElement).setView(Brisbane, 13);

            L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
                attribution: '© Stadia Maps © OpenMapTiles © OpenStreetMap',
                maxZoom: 20
            }).addTo(map);
        }

	});
</script>

<div bind:this={mapElement}></div>

<style>
	div {
		height: 100vh;
		width: 100%;
	}
</style>
