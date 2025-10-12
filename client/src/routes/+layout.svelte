<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	import '../app.css';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<style>
	:root {
		/* Backgrounds & Surfaces */
		--color-background-page: #0b0c10;
		--color-background-surface: #181a1b; /* For cards, sections, etc. */
		--color-background-input: #131516; /* For a light input field */
		--color-border: #3e4446; /* Subtle borders */

		/* Text & Links */
		--color-text-body: #e8e6e3;
		--color-text-heading: #e8e6e3; /* Optionally brighter for titles */
		--color-text-link: #7dd3fc;

		/* Brand Colors */
		--color-brand-primary: #05f140;
		--color-brand-primary-hover: #07ce39;
		--color-brand-secondary: #e8e6e3;
	}

	:global(body) {
		margin: 0;
		background-color: var(--color-background-page);
		color: var(--color-text-body);
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			'Helvetica Neue',
			Arial;
	}

	:global(a) {
		color: var(--color-text-link);
	}

	:global(button.primary),
	:global(.btn-primary) {
		background-color: var(--color-brand-primary);
		color: var(--color-ui-white); /* White text on the dark button */
		border: none;
		padding: 10px 15px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	:global(button.primary:hover),
	:global(.btn-primary:hover) {
		background-color: var(--color-brand-primary-hover);
	}

	:global(.card),
	:global(.section) {
		background-color: var(--color-background-surface);
		padding: 20px;
		border-radius: 8px;
	}

	:global(input[type='text']),
	:global(.input-field) {
		background-color: var(--color-background-input);
		color: var(--color-background-page); /* Dark text on light input */
		border: 1px solid var(--color-brand-primary); /* Optional subtle border */
		padding: 10px;
	}
</style>

