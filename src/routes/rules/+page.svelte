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

{@html coffeeMarkdown(rules, defaultStyles)}
