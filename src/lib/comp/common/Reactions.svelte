<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export const REACTIONS = [
		{ emoji: '💖', value: '0', label: 'Love' },
		{ emoji: '👀', value: '1', label: 'Watch' },
		{ emoji: '😐', value: '2', label: 'Meh' },
		{ emoji: '🗑️', value: '3', label: 'Trash' }
	];

	export let userReaction: string | null = null;
	export let reactionCounts: Record<string, number> = {};
	export let loading = false;
	export let errorMsg: string | null = null;

	const dispatch = createEventDispatcher<{
		react: { reaction: string };
	}>();

	function handleReaction(reaction: string) {
		dispatch('react', { reaction });
	}
</script>

{#if errorMsg}
	<div class="reaction-error">{errorMsg}</div>
{/if}
<div class="microblog-reactions">
	{#each REACTIONS as r}
		<button
			class="reaction-btn {userReaction === r.value ? 'active' : ''}"
			aria-label={r.label}
			disabled={loading}
			on:click={() => handleReaction(r.value)}
			type="button"
		>
			<span>{r.emoji}</span>
			<span class="reaction-count">{reactionCounts[r.value] || 0}</span>
		</button>
	{/each}
</div>

<style>
	.microblog-reactions {
		display: flex;
		gap: 0.5em;
		margin: 0.5em 0 0.3em 0;
	}
	.reaction-btn {
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		padding: 0.18em 0.7em;
		font-size: 1.1em;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.3em;
		transition:
			background 0.15s,
			border 0.15s;
	}
	.reaction-btn.active {
		background: var(--color-secondary);
		border-color: var(--color-accent);
		color: var(--color-accent);
		font-weight: 600;
	}
	.reaction-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.reaction-count {
		font-size: 0.95em;
		color: var(--color-accent);
	}
	.reaction-error {
		color: var(--color-danger);
		background: var(--color-danger-bg, #fef2f2);
		border: 1px solid var(--color-danger-hover);
		border-radius: 6px;
		padding: 0.3em 0.7em;
		margin-bottom: 0.5em;
		font-size: 0.97em;
	}
</style>
