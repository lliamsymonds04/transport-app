<script lang="ts">
	import { getUserLocation } from '$lib/utils/getUserLocation';
	import type { MapboxFeature } from '$lib/types/mapboxFeature';

	interface Props {
		destination: MapboxFeature;
	}

	let { destination }: Props = $props();
</script>

<div class="absolute bottom-4 left-1/2 -translate-x-1/2 -translate-y-full z-10">Travel bar</div>
