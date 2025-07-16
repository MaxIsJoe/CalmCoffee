<script lang="ts">
	import MicroBlogItem from '$lib/comp/microblog/MicroBlogItem.svelte';
	import { onMount } from 'svelte';
	import { fetchLatestBlogByAccountId, fetchLatestCharactersByAccountId, fetchProfileStats } from '$lib/db/profile';
	import type { Profile, ProfileComment } from '$lib/db/profile';
	import type { BlogType } from '$lib/types/blog';
	import { slugify } from '$lib/utils/slugify';

	export let profile: Profile | null;
	export let stories: any[] = [];
	export let userComments: ProfileComment[] = [];
	export let authors: Record<string, string> = {};

	let latestBlog: BlogType | null = null;
	let latestCharacters: any[] = [];
	let stats = {
		totalStories: 0,
		totalCharacters: 0,
		totalMicroblogs: 0,
		totalComments: 0,
		joined: ''
	};

	onMount(async () => {
		if (profile) {
			latestBlog = await fetchLatestBlogByAccountId(profile.account_id ?? '');
			latestCharacters = await fetchLatestCharactersByAccountId(profile.account_id ?? '', 6);
			stats = await fetchProfileStats(profile.account_id ?? '');
		}
	});
</script>

<div class="overview-stats">
	<h4>User Stats</h4>
	<ul>
		<li><strong>Stories:</strong> {stats.totalStories}</li>
		<li><strong>Characters:</strong> {stats.totalCharacters}</li>
		<li><strong>Microblogs:</strong> {stats.totalMicroblogs}</li>
		<li><strong>Comments:</strong> {stats.totalComments}</li>
		<li><strong>Joined:</strong> {stats.joined}</li>
	</ul>
</div>

