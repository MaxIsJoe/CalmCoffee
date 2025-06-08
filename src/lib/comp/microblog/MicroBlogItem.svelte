<script lang="ts">
	import { coffeeMarkdown } from '$lib/md/coffeeMarkdown';
	import type { BlogType } from '$lib/types/blog';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/stores/user';
	import Reactions from '$lib/comp/common/Reactions.svelte';
	import { sendLikeStoryNotification } from '$lib/notifications';

	export let mb: BlogType;
	export let profile: { username: string | null; avatar_url: string | null; } | null;

	function goToTag(tag: string) {
		window.location.href = `/search?tag=${encodeURIComponent(tag)}`;
	}

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

	let userReaction: string | null = null;
	let reactionCounts: Record<string, number> = {};
	let loading = false;
	let errorMsg: string | null = null;

	let userId: string | null = null;
	$user; // subscribe to user store

	$: userId = $user?.usr?.id ?? null;

	async function fetchReactions() {
		if (!mb?.post_id) return;
		const { data, error } = await supabase
			.from('microblogs_reactions')
			.select('reaction, user_id')
			.eq('react_to', mb.post_id);

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
		if (!mb?.post_id || !userId) return;
		loading = true;
		errorMsg = null;
		const { error: delError } = await supabase
			.from('microblogs_reactions')
			.delete()
			.match({ user_id: userId, react_to: mb.post_id });
		if (delError) {
			errorMsg = delError.message || 'Could not update reaction.';
			loading = false;
			return;
		}
		if (userReaction !== event.detail.reaction) {
			const { error: insError } = await supabase.from('microblogs_reactions').insert({
				user_id: userId,
				react_to: mb.post_id,
				reaction: encodeReactionValue(event.detail.reaction)
			});
			if (insError) {
				errorMsg = insError.message || 'Could not update reaction.';
				loading = false;
				return;
			}

			// Send notification to the post author if it's not the current user
			const { data: reactorProfile } = await supabase
					.from('profiles')
					.select('username')
					.eq('account_id', userId)
					.single();

				if (reactorProfile?.username) {
					await sendLikeStoryNotification({
						userId: mb.writer,
						reactorId: userId,
						reactorUsername: reactorProfile.username,
						storyTitle: mb.content.slice(0, 50) + (mb.content.length > 50 ? '...' : ''),
						reaction: event.detail.reaction
					});
				}
		}
		userReaction = userReaction === event.detail.reaction ? null : event.detail.reaction;
		await fetchReactions();
		loading = false;
	}

	onMount(fetchReactions);
	$: mb?.post_id, fetchReactions();
</script>

{#if mb && mb.content !== undefined && mb.content !== null}
	<li class="microblog-item">
		{#if profile}
			<a href="/profile/{profile.username}" class="microblog-link">
				<div class="microblog-header">
					<img class="microblog-pfp" src={profile.avatar_url} alt="pfp" />
					<span class="microblog-writer">{profile.username}</span>
				</div>
			</a>
		{/if}
		<div class="microblog-content">{@html coffeeMarkdown(mb.content, mb.styles)}</div>
		{#if mb.tags && mb.tags.length}
			<div class="microblog-tags">
				{#each mb.tags as tag}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<span class="microblog-tag" on:click={() => goToTag(tag)} tabindex="0" role="button"
						>{tag}</span
					>
				{/each}
			</div>
		{/if}

		{#if user}
			<Reactions
				{userReaction}
				{reactionCounts}
				{loading}
				{errorMsg}
				on:react={handleReaction}
			/>
		{/if}

		<small class="microblog-date">
			{new Date(mb.created_at).toLocaleString()}
			<span class="microblog-age-rating">| {mb.age_rating}</span>
		</small>
	</li>
{:else}
	<p class="microblog-error">This blog post is not available :(</p>
{/if}

<style>
	.microblog-error {
		color: #f87171;
		font-size: 0.95rem;
		margin-top: 0.5rem;
	}
	.microblog-item {
		background: #fff;
		border-radius: 8px;
		margin-bottom: 1.1rem;
		padding: 1rem 1.2rem;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
	}
	.microblog-header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.5rem;
	}
	.microblog-pfp {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid #e5e7eb;
		background: #f3f4f6;
	}
	.microblog-writer {
		font-weight: 600;
		font-size: 1.08rem;
		color: #334155;
	}
	.microblog-content {
		font-size: 1.05rem;
		color: #222;
		margin-bottom: 0.3rem;
	}
	.microblog-date {
		color: #888;
		font-size: 0.97em;
	}
	.microblog-age-rating {
		margin-left: 0.7em;
		color: #6366f1;
		font-size: 0.97em;
		font-weight: 500;
	}
	.microblog-tags {
		margin: 0.4em 0 0.5em 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4em;
	}
	.microblog-tag {
		background: #ede9e3;
		color: #7c5e48;
		font-size: 0.93em;
		padding: 0.18em 0.7em;
		border-radius: 999px;
		font-weight: 500;
		letter-spacing: 0.01em;
		border: 1px solid #e0d7ce;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.microblog-tag:hover,
	.microblog-tag:focus {
		background: #e0d7ce;
		color: #a67c52;
		outline: none;
	}
</style>
