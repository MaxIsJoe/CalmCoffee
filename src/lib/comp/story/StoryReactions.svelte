<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/stores/user';
	import Reactions from '$lib/comp/common/Reactions.svelte';
	import { sendFollowNotification } from '$lib/notifications';

	export let storyId: string;

	let userReaction: string | null = null;
	let reactionCounts: Record<string, number> = {};
	let loading = false;
	let errorMsg: string | null = null;

	let userId: string | null = null;
	$user; // subscribe to user store

	$: userId = $user?.usr?.id ?? null;

	// Helper to encode reaction values as plain strings for Supabase
	function encodeReactionValue(val: string) {
		// Map emoji to enum string
		switch (val) {
			case '≡ƒÆû':
				return '💖';
			case '≡ƒæÇ':
				return '👀';
			case '≡ƒÿÉ':
				return '😐';
			case '≡ƒùæ∩╕Å':
				return '🗑️';
			default:
				return val;
		}
	}
	function decodeReactionValue(val: string) {
		// Map enum string to internal value
		switch (val) {
			case '💖':
				return '≡ƒÆû';
			case '👀':
				return '≡ƒæÇ';
			case '😐':
				return '≡ƒÿÉ';
			case '🗑️':
				return '≡ƒùæ∩╕Å';
			default:
				return val;
		}
	}

	async function fetchReactions() {
		if (!storyId) return;
		const { data, error } = await supabase
			.from('stories_reactions')
			.select('reaction, user_id')
			.eq('react_to', storyId);

		if (error) {
			errorMsg = error.message || 'Could not fetch reactions.';
			return;
		}
		errorMsg = null;
		reactionCounts = {};
		userReaction = null;
		data.forEach((r) => {
			const decoded = decodeReactionValue(r.reaction);
			reactionCounts[decoded] = (reactionCounts[decoded] || 0) + 1;
			if (userId && r.user_id === userId) {
				userReaction = decoded;
			}
		});
	}

	async function handleReaction(event: CustomEvent<{ reaction: string }>) {
		if (!storyId || !userId) return;
		loading = true;
		errorMsg = null;
		const { error: delError } = await supabase
			.from('stories_reactions')
			.delete()
			.match({ user_id: userId, react_to: storyId });
		if (delError) {
			errorMsg = delError.message || 'Could not update reaction.';
			loading = false;
			return;
		}
		if (userReaction !== event.detail.reaction) {
			const { error: insError } = await supabase.from('stories_reactions').insert({
				user_id: userId,
				react_to: storyId,
				reaction: encodeReactionValue(event.detail.reaction)
			});
			if (insError) {
				errorMsg = insError.message || 'Could not update reaction.';
				loading = false;
				return;
			}
		}
		userReaction = userReaction === event.detail.reaction ? null : event.detail.reaction;
		await fetchReactions();
		loading = false;
	}

	onMount(fetchReactions);
	$: storyId, fetchReactions();
</script>

{#if user}
	<Reactions
		{userReaction}
		{reactionCounts}
		{loading}
		{errorMsg}
		on:react={handleReaction}
	/>
{/if} 