<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ImageToolbar from '../markdown/ImageToolbar.svelte';

	const dispatch = createEventDispatcher<{
		insert: { before: string; after: string; placeholder: string };
	}>();

	function handleInsert(event: CustomEvent<{ before: string; after: string; placeholder: string }>) {
		// Forward the event with the image URL as the placeholder
		dispatch('insert', {
			before: '',
			after: '',
			placeholder: event.detail.placeholder
		});
	}
</script>

<ImageToolbar on:insert={handleInsert} />

<style>
	:global(.image-btn) {
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 0.2rem 0.5rem;
		font-size: 1.2rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	:global(.image-btn:hover) {
		background: var(--color-link-hover);
		border-color: var(--color-link);
		transform: translateY(-1px);
	}
</style> 