<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { Locate } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import type { MapboxFeature } from '$lib/types/mapboxFeature';
	import type { LatLngTuple } from 'leaflet';

	const url = env.PUBLIC_SERVER_API_URL || 'http://localhost:3000';

	interface Props {
		destination: MapboxFeature;
		userLocation: LatLngTuple;
		permissionGranted: boolean;
	}

	let { destination, userLocation, permissionGranted }: Props = $props();

	let loadingTravelOptions = $state(false);

	async function fetchTravelOptions(start: LatLngTuple) {
		loadingTravelOptions = true;

		// Simulate an API call to fetch travel options
		try {
			// joing the coords to the url
			const params = new URLSearchParams({
				startLat: start[0].toString(),
				startLng: start[1].toString(),
				endLat: destination.coordinates.latitude.toString(),
				endLng: destination.coordinates.longitude.toString()
			});

			const response = await fetch(`${url}/route?${params.toString()}`);

			if (!response.ok) {
				throw new Error('Failed to fetch travel options');
			}

			const data = await response.json();

			console.log('Travel options data:', data);
		} finally {
			loadingTravelOptions = false;
		}
	}

	onMount(() => {
		if (destination && userLocation) {
			fetchTravelOptions(userLocation);
		}
	});
</script>

<div
	class="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 bg-surface rounded-md p-4"
	transition:slide={{ duration: 400, axis: 'y' }}
>
	<div class="flex flex-row gap-2 items-center">
		<Locate class="text-primary" />
		<input
			type="text"
			class="flex-1 ml-2 bg-transparent text-body font-semibold w-64"
			placeholder={permissionGranted ? 'Your Location' : 'Enter starting location'}
		/>
	</div>

	<div class="border-border border-b-1 w-full my-2"></div>

	{#if loadingTravelOptions}
		<p class="text-body mt-2">Loading travel options...</p>
	{:else if destination}
		<div class="mt-2">
			<p class="text-body font-semibold">To: {destination.name}</p>
			<!-- Display travel options here -->
			<p class="text-body">(Travel options would be displayed here)</p>
		</div>
	{/if}
</div>
