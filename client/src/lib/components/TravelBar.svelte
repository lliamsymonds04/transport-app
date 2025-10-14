<script lang="ts">
	import { onMount } from 'svelte';
	import { Locate } from 'lucide-svelte';
	import type { MapboxFeature } from '$lib/types/mapboxFeature';
	import type { LatLngTuple } from 'leaflet';

	interface Props {
		destination: MapboxFeature;
		userLocation: LatLngTuple;
		permissionGranted: boolean;
	}

	let { destination, userLocation, permissionGranted }: Props = $props();

	async function fetchTravelOptions(start: LatLngTuple) {
		
	}

	onMount(() => {
		if (destination && userLocation) {
			fetchTravelOptions(userLocation);
		}
	});
</script>

<div
	class="absolute bottom-4 left-1/2 -translate-x-1/2 -translate-y-full z-10 bg-surface rounded-md p-4"
>
	<div class="flex flex-row gap-2">
		<Locate class="text-primary" />
		<input
			type="text"
			class="flex-1 ml-2 bg-transparent text-body font-semibold w-64"
			placeholder={permissionGranted ? 'Your Location' : 'Enter starting location'}
		/>
	</div>
</div>