<script lang="ts">
	import { coffeeMarkdown } from '$lib/md/coffeeMarkdown';
	import type { BlogType } from '$lib/types/blog';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/stores/user';
	import Reactions from '$lib/comp/common/Reactions.svelte';
	import { sendLikeStoryNotification } from '$lib/notifications';
	import { browser } from '$app/environment';

	export let mb: BlogType;
	export let profile: { username: string | null; avatar_url: string | null; } | null;

	let shareUrl = '';
	let showShareTooltip = false;
	let shareTooltipText = 'Copy link';

	function getShareUrl() {
		if (!browser) return '';
		const baseUrl = window.location.origin;
		return `${baseUrl}/blog/${mb.post_id}`;
	}

	async function handleShare() {
		if (!browser) return;
		shareUrl = getShareUrl();
		try {
			await navigator.clipboard.writeText(shareUrl);
			shareTooltipText = 'Copied!';
			showShareTooltip = true;
			setTimeout(() => {
				showShareTooltip = false;
				shareTooltipText = 'Copy link';
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
			shareTooltipText = 'Failed to copy';
			showShareTooltip = true;
			setTimeout(() => {
				showShareTooltip = false;
				shareTooltipText = 'Copy link';
			}, 2000);
		}
	}

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
			<button class="share-btn" on:click={handleShare} title="Share this post">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
					<polyline points="16 6 12 2 8 6"></polyline>
					<line x1="12" y1="2" x2="12" y2="15"></line>
				</svg>
				{#if showShareTooltip}
					<span class="share-tooltip">{shareTooltipText}</span>
				{/if}
			</button>
		</small>
	</li>
{:else}
	<p class="microblog-error">This blog post is not available :(</p>
{/if}

<style>
	.microblog-error {
		color: var(--color-danger);
		font-size: 0.95rem;
		margin-top: 0.5rem;
	}
	.microblog-item {
		background: var(--color-card-bg);
		border-radius: 8px;
		margin-bottom: 1.1rem;
		padding: 1rem 1.2rem;
		box-shadow: 0 1px 4px var(--color-card-shadow);
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
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
	}
	.microblog-writer {
		font-weight: 600;
		font-size: 1.08rem;
		color: var(--color-link);
	}
	.microblog-content {
		font-size: 1.05rem;
		color: var(--color-text);
		margin-bottom: 0.3rem;
	}
	.microblog-date {
		color: var(--color-secondary);
		font-size: 0.97em;
	}
	.microblog-age-rating {
		margin-left: 0.7em;
		color: var(--color-link);
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
		background: var(--color-bg-hover);
		color: var(--color-accent);
		font-size: 0.93em;
		padding: 0.18em 0.7em;
		border-radius: 999px;
		font-weight: 500;
		letter-spacing: 0.01em;
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.microblog-tag:hover,
	.microblog-tag:focus {
		background: var(--color-border);
		color: var(--color-accent);
		outline: none;
	}
	.share-btn {
		background: none;
		border: none;
		color: var(--color-link);
		cursor: pointer;
		padding: 0.2rem;
		margin-left: 0.7rem;
		position: relative;
		display: inline-flex;
		align-items: center;
		transition: color 0.2s;
	}

	.share-btn:hover {
		color: var(--color-link-hover);
	}

	.share-tooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-primary);
		color: var(--color-primary-alt);
		padding: 0.3rem 0.6rem;
		border-radius: 4px;
		font-size: 0.85rem;
		white-space: nowrap;
		margin-bottom: 0.3rem;
	}

	.share-tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-width: 4px;
		border-style: solid;
		border-color: var(--color-primary) transparent transparent transparent;
	}
</style>
