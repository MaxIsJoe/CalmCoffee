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
		{@html coffeeMarkdown(rules, defaultStyles)}
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
		background-color: #fff;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	:global(.rules-content h1) {
		color: #4b2e19;
		font-size: 2.5rem;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	:global(.rules-content h2) {
		color: #6d4c41;
		font-size: 1.8rem;
		margin: 2rem 0 1rem;
		border-bottom: 2px solid #d4c2b8;
		padding-bottom: 0.5rem;
	}

	:global(.rules-content h3) {
		color: #8d6e63;
		font-size: 1.4rem;
		margin: 1.5rem 0 1rem;
	}

	:global(.rules-content p) {
		color: #3e2723;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	:global(.rules-content ul) {
		list-style-type: none;
		padding-left: 1.5rem;
		margin-bottom: 1.5rem;
	}

	:global(.rules-content ul li) {
		position: relative;
		padding-left: 1.5rem;
		margin-bottom: 0.8rem;
		line-height: 1.6;
	}

	:global(.rules-content ul li::before) {
		content: "•";
		color: #a1887f;
		font-size: 1.5rem;
		position: absolute;
		left: 0;
		top: -0.2rem;
	}

	:global(.rules-content a) {
		color: #6d4c41;
		text-decoration: none;
		border-bottom: 1px solid #d4c2b8;
		transition: all 0.2s ease;
	}

	:global(.rules-content a:hover) {
		color: #4b2e19;
		border-bottom-color: #4b2e19;
	}

	:global(.rules-content blockquote) {
		border-left: 4px solid #d4c2b8;
		padding: 1rem 1.5rem;
		margin: 1.5rem 0;
		background-color: #fcf8f5;
		border-radius: 0 8px 8px 0;
	}

	:global(.rules-content code) {
		background-color: #fcf8f5;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: monospace;
		color: #6d4c41;
	}

	:global(.rules-content pre) {
		background-color: #fcf8f5;
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		margin: 1.5rem 0;
	}

	:global(.rules-content pre code) {
		background-color: transparent;
		padding: 0;
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
		}

		:global(.rules-content h2) {
			font-size: 1.5rem;
		}

		:global(.rules-content h3) {
			font-size: 1.2rem;
		}
	}
</style>
