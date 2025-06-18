<script lang="ts">
	import type { Database } from '../../../../database.types';
	import StoryReactions from './StoryReactions.svelte';

	export let story: Database['public']['Tables']['stories']['Row'];
	export let author: { username: string } | null;
</script>

<div class="story-header">
	<h1>{story.title}</h1>
	{#if author}
		<p class="story-author">By <a href="/profile/{author.username}" class="author-link">{author.username}</a></p>
	{/if}
	<div class="story-meta-row">
		<span class="age-rating">{story.age_rating}</span>
		{#if story.tags && story.tags.length}
			<p>|</p>
			<div class="story-tags">
				{#each story.tags as tag}
					<span
						class="story-tag"
						tabindex="0"
						role="button"
						on:click|stopPropagation={() =>
							(window.location.href = `/search?tag=${encodeURIComponent(tag)}`)}>{tag}</span
					>
				{/each}
			</div>
		{/if}
	</div>
	<StoryReactions storyId={story.id} />
</div>

<style>
	.story-header {
		margin-bottom: 2rem;
	}

	h1 {
		margin-top: 0;
		font-size: 2.2rem;
		color: #4f46e5;
	}

	.story-author {
		color: #888;
		margin-bottom: 0.5rem;
		font-size: 1.05rem;
	}

	.author-link {
		color: #3730a3;
		font-weight: 500;
		text-decoration: none;
		transition: color 0.2s;
	}

	.author-link:hover {
		color: #4f46e5;
		text-decoration: underline;
	}

	.story-meta-row {
		display: flex;
		align-items: center;
		gap: 0.7em;
		margin: 0.5em 0 0.2em 0;
		flex-wrap: wrap;
	}

	.age-rating {
		background: #e0e7ff;
		color: #3730a3;
		padding: 0.2rem 0.7rem;
		border-radius: 6px;
		font-size: 0.95rem;
		margin-right: 0;
	}

	.story-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4em;
		margin-top: 0;
	}

	.story-tag {
		background: var(--color-bg-alt);
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

	.story-tag:hover,
	.story-tag:focus {
		background: var(--color-border);
		color: var(--color-accent);
		outline: none;
	}
</style> 