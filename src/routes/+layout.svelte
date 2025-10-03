<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<style>
	/* Apply a dark background and light text globally */
	:global(body) {
		margin: 0;
		min-height: 100vh;
		background-color: #0b0c10; /* very dark background */
		color: #e6eef8; /* light text for contrast */
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
	}

	:global(a) {
		color: #7dd3fc; /* brighter link color on dark background */
	}

	/* Respect user's dark-mode preference if you want to later */
	@media (prefers-color-scheme: light) {
		:global(body) {
			/* keep a neutral dark background even on light-pref browsers; change if you prefer */
		}
	}
</style>
