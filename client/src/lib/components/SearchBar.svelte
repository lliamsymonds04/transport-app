<script lang="ts">
	import { Ship, Bus, TrainFront } from 'lucide-svelte';
	import { env } from '$env/dynamic/public';
	import type { LatLngTuple } from 'leaflet';
	import type { MapboxFeature } from '$lib/types/mapboxFeature';

	const MapboxApiKey = env.PUBLIC_MAPBOX_TOKEN;

	interface Props {
		onSearchSubmit: (feature: MapboxFeature) => void;
		searchValue: MapboxFeature | null;
		proximity?: LatLngTuple;
	}

	let { onSearchSubmit, proximity, searchValue = $bindable() }: Props = $props();
	let query = $state('');
	let suggestions = $state<MapboxFeature[]>([]);
	let isLoading = $state(false);
	let isTyping = $derived(query.length > 0);
	let showSuggestions = $derived(suggestions.length > 0);
	let selectedIndex = $state(-1);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	async function fetchSuggestions(searchQuery: string) {
		if (searchQuery.length < 3) {
			suggestions = [];
			return;
		}

		isLoading = true;

		try {
			let url =
				`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(searchQuery)}` +
				`&limit=5` +
				`&access_token=${MapboxApiKey}` +
				`&types=address%2Cplace`;

			if (proximity) {
				url += `&proximity=${proximity[1]},${proximity[0]}`;
			}

			const response = await fetch(url);

			const data = await response.json();
			suggestions = data.features.map((feature: any) => ({
				id: feature.id,
				place_name: feature.properties.name,
				coordinates: feature.properties.coordinates
			}));
		} catch (error) {
			console.error('Error fetching suggestions:', error);
			suggestions = [];
		} finally {
			isLoading = false;
		}
	}

	function selectSuggestion(suggestion: MapboxFeature) {
		query = suggestion.place_name;
		showSuggestions = false;
		suggestions = [];
		searchValue = suggestion;
		onSearchSubmit?.(suggestion);
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
		if (query.length == 0 || (searchValue && searchValue?.place_name != query)) {
			searchValue = null;
		}

		debounceTimer = setTimeout(() => {
			isLoading = true;
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

		{#if showSuggestions}
			<div
				class="absolute top-full bg-surface w-full mt-1
        rounded-md shadow-lg max-h-300 left-0 border border-border"
			>
				{#each suggestions as suggestion, index}
					<button
						type="button"
						class="w-full text-left px-3 py-2 cursor-pointer transition-colors border-0 {index ===
						selectedIndex
							? 'bg-primary text-white'
							: 'bg-transparent text-body hover:bg-input'}"
						onclick={() => selectSuggestion(suggestion)}
					>
						{suggestion.place_name}
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
