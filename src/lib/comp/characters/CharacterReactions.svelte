<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/stores/user';
	import Reactions from '$lib/comp/common/Reactions.svelte';
	import { createEventDispatcher } from 'svelte';

	export let characterId: number;

	let userReaction: string | null = null;
	let reactionCounts: Record<string, number> = {};
	let loading = false;
	let errorMsg: string | null = null;

	const dispatch = createEventDispatcher<{
		react: { reaction: string }
	}>();

	async function fetchReactions() {
		if (!characterId) return;

		const { data: reactions, error: fetchError } = await supabase
			.from('characters_reactions')
			.select('reaction, user_id')
			.eq('react_to', characterId);

		if (fetchError) {
			errorMsg = fetchError.message;
            console.error(fetchError.message);
			return;
		}

		// Count reactions
		const counts: Record<string, number> = {};
		reactions?.forEach((r) => {
			if (r.reaction) {
				counts[r.reaction] = (counts[r.reaction] || 0) + 1;
			}
		});
		reactionCounts = counts;

		// Get user's reaction
		const currentUser = $user;
		if (currentUser) {
			const foundReaction = reactions?.find((r) => r.user_id === currentUser.usr?.id);
			if (foundReaction?.reaction) {
				userReaction = foundReaction.reaction;
			}
		}
	}

	async function handleReaction(event: CustomEvent<{ reaction: string }>) {
		if (!characterId || !$user?.usr?.id) return;
		loading = true;
		errorMsg = null;
		const { error: delError } = await supabase
			.from('characters_reactions')
			.delete()
			.eq('react_to', characterId)
			.eq('user_id', $user?.usr?.id);
		if (delError) {
			errorMsg = delError.message || 'Could not update reaction.';
			loading = false;
			return;
		}
		if (userReaction !== event.detail.reaction) {
			const { error: insError } = await supabase.from('characters_reactions').insert({
				react_to: characterId,
				reaction: event.detail.reaction,
				user_id: $user?.usr?.id
			});
			if (insError) {
				errorMsg = insError.message || 'Could not update reaction.';
				loading = false;
				return;
			}
			// Dispatch the reaction event
			dispatch('react', { reaction: event.detail.reaction });
		}
		userReaction = userReaction === event.detail.reaction ? null : event.detail.reaction;
		await fetchReactions();
		loading = false;
	}

	onMount(fetchReactions);

	$: if (characterId) {
		fetchReactions();
	}
</script>

{#if $user}
	<Reactions
		{userReaction}
		{reactionCounts}
		{loading}
		{errorMsg}
		on:react={handleReaction}
	/>
{/if}

<style>
	.reactions-panel {
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		box-shadow: 0 1px 4px var(--color-card-shadow);
	}
	.reaction-btn {
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		color: var(--color-link);
	}
	.reaction-btn.active {
		background: var(--color-secondary);
		color: var(--color-accent);
		border-color: var(--color-accent);
	}
	.reaction-btn:hover {
		background: var(--color-link-hover);
		color: var(--color-primary-alt);
	}
	.reaction-count {
		color: var(--color-accent);
	}
</style> 