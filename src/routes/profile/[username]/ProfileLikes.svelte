<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { ProfileType } from '$lib/types/profile';
	import type { Story } from '$lib/types/story';
	import { usernameCache } from '$lib/stores/username_cache';
	import { user } from '$lib/stores/user';
	import { coffeeMarkdown } from '$lib/md/coffeeMarkdown';

	export let profile: ProfileType;

	// Pagination
	const ITEMS_PER_PAGE = 10;
	let currentPage = 1;
	let totalItems = 0;

	// Data
	let watchedStories: Story[] = [];
	let likedStories: Story[] = [];
	let watchedCharacters: any[] = [];
	let likedCharacters: any[] = [];
	let watchedBlogs: any[] = [];
	let likedBlogs: any[] = [];
	let loading = true;
	let error: string | null = null;
	let showBlogs = false;



	// Authors cache
	let authors: Record<string, string> = {};

	async function fetchReactions() {
		if (!profile?.account_id) return;
		loading = true;
		error = null;

		try {
			// Fetch stories reactions
			const { data: storyReactions, error: storyError } = await supabase
				.from('stories_reactions')
				.select(`
					reaction,
					stories (
						id,
						title,
						description,
						created_at,
						updated_at,
						user_id,
						age_rating,
						tags
					)
				`)
				.eq('user_id', profile.account_id)
				.in('reaction', ['0', '1']);

			if (storyError) throw storyError;

			// Separate stories by reaction type
			watchedStories = [];
			likedStories = [];
			storyReactions?.forEach((r) => {
				if (r.stories) {
					if (r.reaction === '1') {
						watchedStories.push(r.stories);
					} else if (r.reaction === '0') {
						likedStories.push(r.stories);
					}
				}
			});

			// Fetch character reactions
			const { data: characterReactions, error: characterError } = await supabase
				.from('characters_reactions')
				.select(`
					reaction,
					characters (
						id,
						character_name,
						character_desc,
						character_avatar,
						character_type,
						creator,
						tags
					)
				`)
				.eq('user_id', profile.account_id)
				.in('reaction', ['0', '1']);

			if (characterError) throw characterError;

			// Separate characters by reaction type
			watchedCharacters = [];
			likedCharacters = [];
			characterReactions?.forEach((r) => {
				if (r.characters) {
					if (r.reaction === '1') {
						watchedCharacters.push(r.characters);
					} else if (r.reaction === '0') {
						likedCharacters.push(r.characters);
					}
				}
			});

			// Fetch blog reactions only if showBlogs is true
			if (showBlogs) {
				const { data: blogReactions, error: blogError } = await supabase
					.from('microblogs_reactions')
					.select(`
						reaction,
						microblogs (
							post_id,
							content,
							created_at,
							writer,
							tags
						)
					`)
					.eq('user_id', profile.account_id)
					.in('reaction', ['0', '1']);

				if (blogError) throw blogError;

				// Separate blogs by reaction type
				watchedBlogs = [];
				likedBlogs = [];
				blogReactions?.forEach((r) => {
					if (r.microblogs) {
						if (r.reaction === '1') {
							watchedBlogs.push(r.microblogs);
						} else if (r.reaction === '0') {
							likedBlogs.push(r.microblogs);
						}
					}
				});
			} else {
				watchedBlogs = [];
				likedBlogs = [];
			}

			// Fetch author usernames
			const userIds = new Set([
				...watchedStories.map((s) => s.user_id),
				...likedStories.map((s) => s.user_id),
				...(showBlogs ? [
					...watchedBlogs.map((b) => b.writer),
					...likedBlogs.map((b) => b.writer)
				] : [])
			].filter(Boolean));

			authors = {};
			await Promise.all(
				Array.from(userIds).map(async (id) => {
					if (id) {
						const username = await usernameCache.getUsername(id);
						if (username) authors[id] = username;
					}
				})
			);

			totalItems = watchedStories.length + likedStories.length + 
				watchedCharacters.length + likedCharacters.length +
				(showBlogs ? (watchedBlogs.length + likedBlogs.length) : 0);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to fetch reactions';
		} finally {
			loading = false;
		}
	}

	$: {
		if (profile?.account_id) {
			fetchReactions();
		}
	}

	function getPaginatedItems(items: any[]) {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return items.slice(start, start + ITEMS_PER_PAGE);
	}

	function goToPage(page: number) {
		currentPage = page;
	}

	async function toggleBlogs() {
		await fetchReactions();
	}
