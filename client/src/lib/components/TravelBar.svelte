<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { Locate } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { formatRouteResponse } from '$lib/utils/formatRouteResponse';
	import type { MapboxFeature } from '$lib/types/mapboxFeature';
	import type { LatLngTuple } from 'leaflet';
	import type { RoutesAPIResponse } from '@shared/routeTypes';
	import type { TransitRoute } from '$lib/types/transitRoute';

	const url = env.PUBLIC_SERVER_API_URL || 'http://localhost:3000';

	interface Props {
		destination: MapboxFeature;
		userLocation: LatLngTuple;
		permissionGranted: boolean;
		drawPolylines: (polylines: string[], isLineDotted: boolean[]) => void;
	}

	let { destination, userLocation, permissionGranted, drawPolylines }: Props = $props();

	let loadingTravelOptions = $state(false);
	let travelOptions: TransitRoute[] = $state([]);
	let selectionOption: number | null = $state(null);
	let selectedRoute: TransitRoute | null = $derived.by(() => {
		return selectionOption !== null ? travelOptions[selectionOption] : null;
	});

	async function fetchTravelOptions(start: LatLngTuple) {
		loadingTravelOptions = true;

		try {
			// join the coords to the url
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

			const data = (await response.json()) as RoutesAPIResponse;
			travelOptions = data.routes.map((route) => formatRouteResponse(route));
			selectionOption = 0; // Automatically select the first option

			console.log('Fetched travel options:', travelOptions);

			const route0 = data.routes[0];

			const polylines = route0.legs.flatMap((leg) =>
				leg.steps.map((step) => step.polyline.encodedPolyline)
			);

			const isDotted = route0.legs.flatMap((leg) =>
				leg.steps.map((step) => step.travelMode === 'WALK')
			);

			drawPolylines(polylines, isDotted);
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
			{#if selectedRoute}
				<div class="mt-2 p-2 border border-primary rounded">
					<p class="text-body">
						<span class="font-bold">{Math.round(selectedRoute.duration / 60)} mins</span>, {selectedRoute.distance}
						km}
					</p>
					<!-- Add more details as needed -->
					{#each selectedRoute.legs as leg, legIndex}
						<div class="mt-2">
							<p class="text-body font-semibold">Leg {legIndex + 1}:</p>
							<p class="text-body font-semibold">{leg.transitType}:</p>
							{#if leg.transitDetails}
								<p class="text-body">Line: {leg.transitDetails.shortName}</p>
								<p class="text-body">From: {leg.transitDetails.leaveStop} at {leg.leaveTime}</p>
								<p class="text-body">To: {leg.transitDetails.arrivalStop} at {leg.arrivalTime}</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
