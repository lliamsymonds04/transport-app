<script lang="ts">
	import { Ship, Bus, TrainFront } from 'lucide-svelte';
	import { metersToKilometers } from '$lib/utils/metersToKilometers';
	import type { LatLngTuple } from 'leaflet';
	import type { MapboxFeature, MapboxSuggestion } from '$lib/types/mapboxFeature';
	import { fetchMapboxSuggestions, getFeatureDetails } from '$lib/utils/mapSearch';

	interface Props {
		onSearchSubmit: (feature: MapboxFeature) => void;
		searchValue: MapboxFeature | null;
		sessionToken: string;
		proximity?: LatLngTuple;
	}

	let { onSearchSubmit, sessionToken, proximity, searchValue = $bindable() }: Props = $props();
	let query = $state('');
	let suggestions = $state<MapboxSuggestion[]>([]);
	let isLoading = $state(false);
	let isTyping = $derived(query.length > 0);
	let showSuggestions = $derived(suggestions.length > 0);
	let selectedIndex = $state(-1);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	async function fetchSuggestions(searchQuery: string) {
		isLoading = true;
		try {
			suggestions = await fetchMapboxSuggestions(searchQuery, sessionToken, proximity);
		} catch (error) {
			suggestions = [];
			console.error('Error fetching suggestions:', error);
		} finally {
			isLoading = false;
		}
	}

	async function selectSuggestion(suggestion: MapboxSuggestion) {
		query = suggestion.name;
		showSuggestions = false;
		suggestions = [];

		try {
			const feature = await getFeatureDetails(suggestion, sessionToken);
			searchValue = feature;

			onSearchSubmit(feature);
		} catch (error) {
			console.error('Error fetching feature details:', error);
		}
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		if (query.trim()) {
			if (suggestions.length > 0 && selectedIndex >= 0) {
				selectSuggestion(suggestions[selectedIndex]);
			} else if (suggestions.length > 0) {
				selectSuggestion(suggestions[0]);
			}
		}
	}

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		query = input.value;
		selectedIndex = -1;

		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// clear searchValue if query is cleared or changed
		if (query.length == 0 || (searchValue && searchValue?.name != query)) {
			searchValue = null;
		}

		debounceTimer = setTimeout(() => {
			fetchSuggestions(query);
		}, 300);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showSuggestions || suggestions.length === 0) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = (selectedIndex + 1) % suggestions.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length;
		} else if (event.key === 'Escape') {
			showSuggestions = false;
			selectedIndex = -1;
		}
	}

	function handleBlur() {
		setTimeout(() => {
			showSuggestions = false;
			selectedIndex = -1;
			isLoading = false;
		}, 200);
	}
</script>

<div
	class="search-container"
	class:search-container-center={!isTyping}
	class:search-container-top={isTyping}
>
	<div class="icons">
		<Ship size="40" class="text-off-white" />
		<Bus size="40" class="text-off-white" />
		<TrainFront size="40" class="text-off-white" />
	</div>

	<div class="relative bg-surface p-2 rounded-md w-full">
		<form onsubmit={handleSubmit} class="flex flex-row gap-4 items-center">
			<input
				class="flex-1 bg-input border border-border
        text-body focus:outline-none focus:ring-2
          focus:ring-primary focus:border-transparent px-4 py-2 rounded-md w-full"
				type="text"
				placeholder="Search location..."
				oninput={handleInput}
				onkeydown={handleKeydown}
				onblur={handleBlur}
				bind:value={query}
			/>
			<button
				type="submit"
				class="bg-primary text-off-white px-4 py-2 rounded-md font-semibold
          hover:bg-primary-hover transition disabled:opacity-80 disabled:cursor-not-allowed"
				disabled={!isTyping}>Search</button
			>
		</form>

		{#if showSuggestions || isLoading}
			<div
				class="absolute top-full bg-surface w-full mt-1
        rounded-md shadow-lg max-h-300 left-0 border border-border"
			>
				{#if isLoading}
					<p class="text-body px-3 py-2 font-semibold">Loading...</p>
				{/if}

				{#each suggestions as suggestion, index (suggestion.id)}
					<button
						type="button"
						class="w-full flex flex-row items-center justify-between text-left px-3 py-2 cursor-pointer transition-colors border-0 {index ===
						selectedIndex
							? 'bg-primary text-white'
							: 'bg-transparent text-body hover:bg-input'}"
						onclick={() => selectSuggestion(suggestion)}
					>
						<span>{suggestion.name}</span>
						{#if suggestion.distance}
							<span class="text-sm text-muted block">
								{metersToKilometers(suggestion.distance)} km</span
							>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
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

	.icons {
		display: flex;
		justify-content: center;
		gap: 24px;
		width: 100%;
	}
</style>
