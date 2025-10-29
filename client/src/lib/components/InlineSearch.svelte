<script lang="ts">
	import type { LatLngTuple } from 'leaflet';
	import type { MapboxFeature, MapboxSuggestion } from '$lib/types/mapboxFeature';
	import { fetchMapboxSuggestions, getFeatureDetails } from '$lib/utils/mapSearch';

	interface Props {
		onSearchSubmit: (feature: MapboxFeature) => void;
		sessionToken: string;
		locationPermissionGranted: boolean;
		proximity?: LatLngTuple;
	}

	let { onSearchSubmit, proximity, sessionToken, locationPermissionGranted }: Props = $props();

	let suggestion = $state<MapboxSuggestion | null>();
	let value = $state('');

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	async function fetchSuggestion(searchQuery: string) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			try {
				let suggestions = await fetchMapboxSuggestions(searchQuery, sessionToken, proximity);
				if (suggestions.length > 0) {
					suggestion = suggestions[0];
				} else {
					suggestion = null;
				}
			} catch (error) {
				suggestion = null;
				console.error('Error fetching suggestions:', error);
			}
		}, 300);
	}

	function suggestionMatchesInput() {
		return suggestion && suggestion.name.toLowerCase().startsWith(value.toLowerCase());
	}

	function completeSuggestion() {
		if (suggestion && suggestionMatchesInput()) {
			value = suggestion.name;
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!suggestion) return;
		if (suggestionMatchesInput()) {
			let feature = await getFeatureDetails(suggestion, sessionToken);

			onSearchSubmit(feature);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Tab' && suggestionMatchesInput()) {
			event.preventDefault();
			completeSuggestion();
		} else if (event.key === 'Enter') {
			handleSubmit(event);
		}
	}

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		value = input.value;
		fetchSuggestion(value);
	}
</script>

<!-- <input -->
<!-- 	type="text" -->
<!-- 	class="flex-1 ml-2 bg-transparent text-body font-semibold w-64" -->
<!-- 	placeholder={locationPermissionGranted ? 'Your Location' : 'Enter starting location'} -->
<!-- /> -->

<div class="relative flex-1 ml bg-transparent text-body font-semibold w-64">
	<!-- Ghost Input for Suggestion -->
	<input
		type="text"
		value={value + suggestion?.name.slice(value.length)}
		disabled
		class="absolute top-0 left-0 w-full bg-transparent text-gray-400 pointer-events-none"
	/>

	<input
		type="text"
		bind:value
		class="w-full border p-2 bg-transparent text-black relative z-10"
		oninput={handleInput}
		onkeydown={handleKeydown}
		placeholder={locationPermissionGranted ? 'Your Location' : 'Enter starting location'}
	/>
</div>
