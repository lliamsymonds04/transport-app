<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

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
        --color-brand-primary: #05F140;
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