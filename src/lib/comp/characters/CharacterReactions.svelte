<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/stores/user';
	import Reactions from '$lib/comp/common/Reactions.svelte';

	export let characterId: number;

	let userReaction: string | null = null;
	let reactionCounts: Record<string, number> = {};
	let loading = false;
	let errorMsg: string | null = null;

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

	async function handleReaction(reaction: string) {
		if (!characterId) return;

		const currentUser = $user;
		if (!currentUser) {
			errorMsg = 'You must be logged in to react';
			return;
		}

		loading = true;
		errorMsg = null;

		try {
			// If user already reacted with this reaction, remove it
			if (userReaction === reaction) {
				const { error: deleteError } = await supabase
					.from('characters_reactions')
					.delete()
					.eq('react_to', characterId)
					.eq('user_id', currentUser.usr?.id)
					.eq('reaction', reaction);

				if (deleteError) throw deleteError;
				userReaction = null;
			} else {
				// If user had a different reaction, delete the old one and insert the new one
				if (userReaction) {
					const { error: deleteError } = await supabase
						.from('characters_reactions')
						.delete()
						.eq('react_to', characterId)
						.eq('user_id', currentUser.usr?.id);

					if (deleteError) throw deleteError;
				}

				// Insert new reaction
				const { error: insertError } = await supabase.from('characters_reactions').insert({
					react_to: characterId,
					reaction,
					user_id: currentUser.usr?.id
				});

				if (insertError) throw insertError;
				userReaction = reaction;
			}

			// Refresh reaction counts
			await fetchReactions();
		} catch (error) {
			errorMsg = error instanceof Error ? error.message : 'Failed to update reaction';
		} finally {
			loading = false;
		}
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
		on:react={({ detail }) => handleReaction(detail.reaction)}
	/>
{/if} 