<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Database } from '../../../database.types';
	import { user } from '$lib/stores/user';
	import { coffeeMarkdown } from '$lib/md/coffeeMarkdown';
	import { usernameCache } from '$lib/stores/username_cache';
	import StoryReactions from '$lib/comp/story/StoryReactions.svelte';

	type Story = Database['public']['Tables']['stories']['Row'] & {
		tags?: string[];
		reaction_counts?: Record<string, number>;
	};

	let stories: Story[] = [];
	let authors: Record<string, string> = {};
	let loading = true;
	let error = '';

	// Filter/search state
	let search = '';
	let ageRating = '';
	let sort = 'newest';

	// Pagination state
	let currentPage = 1;
	let itemsPerPage = 10;
	let totalItems = 0;
	let totalPages = 1;

	let filteredStories: Story[] = [];

	let loadingStep = 'Fetching stories...';

	const ageRatings = ['Everyone', 'Teens', 'Mature', 'Adult'];

	async function fetchStories() {
		loading = true;
		loadingStep = 'Fetching stories...';
		
		// First get total count
		let countQuery = supabase
			.from('stories')
			.select('id', { count: 'exact', head: true })
			.eq('is_published', true);

		if (ageRating) {
			countQuery = countQuery.eq('age_rating', ageRating);
		}

		const { count, error: countError } = await countQuery;
		if (countError) {
			error = countError.message;
			stories = [];
			loading = false;
			return;
		}

		totalItems = count || 0;
		totalPages = Math.ceil(totalItems / itemsPerPage);

		// Then fetch the actual stories
		let query = supabase
			.from('stories')
			.select(`
				id, 
				title, 
				description, 
				age_rating, 
				created_at, 
				user_id, 
				tags, 
				updated_at,
				stories_reactions (
					reaction
				)
			`)
			.eq('is_published', true)
			.range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

		if (ageRating) {
			query = query.eq('age_rating', ageRating);
		}

		// Apply sorting
		if (sort === 'newest') {
			query = query.order('created_at', { ascending: false });
		} else if (sort === 'oldest') {
			query = query.order('created_at', { ascending: true });
		} else if (sort === 'recently-updated') {
			query = query.order('updated_at', { ascending: false });
		}

		const { data, error: fetchError } = await query;
		if (fetchError) {
			error = fetchError.message;
			stories = [];
		} else {
			stories = (data || []).map(story => {
				// Count reactions
				const reactionCounts: Record<string, number> = {};
				(story.stories_reactions || []).forEach((r: { reaction: string }) => {
					reactionCounts[r.reaction] = (reactionCounts[r.reaction] || 0) + 1;
				});
				return {
					...story,
					reaction_counts: reactionCounts
				};
			}) as Story[];
			loadingStep = 'Fetching author usernames...';
			const userIds = Array.from(new Set(stories.map((s) => s.user_id).filter(Boolean)));
			authors = {};
			await Promise.all(
				userIds.map(async (id) => {
					if (id === null) return; // Skip if already fetched
					const username = await usernameCache.getUsername(id);
					if (username) authors[id] = username;
				})
			);
		}
		loading = false;
		loadingStep = '';
	}

	onMount(fetchStories);

	$: filteredStories = stories
		.filter(
			(story) =>
				!search ||
				story.title?.toLowerCase().includes(search.toLowerCase()) ||
				story.description?.toLowerCase().includes(search.toLowerCase())
		)
		.sort((a, b) => {
			if (sort === 'newest') {
				return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
			}
			if (sort === 'oldest') {
				return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
			}
			if (sort === 'recently-updated') {
				return (
					new Date(b.updated_at || b.created_at || '').getTime() -
					new Date(a.updated_at || a.created_at || '').getTime()
				);
			}
			if (sort === 'popular') {
				const aPositiveReactions = (a.reaction_counts?.['0'] || 0) + (a.reaction_counts?.['1'] || 0);
				const bPositiveReactions = (b.reaction_counts?.['0'] || 0) + (b.reaction_counts?.['1'] || 0);
				return bPositiveReactions - aPositiveReactions;
			}
			return 0;
		});

	function goToStory(id: string) {
		window.location.href = `/read/${id}`;
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		fetchStories();
	}

	$: if (search || ageRating || sort) {
		currentPage = 1; // Reset to first page when filters change
		fetchStories();
	}
</script>

<h2>Read Stories</h2>

