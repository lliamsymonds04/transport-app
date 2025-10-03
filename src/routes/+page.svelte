<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';
	import type { Map as LeafletMap, LatLngTuple } from 'leaflet';
    import { Ship, Bus, TrainFront } from 'lucide-svelte';

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

	function onSearchSubmit() {
		alert('Search functionality not implemented yet.');
	}

	let isTyping = false;

	function handleSearchInput(event: Event) {
		const input = event.target as HTMLInputElement;
		isTyping = input.value.length > 0;
	}
</script>

<div class="map-container">
	<div bind:this={mapElement} class="map"></div>
    
    <div class="search-container {isTyping ? 'search-container-top' : 'search-container-center'}">
        <div class="icons">
            <Ship size="40" color="var(--color-brand-primary)" />
            <Bus size="40" color="var(--color-brand-primary)" />
            <TrainFront size="40" color="var(--color-brand-primary)" />
        </div>

        <div class="search-box">
            <form onsubmit={() => onSearchSubmit()} class="search-form">
                <input type="text" placeholder="Search location..." oninput={handleSearchInput} />
                <button type="submit" disabled={!isTyping}>Search</button>
            </form>
        </div>
    </div>
	
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

	.search-box {
		background-color: var(--color-background-surface);
		padding: 10px;
		border-radius: 5px;
        width: 100%;
	}

    .search-container {
        display: flex;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;

        flex-direction: column;
        align-items: center;
        justify-items: center;
        gap: 12px;
        transition:
			top 0.3s ease,
			transform 0.3s ease,
			width 0.3s ease;
    }

	.search-container-center {
		top: 40%;
		transform: translate(-50%, -50%);
		width: 300px;
	}

	.search-container-top {
		top: 10px;
		transform: translateX(-50%);
		width: 500px;
	}

	.search-box .search-form {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.search-box input {
		flex: 1 1 auto;
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 16px;
	}

	.search-box button {
		flex: 0 0 auto;
		padding: 8px 12px;
		margin-left: 8px;
		border: none;
		background-color: var(--color-brand-primary);
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
		transition:
			background-color 0.2s,
			transform 0.2s;
	}

	.search-box button:hover {
		background-color: var(--color-brand-primary-hover);
		transform: translateY(-1px);
	}

    .icons {
        display: flex;
        justify-content: center;
        gap: 24px;
        width: 100%;
    }
</style>