<div class="overview-grid">
	<div class="overview-section overview-section-wide">
		<h4>Recent Works</h4>
		{#if stories.length > 0}
			<ul class="overview-works-list">
				{#each stories.slice(0, 2) as story}
					<li class="overview-story-item">
						<a href={'/read/' + (story.user_id && authors[story.user_id] ? authors[story.user_id] + '/' + slugify(story.title) : story.id)} class="overview-story-link">
							<strong class="overview-story-title">{story.title}</strong>
						</a>
						{#if story.description}
							<span class="overview-story-desc">{story.short_description}</span>
						{/if}
						<span class="overview-story-meta">
							{#if story.created_at}
								<span class="overview-story-date"
									>{new Date(story.created_at).toLocaleDateString(undefined, {
										year: 'numeric',
										month: 'short',
										day: 'numeric'
									})}</span
								>
							{/if}
							{#if story.updated_at && story.updated_at !== story.created_at}
								<span class="overview-story-updated">
									&nbsp;| Updated: {new Date(story.updated_at).toLocaleDateString(undefined, {
										year: 'numeric',
										month: 'short',
										day: 'numeric'
									})}
								</span>
							{/if}
						</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="overview-empty">No works yet.</p>
		{/if}
	</div>

	<div class="overview-section overview-section-wide">
		<h4>Latest Characters</h4>
		{#if latestCharacters.length > 0}
			<ul class="overview-characters-list">
				{#each latestCharacters as char}
					<li class="overview-character-item">
						<a href={'/characters/' + char.id} class="overview-character-link">
							{#if char.character_avatar}
								<img
									src={char.character_avatar}
									alt={char.character_name}
									class="overview-character-avatar"
								/>
							{/if}
							<span class="overview-character-name">{char.character_name}</span>
							<span class="overview-character-type">{char.character_type}</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="overview-empty">No characters yet.</p>
		{/if}
	</div>

	<div class="overview-row">
		<div class="overview-section">
			<h4>Latest Blog</h4>
			{#key latestBlog}
				{#if latestBlog !== null}
					<ul class="overview-works-list">
						<MicroBlogItem mb={latestBlog} {profile} />
					</ul>
				{:else}
					<p class="overview-empty">This user hasn't posted any blogs yet.</p>
				{/if}
			{/key}
		</div>

		<div class="overview-section overview-comments-section">
			<h4>Recent Comments</h4>
			{#if userComments.length > 0}
				<ul class="overview-comments-list">
					{#each userComments.slice(0, 3) as c}
						<li>
							<span class="overview-comment-meta">
								{#if c.user_id}
									<a href={'/read/' + (authors[c.user_id] ? authors[c.user_id] + '/' + slugify(c.story_title) : c.story_id)} class="comment-story">
										{c.story_title || 'Story'}
									</a>
								{/if}
								<span class="comment-date">{new Date(c.created_at).toLocaleString()}</span>
							</span>
							<span class="overview-comment-text">{c.comment}</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="overview-empty">No comments yet.</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.overview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 2rem;
		margin-top: 1.5em;
	}
	.overview-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		grid-column: 1 / -1;
	}
	.overview-section {
		background: var(--color-card-bg);
		border-radius: 10px;
		box-shadow: 0 2px 8px var(--color-card-shadow);
		padding: 1.3em 1.2em 1.1em 1.2em;
		display: flex;
		flex-direction: column;
	}
	.overview-section-wide {
		grid-column: span 2;
	}
	.overview-section h4 {
		margin-top: 0;
		margin-bottom: 1em;
		font-size: 1.13em;
		color: var(--color-link);
		font-weight: 600;
		letter-spacing: -0.5px;
	}
	@media (max-width: 900px) {
		.overview-grid {
			grid-template-columns: 1fr;
			gap: 1.2rem;
		}
		.overview-row {
			grid-template-columns: 1fr;
			gap: 1.2rem;
		}
		.overview-section-wide {
			grid-column: auto;
		}
	}
	.overview-works-list,
	.overview-comments-list,
	.overview-characters-list {
		list-style: none;
		padding: 0;
		margin: 0.5em 0 0 0;
	}
	.overview-works-list li,
	.overview-comments-list li,
	.overview-character-item {
		margin-bottom: 0.7em;
		background: var(--color-bg-hover);
		border-radius: 7px;
		padding: 0.7em 1em;
	}
	.overview-story-item {
		margin-bottom: 0.7em;
		background: var(--color-bg-alt);
		border-radius: 10px;
		padding: 1em 1.2em 0.8em 1.2em;
		box-shadow: 0 1px 6px var(--color-card-shadow);
		display: flex;
		flex-direction: column;
		gap: 0.3em;
	}
	.overview-story-link {
		text-decoration: none;
		color: var(--color-accent);
		transition: color 0.15s;
	}
	.overview-story-link:hover .overview-story-title {
		color: var(--color-link);
		text-decoration: underline;
	}
	.overview-story-title {
		font-size: 1.13em;
		font-weight: 600;
		letter-spacing: 0.01em;
		color: var(--color-primary);
	}
	.overview-story-meta {
		color: var(--color-secondary);
		font-size: 0.95em;
		margin-top: 0.1em;
	}
	.overview-story-updated {
		color: var(--color-accent);
		font-size: 0.95em;
		margin-left: 0.5em;
	}
	.overview-comment-meta {
		display: flex;
		gap: 1em;
		align-items: center;
		font-size: 0.97em;
		margin-bottom: 0.2em;
		color: var(--color-secondary);
	}
	.comment-story {
		color: var(--color-link);
		font-weight: 500;
		text-decoration: none;
	}
	.comment-story:hover {
		text-decoration: underline;
	}
	.comment-date {
		color: var(--color-secondary);
		font-size: 0.96em;
	}
	.overview-comment-text {
		display: block;
		color: var(--color-text);
		margin-top: 0.1em;
	}
	.overview-empty {
		color: var(--color-secondary);
		font-size: 0.97em;
		margin: 0.5em 0 0 0;
	}
	.overview-characters-list {
		display: flex;
		flex-direction: column;
		gap: 0.7em;
	}
	.overview-character-item {
		display: flex;
		align-items: center;
		background: var(--color-bg-hover);
		border-radius: 7px;
		padding: 0.7em 1em;
	}
	.overview-character-link {
		display: flex;
		align-items: center;
		gap: 0.8em;
		text-decoration: none;
		color: var(--color-text);
		width: 100%;
	}
	.overview-character-avatar {
		width: 38px;
		height: 38px;
		border-radius: 50%;
		object-fit: cover;
		background: var(--color-bg-hover);
		border: 1.5px solid var(--color-border);
	}
	.overview-character-name {
		font-weight: 600;
		font-size: 1.08em;
	}
	.overview-character-type {
		margin-left: auto;
		font-size: 0.98em;
		color: var(--color-link);
		background: var(--color-bg-hover);
		border-radius: 5px;
		padding: 0.1em 0.7em;
	}
	.overview-stats {
		background: var(--color-bg-alt);
		border-radius: 10px;
		box-shadow: 0 1px 6px var(--color-card-shadow);
		padding: 1em 1.2em 0.8em 1.2em;
		margin-bottom: 1.5em;
		grid-column: span 2;
	}
	.overview-stats h4 {
		margin-top: 0;
		margin-bottom: 0.7em;
		font-size: 1.13em;
		color: var(--color-link);
		font-weight: 600;
	}
	.overview-stats ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 1.2em 2.5em;
	}
	.overview-stats li {
		font-size: 1.05em;
		color: var(--color-accent);
	}
	.overview-stats strong {
		color: var(--color-primary);
		font-weight: 600;
	}
</style>
