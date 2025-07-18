<script>
	import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';
	import { onMount } from 'svelte';

	let rules = '';

	onMount(async () => {
		try {
			const response = await fetch('text/rules.md');
			if (!response.ok) {
				throw new Error('Failed to fetch rules');
			}
			rules = await response.text();
		} catch (error) {
			console.error('Error loading rules:', error);
		}
	});
</script>

<div class="rules-container">
	{#if rules !== ''}
		<div class="rules-content">
			{@html coffeeMarkdown(rules)}
		</div>
	{/if}
</div>

<style>
	.rules-container {
		max-width: 1280px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	.rules-content {
		background-color: var(--color-bg-alt);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 20px var(--color-card-shadow);
		color: var(--color-text);
	}

	@media (max-width: 768px) {
		.rules-container {
			margin: 1rem auto;
		}

		.rules-content {
			padding: 1.5rem;
		}

		:global(.rules-content h1) {
			font-size: 2rem;
			color: var(--color-primary);
		}

		:global(.rules-content h2) {
			font-size: 1.5rem;
			color: var(--color-primary);
		}

		:global(.rules-content h3) {
			font-size: 1.2rem;
			color: var(--color-primary);
		}
	}
</style>
