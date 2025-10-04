<script lang="ts">
	import { Ship, Bus, TrainFront } from 'lucide-svelte';
	import { env } from '$env/dynamic/public';
	import type { LatLngTuple } from 'leaflet';
	import type { MapboxFeature } from '$lib/types/mapboxFeature';

	const MapboxApiKey = env.PUBLIC_MAPBOX_TOKEN;

	interface Props {
		onSearchSubmit: (feature: MapboxFeature) => void;
		proximity?: LatLngTuple;
	}

	let { onSearchSubmit, proximity }: Props = $props();
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
				coordinates: feature.properties.coordinates,
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
		<Ship size="40" color="var(--color-brand-primary)" />
		<Bus size="40" color="var(--color-brand-primary)" />
		<TrainFront size="40" color="var(--color-brand-primary)" />
	</div>

	<div class="search-box">
		<form onsubmit={handleSubmit} class="search-form">
			<input
				type="text"
				placeholder="Search location..."
				oninput={handleInput}
				onkeydown={handleKeydown}
				onblur={handleBlur}
				bind:value={query}
			/>
			<button type="submit" disabled={!isTyping}>Search</button>
		</form>

		{#if showSuggestions}
			<div class="suggestions">
				{#each suggestions as suggestion, index}
					<div class="suggestions-item" class:suggestion-item-selected={index === selectedIndex}>
						{suggestion.place_name}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
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

	/* Suggestions Dropdown */
	.suggestions {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #ccc;
		border-top: none;
		border-radius: 0 0 4px 4px;
		max-height: 300px;
		overflow-y: auto;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		/* gap: 8px; */
	}

	.suggestions-item {
		padding: 8px;
		cursor: pointer;
		transition: background-color 0.2s;
		color: var(--color-text-body);
		border-radius: 0 0 4px 4px;
	}

	.suggestion-item-selected,
	.suggestions-item:hover {
		background-color: var(--color-brand-primary);
	}
</style>
