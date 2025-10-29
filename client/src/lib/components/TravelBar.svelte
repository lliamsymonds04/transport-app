<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteDate, SvelteURLSearchParams } from 'svelte/reactivity';
	import { env } from '$env/dynamic/public';
	import { Locate, Footprints, Bus } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { formatRouteResponse } from '$lib/utils/formatRouteResponse';
	import { formatTime, getISOTimeFromHHMM } from '$lib/utils/formatTime';
	import InlineSearch from './InlineSearch.svelte';
	import type { MapboxFeature } from '$lib/types/mapboxFeature';
	import type { LatLngTuple } from 'leaflet';
	import type { RoutesAPIResponse } from '@shared/routeTypes';
	import type { TransitRoute } from '$lib/types/transitRoute';

	const url = env.PUBLIC_SERVER_API_URL || 'http://localhost:3000';

	interface Props {
		destination: MapboxFeature;
		userLocation: LatLngTuple;
		permissionGranted: boolean;
		sessionToken: string;
		displayRoute: (transitNames: string[], polylines: string[], isLineDotted: boolean[]) => void;
	}

	let { destination, userLocation, permissionGranted, sessionToken, displayRoute }: Props =
		$props();

	let loadingTravelOptions = $state(false);
	let travelOptions: TransitRoute[] = $state([]);
	let selectionOption: number | null = $state(null);
	let selectedRoute: TransitRoute | null = $derived.by(() => {
		return selectionOption !== null ? travelOptions[selectionOption] : null;
	});

	let arriveTime: string | null = $derived.by(() => {
		if (selectedRoute && selectedRoute.legs.length > 0) {
			const lastLeg = selectedRoute.legs[selectedRoute.legs.length - 1];
			if (lastLeg.arrivalTime) return formatTime(lastLeg.arrivalTime) || null;
		}
		return null;
	});

	let leaveTime: string | null = $derived.by(() => {
		if (selectedRoute && selectedRoute.legs.length > 0) {
			const firstLeg = selectedRoute.legs[0];
			if (firstLeg.leaveTime) return formatTime(firstLeg.leaveTime) || null;
		}
		return null;
	});

	// Time selection logic
	type Mode = 'leaveNow' | 'depart' | 'arrive';
	let mode = $state<Mode>('leaveNow');
	let userSelectedTime = $state('');

	const pad = (n: number) => n.toString().padStart(2, '0');

	async function fetchTravelOptions(start: LatLngTuple) {
		loadingTravelOptions = true;

		try {
			// join the coords to the url
			const params = new SvelteURLSearchParams({
				startLat: start[0].toString(),
				startLng: start[1].toString(),
				endLat: destination.coordinates.latitude.toString(),
				endLng: destination.coordinates.longitude.toString()
			});

			if (mode == 'depart') {
				params.append('departureTime', getISOTimeFromHHMM(userSelectedTime));
			} else if (mode == 'arrive') {
				params.append('arrivalTime', getISOTimeFromHHMM(userSelectedTime));
			}

			const response = await fetch(`${url}/route?${params.toString()}`);

			if (!response.ok) {
				throw new Error('Failed to fetch travel options');
			}

			const data = (await response.json()) as RoutesAPIResponse;
			travelOptions = data.routes.map((route) => formatRouteResponse(route));
			selectionOption = 0; // Automatically select the first option

			const route0 = data.routes[0];

			const polylines = route0.legs.flatMap((leg) =>
				leg.steps.map((step) => step.polyline.encodedPolyline)
			);

			const isDotted = route0.legs.flatMap((leg) =>
				leg.steps.map((step) => step.travelMode === 'WALK')
			);

			const transitNames: string[] = [];
			travelOptions[selectionOption].legs.forEach((leg) => {
				if (leg.transitDetails) {
					transitNames.push(leg.transitDetails.shortName);
				}
			});

			displayRoute(transitNames, polylines, isDotted);
		} finally {
			loadingTravelOptions = false;
		}
	}

	function handleModeChange(event: Event) {
		mode = (event.target as HTMLSelectElement).value as Mode;

		if (mode === 'leaveNow') {
			userSelectedTime = '';
			return;
		}

		let now = new SvelteDate();
		if (mode == 'arrive') {
			now.setHours(now.getHours() + 1);
		}
		const roundedMinutes = Math.round(now.getMinutes() / 5) * 5;
		userSelectedTime = `${pad(now.getHours())}:${pad(roundedMinutes % 60)}`;
	}

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	function handleTimeChange() {
		//const input = event.target as HTMLInputElement;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (userLocation && destination) {
				fetchTravelOptions(userLocation);
			}
		}, 1000);
	}

	onMount(() => {
		mode = 'leaveNow';
		userSelectedTime = '';
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
		<InlineSearch
			locationPermissionGranted={permissionGranted}
			{sessionToken}
			proximity={destination
				? ([destination.coordinates.latitude, destination.coordinates.longitude] as LatLngTuple)
				: undefined}
			onSearchSubmit={(feature: MapboxFeature) => {
				console.log('New starting location selected:', feature);
				fetchTravelOptions([feature.coordinates.latitude, feature.coordinates.longitude]);
			}}
		/>
	</div>

	<!-- Time selection -->
	<div class="flex flex-row items-center gap-2 mt-4">
		<select id="mode" onchange={handleModeChange} bind:value={mode}>
			<option value="leaveNow">Leave now</option>
			<option value="depart">Depart at</option>
			<option value="arrive">Arrive by</option>
		</select>

		{#if mode !== 'leaveNow'}
			<input type="time" bind:value={userSelectedTime} onchange={handleTimeChange} step="300" />
		{/if}
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
					{#if arriveTime && leaveTime}
						<p class="text-body">
							From: {leaveTime} - {arriveTime}
						</p>
					{/if}
					<p class="text-body">
						<span class="font-bold">
							{Math.round(selectedRoute.duration / 60)} mins
						</span>, {selectedRoute.distance}km
					</p>

					<div class="border-border border-b-1 w-full my-2"></div>
					<!-- Add more details as needed -->
					{#each selectedRoute.legs as leg, i (i)}
						<div class="mt-2">
							{#if leg.transitType === 'Walk'}
								<div class="flex flex-row items-center gap-2">
									<Footprints class="inline-block mr-1" />
									<p class="text-body">for {Math.round(leg.duration / 60)} minutes</p>
								</div>
							{:else if leg.transitType === 'Transit' && leg.transitDetails && leg.leaveTime}
								<div class="flex flex-row items-start gap-2">
									<Bus class="inline-block mr-1" />
									<div>
										<div class="flex flex-row items-center gap-2">
											<p class="text-body font-bold">{leg.transitDetails.shortName}</p>
											<p>at {formatTime(leg.leaveTime)}</p>
										</div>
										<p>from: {leg.transitDetails.leaveStop}</p>
										<p>to: {leg.transitDetails.arrivalStop}</p>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
