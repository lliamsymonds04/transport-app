<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<!-- <style>
	/* Apply a dark background and light text globally */
	:root{
		--background-color: #0b0c10; /* very dark background */
		--text-color: #e6eef8; /* light text for contrast */
		--link-color: #7dd3fc; /* brighter link color on dark background */
		--color-primary: #169976; /* primary button color */
		--color-primary-dark: #077A7D; /* darker shade for hover */
		--color-secondary: #FFFFFF; /* secondary color for light elements */
		--color--foreground: #1f2833; /* slightly lighter than background for contrast */
	}
	:global(body) {
		margin: 0;
		background-color: var(--background-color);
		color: #e6eef8; /* light text for contrast */
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
	}

	:global(a) {
		color: #7dd3fc; /* brighter link color on dark background */
	}

	/* Respect user's dark-mode preference if you want to later */
	/* @media (prefers-color-scheme: light) {
	} */
</style> -->

<style>
    :root {
        /* Backgrounds & Surfaces */
        --color-background-page: #0b0c10;
        --color-background-surface: #F5F5F5; /* For cards, sections, etc. */
        --color-background-input: #FFFFFF; /* For a light input field */

        /* Text & Links */
        --color-text-body: #e6eef8;
        --color-text-heading: #FFFFFF; /* Optionally brighter for titles */
        --color-text-link: #7dd3fc;
        
        /* Brand Colors */
        --color-brand-primary: #9FCC2E;
        --color-brand-primary-hover: #8FB72A;
    }
    
    :global(body) {
        margin: 0;
        background-color: var(--color-background-page);
        color: var(--color-text-body);
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
    }

    :global(a) {
        color: var(--color-text-link);
    }

    
    :global(button.primary), :global(.btn-primary) {
        background-color: var(--color-brand-primary);
        color: var(--color-ui-white); /* White text on the dark button */
        border: none;
        padding: 10px 15px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    :global(button.primary:hover), :global(.btn-primary:hover) {
        background-color: var(--color-brand-primary-hover);
    }

    :global(.card), :global(.section) {
        background-color: var(--color-background-surface);
        padding: 20px;
        border-radius: 8px;
    }

    :global(input[type="text"]), :global(.input-field) {
        background-color: var(--color-background-input);
        color: var(--color-background-page); /* Dark text on light input */
        border: 1px solid var(--color-brand-primary); /* Optional subtle border */
        padding: 10px;
    }
</style>