</script>

{#if loading}
	<div class="loading">Loading reactions...</div>
{:else if error}
	<div class="error">{error}</div>
{:else}
	<div class="likes-container">
		{#if $user?.profile?.username === profile.username}
			<div class="controls">
				<label class="toggle">
					<input type="checkbox" bind:checked={showBlogs} on:change|preventDefault={toggleBlogs}>
					<span class="toggle-label">Show Blog Posts</span>
				</label>
			</div>
		{/if}

		{#if watchedStories.length === 0 && watchedCharacters.length === 0 && 
			likedStories.length === 0 && likedCharacters.length === 0 && 
			(!showBlogs || (watchedBlogs.length === 0 && likedBlogs.length === 0))}
			<div class="empty-state">
				<p>It's empty here...</p>
				{#if $user?.profile?.username === profile.username}
					<p class="sub-text">Start exploring stories and characters to add reactions!</p>
				{:else}
					<p class="sub-text">This user hasn't added any reactions yet.</p>
				{/if}
			</div>
		{:else}
			<!-- Watched Section -->
			{#if watchedStories.length > 0 || watchedCharacters.length > 0 || (showBlogs && watchedBlogs.length > 0)}
				<section class="reaction-section">
					<h2>👀 Watching</h2>
					
					<!-- Watched Stories -->
					{#if watchedStories.length > 0}
						<div class="section-header">
							<h3>Stories</h3>
						</div>
						<div class="stories-grid">
							{#each getPaginatedItems(watchedStories) as story}
								<a href="/read/{story.id}" class="story-card">
									<h3>{story.title}</h3>
									<p class="author">by {authors[story.user_id || ''] || 'Unknown'}</p>
									{#if story.description}
										<p class="description">{@html coffeeMarkdown(story.description)}</p>
									{/if}
								</a>
							{/each}
						</div>
					{/if}

					<!-- Watched Characters -->
					{#if watchedCharacters.length > 0}
						<div class="section-header">
							<h3>Characters</h3>
						</div>
						<div class="characters-grid">
							{#each getPaginatedItems(watchedCharacters) as character}
								<a href="/characters/{character.id}" class="character-card">
									{#if character.character_avatar}
										<img src={character.character_avatar} alt={character.character_name} />
									{/if}
									<h3>{character.character_name}</h3>
									<p class="type">{character.character_type}</p>
								</a>
							{/each}
						</div>
					{/if}

					<!-- Watched Blogs -->
					{#if showBlogs && watchedBlogs.length > 0}
						<div class="section-header">
							<h3>Blog Posts</h3>
						</div>
						<div class="blogs-grid">
							{#each getPaginatedItems(watchedBlogs) as blog}
								<a href="/blog/{blog.post_id}" class="blog-card">
									<h3>Blog Post</h3>
									<p class="author">by {authors[blog.writer] || 'Unknown'}</p>
									<p class="date">{new Date(blog.created_at).toLocaleDateString()}</p>
									<p class="content">{@html coffeeMarkdown(blog.content)}</p>
								</a>
							{/each}
						</div>
					{/if}
				</section>
			{/if}

			<!-- Liked Section -->
			{#if likedStories.length > 0 || likedCharacters.length > 0 || (showBlogs && likedBlogs.length > 0)}
				<section class="reaction-section">
					<h2>💖 Liked</h2>
					
					<!-- Liked Stories -->
					{#if likedStories.length > 0}
						<div class="section-header">
							<h3>Stories</h3>
						</div>
						<div class="stories-grid">
							{#each getPaginatedItems(likedStories) as story}
								<a href="/read/{story.id}" class="story-card">
									<h3>{story.title}</h3>
									<p class="author">by {authors[story.user_id || ''] || 'Unknown'}</p>
									{#if story.description}
										<p class="description">{@html coffeeMarkdown(story.description)}</p>
									{/if}
								</a>
							{/each}
						</div>
					{/if}

					<!-- Liked Characters -->
					{#if likedCharacters.length > 0}
						<div class="section-header">
							<h3>Characters</h3>
						</div>
						<div class="characters-grid">
							{#each getPaginatedItems(likedCharacters) as character}
								<a href="/characters/{character.id}" class="character-card">
									{#if character.character_avatar}
										<img src={character.character_avatar} alt={character.character_name} />
									{/if}
									<h3>{character.character_name}</h3>
									<p class="type">{character.character_type}</p>
								</a>
							{/each}
						</div>
					{/if}

					<!-- Liked Blogs -->
					{#if showBlogs && likedBlogs.length > 0}
						<div class="section-header">
							<h3>Blog Posts</h3>
						</div>
						<div class="blogs-grid">
							{#each getPaginatedItems(likedBlogs) as blog}
								<a href="/blog/{blog.post_id}" class="blog-card">
									<h3>Blog Post</h3>
									<p class="author">by {authors[blog.writer] || 'Unknown'}</p>
									<p class="date">{new Date(blog.created_at).toLocaleDateString()}</p>
									<p class="content">{@html coffeeMarkdown(blog.content)}</p>
								</a>
							{/each}
						</div>
					{/if}
				</section>
			{/if}

			<!-- Pagination -->
			{#if totalItems > ITEMS_PER_PAGE}
				<div class="pagination">
					{#each Array(Math.ceil(totalItems / ITEMS_PER_PAGE)) as _, i}
						<button
							class:active={currentPage === i + 1}
							on:click={() => goToPage(i + 1)}
						>
							{i + 1}
						</button>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.likes-container {
		padding: 1rem;
	}

	.reaction-section {
		margin-bottom: 2rem;
	}

	.reaction-section h2 {
		color: #4f46e5;
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}

	.section-header {
		margin: 1.5rem 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid #e5e7eb;
	}

	.section-header h3 {
		color: #374151;
		font-size: 1.2rem;
		margin: 0;
	}

	.stories-grid,
	.characters-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.story-card,
	.character-card {
		background: white;
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.story-card:hover,
	.character-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.story-card h3,
	.character-card h3 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 1.1rem;
	}

	.author,
	.type {
		color: #6b7280;
		font-size: 0.9rem;
		margin: 0.25rem 0;
	}

	.description {
		font-size: 0.9rem;
		color: #4b5563;
		margin: 0.5rem 0 0 0;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.character-card img {
		width: 100%;
		height: 200px;
		object-fit: cover;
		border-radius: 4px;
		margin-bottom: 0.5rem;
	}

	.pagination {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 2rem;
	}

	.pagination button {
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		padding: 0.5rem 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.pagination button.active {
		background: #4f46e5;
		color: white;
		border-color: #4f46e5;
	}

	.pagination button:hover:not(.active) {
		background: #e5e7eb;
	}

	.loading {
		text-align: center;
		padding: 2rem;
		color: #6b7280;
	}

	.error {
		text-align: center;
		padding: 2rem;
		color: #dc2626;
		background: #fef2f2;
		border-radius: 8px;
	}

	.blogs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.blog-card {
		background: white;
		border-radius: 8px;
		padding: 1.2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.blog-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.blog-card h3 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 1.1rem;
	}

	.blog-card .date {
		color: #6b7280;
		font-size: 0.85rem;
		margin: 0.25rem 0;
	}

	.blog-card .content {
		font-size: 0.9rem;
		color: #4b5563;
		margin: 0.5rem 0 0 0;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-height: 1.5;
	}

	.controls {
		margin-bottom: 1.5rem;
		padding: 0.5rem;
		background: #f8fafc;
		border-radius: 8px;
		display: flex;
		justify-content: flex-end;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.toggle input[type="checkbox"] {
		width: 1.2rem;
		height: 1.2rem;
		cursor: pointer;
	}

	.toggle-label {
		font-size: 0.95rem;
		color: #4b5563;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		background: #f8fafc;
		border-radius: 12px;
		margin: 1rem 0;
	}

	.empty-state p {
		margin: 0;
		color: #4b5563;
		font-size: 1.1rem;
	}

	.empty-state .sub-text {
		margin-top: 0.5rem;
		color: #6b7280;
		font-size: 0.95rem;
	}
</style>
