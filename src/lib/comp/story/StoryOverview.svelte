<script lang="ts">
	import type { Database } from '../../../../database.types';
	import StoryReactions from './StoryReactions.svelte';
	import { getLastReadChapter } from '$lib/utils/readingProgress';
	import { browser } from '$app/environment';
	import { coffeeMarkdown } from '$lib/md/coffeeMarkdown';

	export let story: Database['public']['Tables']['stories']['Row'];
	export let author: { username: string } | null;
	export let chapters: Database['public']['Tables']['chapters']['Row'][];
	export let blocks: Database['public']['Tables']['blocks']['Row'][];
	export let onStartReading: (chapterId?: string) => void;

	let lastReadChapterId: string | null = null;

	$: if (browser) {
		lastReadChapterId = getLastReadChapter(story.id);
	}

	$: wordCount = blocks.reduce((count, block) => {
		const content = block.content || '';
		return count + content.split(/\s+/).length;
	}, 0);

	$: readingTime = Math.ceil(wordCount / 200);

	$: firstChapterId = chapters[0]?.id;

	function handleChapterClick(chapterId: string) {
		onStartReading(chapterId);
	}
</script>

<div class="story-overview">
	<div class="story-header">
		<h1>{story.title}</h1>
		{#if author}
			<p class="story-author">
				By <a href="/profile/{author.username}" class="author-link">{author.username}</a>
			</p>
		{/if}
	</div>

	<div class="story-stats">
		<div class="stat-item">
			<span class="stat-label">Chapters</span>
			<span class="stat-value">{chapters.length}</span>
		</div>
		<div class="stat-item">
			<span class="stat-label">Word Count</span>
			<span class="stat-value">{wordCount.toLocaleString()}</span>
		</div>
		<div class="stat-item">
			<span class="stat-label">Reading Time</span>
			<span class="stat-value">{readingTime} min</span>
		</div>
		{#if story.updated_at && story.updated_at !== story.created_at}
			<div class="stat-item">
				<span class="stat-label">Last Updated</span>
				<span class="stat-value">{new Date(story.updated_at).toLocaleDateString()}</span>
			</div>
		{/if}
	</div>

	{#if story.description}
		<div class="story-description">
			<h3>Synopsis</h3>
			<p>{@html coffeeMarkdown(story.description)}</p>
		</div>
	{/if}

	<div class="story-meta-row">
		<span class="age-rating">{story.age_rating}</span>
		{#if story.tags && story.tags.length}
			<p>|</p>
			<div class="story-tags">
				{#each story.tags as tag}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
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

	<div class="story-actions">
		<StoryReactions storyId={story.id} />
		<div class="reading-buttons">
			{#if lastReadChapterId}
				<button class="continue-reading-btn" on:click={() => onStartReading(lastReadChapterId)}>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
					Continue Reading
				</button>
			{/if}
			<button class="start-reading-btn" on:click={() => onStartReading()}>
				{lastReadChapterId ? 'Start from Beginning' : 'Start Reading'}
			</button>
		</div>
	</div>

	<div class="chapter-list">
		<h3>Chapters</h3>
		<ul>
			{#each chapters as chapter}
				<li class="chapter-item" on:click={() => handleChapterClick(chapter.id)}>
					<div class="chapter-content">
						<span class="chapter-title">{chapter.title}</span>
						{#if chapter.description}
							<p class="chapter-desc">{chapter.description}</p>
						{/if}
					</div>
					<svg
						class="chapter-arrow"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M9 18l6-6-6-6" />
					</svg>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.story-overview {
		max-width: 800px;
		margin: 2rem auto;
		padding: 2rem;
		background: var(--color-card-bg);
		border-radius: 12px;
		box-shadow: 0 2px 8px var(--color-card-shadow);
	}

	.story-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.story-header h1 {
		margin: 0;
		font-size: 2.2rem;
		color: var(--color-link);
	}

	.story-author {
		color: var(--color-secondary);
		margin: 0.5rem 0 0 0;
		font-size: 1.05rem;
	}

	.author-link {
		color: var(--color-link);
		font-weight: 500;
		text-decoration: none;
		transition: color 0.2s;
	}

	.author-link:hover {
		color: var(--color-accent);
		text-decoration: underline;
	}

	.story-stats {
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 2rem;
		padding: 1rem;
		background: var(--color-section-bg);
		border-radius: 12px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}

	.stat-label {
		font-size: 0.9rem;
		color: var(--color-secondary);
	}

	.stat-value {
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--color-link);
	}

	.story-description {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: var(--color-section-bg);
		border-radius: 12px;
	}

	.story-description h3 {
		margin: 0 0 0.8rem 0;
		color: var(--color-link);
		font-size: 1.2rem;
	}

	.story-description p {
		margin: 0;
		color: var(--color-text);
		line-height: 1.6;
	}

	.story-actions {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.reading-buttons {
		display: flex;
		gap: 1rem;
	}

	.continue-reading-btn {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 0.8rem 1.5rem;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.continue-reading-btn:hover {
		background: var(--color-accent);
	}

	.continue-reading-btn svg {
		display: block;
	}

	.start-reading-btn {
		background: var(--color-bg-alt);
		color: var(--color-primary);
		border: 1px solid var(--color-border);
		padding: 0.8rem 1.5rem;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.start-reading-btn:hover {
		background: var(--color-bg-hover);
	}

	.chapter-list {
		background: var(--color-section-bg);
		border-radius: 12px;
		padding: 1.5rem;
	}

	.chapter-list h3 {
		margin: 0 0 1rem 0;
		color: var(--color-link);
		font-size: 1.2rem;
	}

	.chapter-list ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.chapter-list li {
		padding: 1rem;
		border-bottom: 1px solid var(--color-section-border);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		transition: background-color 0.2s;
	}

	.chapter-list li:hover {
		background-color: var(--color-bg-hover);
	}

	.chapter-content {
		flex: 1;
	}

	.chapter-arrow {
		color: var(--color-secondary);
		flex-shrink: 0;
	}

	.chapter-list li:hover .chapter-arrow {
		color: var(--color-accent);
	}

	.chapter-title {
		display: block;
		font-weight: 500;
		color: var(--color-text);
		margin-bottom: 0.3rem;
	}

	.chapter-desc {
		margin: 0;
		font-size: 0.95rem;
		color: var(--color-secondary);
	}

	@media (max-width: 640px) {
		.story-overview {
			margin: 1rem;
			padding: 1.5rem;
		}

		.story-stats {
			flex-direction: column;
			gap: 1rem;
			align-items: center;
		}

		.story-header h1 {
			font-size: 1.8rem;
		}
	}

	.story-meta-row {
		display: flex;
		align-items: center;
		gap: 0.7em;
		margin: 0.5em 0 0.2em 0;
		flex-wrap: wrap;
	}

	.age-rating {
		background: var(--color-bg-alt);
		color: var(--color-primary);
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

	.story-reactions {
		margin-top: 0.8rem;
	}
</style>
