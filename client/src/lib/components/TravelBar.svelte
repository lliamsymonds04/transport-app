<script lang="ts">
	import { onMount } from 'svelte';
	import { Locate, ArrowBigRight } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import type { MapboxFeature } from '$lib/types/mapboxFeature';
	import type { LatLngTuple } from 'leaflet';

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
		await new Promise((resolve) => setTimeout(resolve, 2000));

		loadingTravelOptions = false;
	}

	onMount(() => {
		if (destination && userLocation) {
			fetchTravelOptions(userLocation);
		}
	});
</script>

<div
	class="absolute bottom-4 left-1/2 -translate-x-1/2 -translate-y-full z-10 bg-surface rounded-md p-4"
	transition:slide={{ duration: 400, axis: 'y' }}
>
	<div class="flex flex-row gap-2">
		<Locate class="text-primary" />
		<ArrowBigRight class="text-secondary text-sm" />
		<input
			type="text"
			class="flex-1 ml-2 bg-transparent text-body font-semibold w-64"
			placeholder={permissionGranted ? '-> Your Location' : 'Enter starting location'}
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