{#if $user}
	<div class="story-manage-bar">
		<a href="/create" class="manage-stories-btn">Create/Manage Stories</a>
	</div>
{/if}

<div class="story-filters">
	<input
		type="text"
		placeholder="Search by title or description"
		bind:value={search}
		class="search-input"
	/>
	<select bind:value={ageRating} on:change={() => { currentPage = 1; fetchStories(); }}>
		<option value="">All Age Ratings</option>
		{#each ageRatings as rating}
			<option value={rating}>{rating}</option>
		{/each}
	</select>
	<select bind:value={sort} on:change={() => { currentPage = 1; fetchStories(); }}>
		<option value="newest">Newest</option>
		<option value="oldest">Oldest</option>
		<option value="recently-updated">Recently Updated</option>
		<option value="popular">Most Popular</option>
	</select>
</div>

{#if loading}
	<div class="story-loading">
		<div class="spinner"></div>
		<p>Loading stories, please wait...</p>
		{#if loadingStep}
			<p class="loading-step">{loadingStep}</p>
		{/if}
	</div>
{:else if error}
	<p style="color:red">{error}</p>
{:else if filteredStories.length === 0}
	<p>No stories found.</p>
{:else}
	<ul class="story-list">
		{#each filteredStories as story}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<li class="story-item" on:click={() => goToStory(story.id)} tabindex="0">
				<h3>{story.title}</h3>
				{#if story.user_id && authors[story.user_id]}
					<p class="story-author">By <span>{authors[story.user_id]}</span></p>
				{/if}
				{#if story.description}
					<p>{@html coffeeMarkdown(story.description)}</p>
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
				<small>
					{story.created_at && `Created: ${new Date(story.created_at).toLocaleDateString()}`}
					{#if story.updated_at && story.updated_at !== story.created_at}
						<span style="margin-left:1.2em;">
							Last updated: {new Date(story.updated_at).toLocaleDateString()}
						</span>
					{/if}
				</small>
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="story-reactions" on:click|stopPropagation>
					<StoryReactions storyId={story.id} />
				</div>
			</li>
		{/each}
	</ul>
{/if}

{#if !loading && !error && totalPages > 1}
	<div class="pagination">
		<button 
			class="pagination-btn" 
			on:click={() => goToPage(currentPage - 1)}
			disabled={currentPage === 1}
		>
			Previous
		</button>
		<div class="page-numbers">
			{#each Array(totalPages) as _, i}
				<button 
					class="page-number {currentPage === i + 1 ? 'active' : ''}"
					on:click={() => goToPage(i + 1)}
				>
					{i + 1}
				</button>
			{/each}
		</div>
		<button 
			class="pagination-btn" 
			on:click={() => goToPage(currentPage + 1)}
			disabled={currentPage === totalPages}
		>
			Next
		</button>
	</div>
{/if}

<style>
	.story-filters {
		display: flex;
		gap: 1rem;
		margin: 1.5rem auto 1rem auto;
		max-width: 700px;
		justify-content: flex-start;
		align-items: center;
	}
	.search-input {
		flex: 1;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid #cbd5e1;
		font-size: 1rem;
	}
	.story-filters select {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid #cbd5e1;
		font-size: 1rem;
	}
	.story-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 700px;
		margin: 2rem auto;
	}
	.story-item {
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
		padding: 1.5rem 2rem;
		cursor: pointer;
		transition:
			box-shadow 0.2s,
			background 0.2s;
		outline: none;
	}
	.story-item:hover,
	.story-item:focus {
		background: #f3f4f6;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
	}
	.story-item h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.3rem;
		color: #4f46e5;
	}
	.story-item p {
		margin: 0 0 0.5rem 0;
		color: #444;
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
	.story-tag:hover,
	.story-tag:focus {
		background: #e0d7ce;
		color: #a67c52;
		outline: none;
	}
	.story-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 3rem 0 2rem 0;
	}
	.story-loading .spinner {
		width: 38px;
		height: 38px;
		border: 4px solid #e0e7ff;
		border-top: 4px solid #4f46e5;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1.2rem;
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	.story-loading p {
		color: #4f46e5;
		font-size: 1.1rem;
		font-weight: 500;
	}
	.story-loading .loading-step {
		color: #888;
		font-size: 1rem;
		margin-top: 0.3rem;
	}
	.story-manage-bar {
		display: flex;
		justify-content: flex-end;
		max-width: 700px;
		margin: 0 auto 0.5rem auto;
	}
	.manage-stories-btn {
		background: linear-gradient(90deg, #a67c52 60%, #7c5e48 100%);
		color: #fffdfa;
		padding: 0.55em 1.3em;
		border-radius: 6px;
		font-size: 1.07rem;
		font-weight: 500;
		text-decoration: none;
		border: none;
		box-shadow: 0 2px 6px rgba(124, 94, 72, 0.07);
		transition:
			background 0.18s,
			box-shadow 0.18s;
		cursor: pointer;
	}
	.manage-stories-btn:hover {
		background: linear-gradient(90deg, #bfa07a 60%, #a67c52 100%);
	}
	.story-reactions {
		margin-top: 0.8rem;
	}
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin: 2rem 0;
	}

	.pagination-btn {
		padding: 0.5rem 1rem;
		border: 1px solid #cbd5e1;
		border-radius: 6px;
		background: white;
		color: #4f46e5;
		cursor: pointer;
		transition: all 0.2s;
	}

	.pagination-btn:hover:not(:disabled) {
		background: #4f46e5;
		color: white;
	}

	.pagination-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-numbers {
		display: flex;
		gap: 0.5rem;
	}

	.page-number {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #cbd5e1;
		border-radius: 6px;
		background: white;
		color: #4f46e5;
		cursor: pointer;
		transition: all 0.2s;
	}

	.page-number:hover:not(.active) {
		background: #e0e7ff;
	}

	.page-number.active {
		background: #4f46e5;
		color: white;
		border-color: #4f46e5;
	}
</style>
