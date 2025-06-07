<script>
	import MicroBlogItem from '$lib/comp/microblog/MicroBlogItem.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { page as pageStore } from '$app/stores';
	import { coffeeMarkdown } from '$lib/md/coffeeMarkdown';
	import { usernameCache } from '$lib/stores/username_cache';

	let searchTerm = '';
	let characters = [];
	let microblogs = [];
	let stories = [];

	let showAllCharacters = false;
	let showAllMicroblogs = false;
	let showAllStories = false;

	let isLoading = false;
	let loadingSteps = [];
	let currentStep = '';

	let page = {
		characters: 1,
		microblogs: 1,
		stories: 1
	};

	const ITEMS_PER_PAGE = 5;

	async function searchByTag() {
		if (!searchTerm) {
			characters = [];
			microblogs = [];
			stories = [];
			return;
		}

		isLoading = true;
		loadingSteps = [];
		currentStep = 'Starting search...';

		try {
			// Fetch only the first 6 most recent items for each table
			currentStep = 'Searching characters...';
			const charData = await supabase
				.from('characters')
				.select('*')
				.contains('tags', [searchTerm])
				.order('created_at', { ascending: false })
				.limit(ITEMS_PER_PAGE);
			loadingSteps.push('Found ' + (charData.data?.length || 0) + ' characters');

			currentStep = 'Searching microblogs...';
			const blogData = await supabase
				.from('microblogs')
				.select('*, profiles:writer(*)')
				.contains('tags', [searchTerm])
				.order('created_at', { ascending: false })
				.limit(ITEMS_PER_PAGE);
			loadingSteps.push('Found ' + (blogData.data?.length || 0) + ' microblogs');

			currentStep = 'Searching stories...';
			const storyData = await supabase
				.from('stories')
				.select('*')
				.contains('tags', [searchTerm])
				.order('created_at', { ascending: false })
				.limit(ITEMS_PER_PAGE);
			loadingSteps.push('Found ' + (storyData.data?.length || 0) + ' stories');

			characters = charData.data || [];
			// Attach profile to microblog as 'profile'
			microblogs = (blogData.data || []).map((mb) => ({
				...mb,
				profile: mb.profiles
			}));
			stories = storyData.data || [];

			// Reset pagination and view all toggles
			showAllCharacters = false;
			showAllMicroblogs = false;
			showAllStories = false;
			page = { characters: 1, microblogs: 1, stories: 1 };

			currentStep = 'Search complete!';
			loadingSteps.push('Search complete!');
		} catch (error) {
			currentStep = 'Error occurred during search';
			loadingSteps.push('Error: ' + error.message);
		} finally {
			isLoading = false;
		}
	}

	async function fetchAll(type) {
		isLoading = true;
		currentStep = `Loading more ${type}...`;
		loadingSteps.push(`Loading more ${type}...`);

		try {
			let fromTable = '';
			let selectStr = '*';
			if (type === 'characters') fromTable = 'characters';
			if (type === 'microblogs') {
				fromTable = 'microblogs';
				selectStr = '*, profiles:writer(*)';
			}
			if (type === 'stories') fromTable = 'stories';

			const { data } = await supabase
				.from(fromTable)
				.select(selectStr)
				.contains('tags', [searchTerm])
				.order('created_at', { ascending: false })
				.range((page[type] - 1) * ITEMS_PER_PAGE, page[type] * ITEMS_PER_PAGE - 1);

			if (type === 'characters') characters = data || [];
			if (type === 'microblogs') {
				microblogs = (data || []).map((mb) => ({
					...mb,
					profile: mb.profiles
				}));
			}
			if (type === 'stories') stories = data || [];

			loadingSteps.push(`Loaded ${data?.length || 0} ${type}`);
			currentStep = `Loaded ${data?.length || 0} ${type}`;
		} catch (error) {
			currentStep = `Error loading ${type}`;
			loadingSteps.push(`Error: ${error.message}`);
		} finally {
			isLoading = false;
		}
	}

	function handleViewAll(type) {
		if (type === 'characters') showAllCharacters = true;
		if (type === 'microblogs') showAllMicroblogs = true;
		if (type === 'stories') showAllStories = true;
		page[type] = 1;
		fetchAll(type);
	}

	async function handlePageChange(type, direction) {
		page[type] += direction;
		await fetchAll(type);
	}

	onMount(() => {
		const unsubscribe = pageStore.subscribe(($page) => {
			const tag = $page.url.searchParams.get('tag');
			if (tag && tag !== searchTerm) {
				searchTerm = tag;
				searchByTag();
			}
		});
		return () => unsubscribe();
	});

	// Gender emoji mapping (copied from ProfileCharacters)
	const genderFlags = {
		M: '🧙‍♂️',
		F: '🧙‍♀️',
		NB: '🧙‍⚧️',
		I: '⚪'
	};

	let storyAuthors = {};

	// Fetch usernames for stories' user_id
	async function fetchStoryAuthors(storiesList) {
		const userIds = Array.from(new Set((storiesList || []).map((s) => s.user_id).filter(Boolean)));
		const authorsObj = {};
		await Promise.all(
			userIds.map(async (id) => {
				if (!id) return;
				const username = await usernameCache.getUsername(id);
				if (username) authorsObj[id] = username;
			})
		);
		storyAuthors = authorsObj;
	}

	// When stories change, fetch authors
	$: if (stories && stories.length) fetchStoryAuthors(stories);

	function goToStory(id) {
		window.location.href = `/read/${id}`;
	}
</script>

<div class="search-bar">
	<input
		type="text"
		placeholder="Search by tag..."
		bind:value={searchTerm}
		on:keydown={(e) => {
			if (e.key === 'Enter') searchByTag();
		}}
	/>
	<button on:click={searchByTag} disabled={isLoading}>
		{#if isLoading}
			Searching...
		{:else}
			Search
		{/if}
	</button>
</div>

{#if isLoading}
	<div class="loading-indicator">
		<div class="loading-spinner"></div>
		<div class="loading-steps">
			<p class="current-step">{currentStep}</p>
			{#each loadingSteps as step}
				<p class="step">{step}</p>
			{/each}
		</div>
	</div>
{/if}

{#if characters.length || microblogs.length || stories.length}
	<section>
		<div class="section-header">
			<h2>Characters</h2>
			{#if !showAllCharacters && characters.length === ITEMS_PER_PAGE}
				<button class="view-all-btn" on:click={() => handleViewAll('characters')}>View All</button>
			{/if}
		</div>
		{#if characters.length === 0}
			<p>No characters found.</p>
		{:else}
			<div class="characters-grid">
				{#each characters as char}
					<div class="character-card">
						<a href={'/characters/' + char.id} class="character-card-link">
							{#if char.character_avatar}
								<img
									src={char.character_avatar}
									alt={char.character_name}
									class="character-card-avatar"
								/>
							{:else}
								<div class="character-card-avatar character-card-avatar-placeholder"></div>
							{/if}
							<div class="character-card-name">{char.character_name}</div>
						</a>
						<div class="character-card-tags">
							<span class="character-tag type">{char.character_type}</span>
							{#if char.pronouns}
								<span class="character-tag pronouns">{char.pronouns}</span>
							{/if}
							{#if char.gender}
								<span class="character-tag gender">
									{char.gender}
									{genderFlags[char.gender] || ''}
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			{#if showAllCharacters}
				<div class="characters-pagination">
					<button
						on:click={() => handlePageChange('characters', -1)}
						disabled={page.characters === 1}>&lt; Prev</button
					>
					<span>Page {page.characters}</span>
					<button
						on:click={() => handlePageChange('characters', 1)}
						disabled={characters.length < ITEMS_PER_PAGE}>Next &gt;</button
					>
				</div>
			{/if}
		{/if}
	</section>

	<section>
		<div class="section-header">
			<h2>Stories</h2>
			{#if !showAllStories && stories.length === ITEMS_PER_PAGE}
				<button class="view-all-btn" on:click={() => handleViewAll('stories')}>View All</button>
			{/if}
		</div>
		{#if stories.length === 0}
			<p>No stories found.</p>
		{:else}
			<ul class="story-list">
				{#each stories as story}
					<li class="story-item" on:click={() => goToStory(story.id)} tabindex="0">
						<h3>{story.title}</h3>
						{#if storyAuthors[story.user_id]}
							<p class="story-author">By <span>{storyAuthors[story.user_id]}</span></p>
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
												(window.location.href = `/search?tag=${encodeURIComponent(tag)}`)}
											>{tag}</span
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
					</li>
				{/each}
			</ul>
			{#if showAllStories}
				<div>
					<button on:click={() => handlePageChange('stories', -1)} disabled={page.stories === 1}
						>Previous</button
					>
					<span>Page {page.stories}</span>
					<button
						on:click={() => handlePageChange('stories', 1)}
						disabled={stories.length < ITEMS_PER_PAGE}>Next</button
					>
				</div>
			{/if}
		{/if}
	</section>

	<section>
		<div class="section-header">
			<h2>Microblogs</h2>
			{#if !showAllMicroblogs && microblogs.length === ITEMS_PER_PAGE}
				<button class="view-all-btn" on:click={() => handleViewAll('microblogs')}>View All</button>
			{/if}
		</div>
		{#if microblogs.length === 0}
			<p>No microblogs found.</p>
		{:else}
			<div class="card-list">
				{#each microblogs as blog}
					<div class="card">
						<MicroBlogItem mb={blog} profile={blog.profile} />
					</div>
				{/each}
			</div>
			{#if showAllMicroblogs}
				<div>
					<button
						on:click={() => handlePageChange('microblogs', -1)}
						disabled={page.microblogs === 1}>Previous</button
					>
					<span>Page {page.microblogs}</span>
					<button
						on:click={() => handlePageChange('microblogs', 1)}
						disabled={microblogs.length < ITEMS_PER_PAGE}>Next</button
					>
				</div>
			{/if}
		{/if}
	</section>
{/if}

<style>
	/* Center the search bar */
	.search-bar {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 2em;
	}

	input[type='text'] {
		padding: 0.7em 1em;
		margin: 0 0.7em 0 0;
		border: 1.5px solid #bfa07a;
		border-radius: 6px;
		font-size: 1.1em;
		width: 300px;
		max-width: 95vw;
		background: #fffdfa;
		box-shadow: 0 2px 8px rgba(124, 94, 72, 0.06);
		transition:
			border 0.2s,
			box-shadow 0.2s;
	}
	input[type='text']:focus {
		border: 1.5px solid #a67c52;
		outline: none;
		box-shadow: 0 4px 12px rgba(124, 94, 72, 0.1);
	}

	button {
		padding: 0.6em 1.3em;
		margin: 0.5em 0.7em 0.5em 0;
		border: none;
		border-radius: 6px;
		background: linear-gradient(90deg, #a67c52 60%, #7c5e48 100%);
		color: #fffdfa;
		cursor: pointer;
		font-size: 1.05em;
		font-weight: 500;
		box-shadow: 0 2px 6px rgba(124, 94, 72, 0.07);
		transition:
			background 0.2s,
			transform 0.1s;
	}
	button:disabled {
		background: #e0d7ce;
		color: #bfa07a;
		cursor: not-allowed;
	}
	button:hover:not(:disabled) {
		background: linear-gradient(90deg, #bfa07a 60%, #a67c52 100%);
		transform: translateY(-2px) scale(1.03);
	}

	section {
		margin-bottom: 2.5em;
		padding: 2em 1.5em;
		background: #fffdfa;
		border-radius: 14px;
		box-shadow: 0 4px 18px rgba(124, 94, 72, 0.08);
		border: 1.5px solid #e0d7ce;
	}

	h2 {
		margin-top: 0;
		color: #7c5e48;
		font-size: 1.5em;
		letter-spacing: 0.03em;
		margin-bottom: 0.7em;
	}

	.card-list {
		display: flex;
		flex-wrap: wrap;
		gap: 1.2em;
		margin: 0.5em 0 1.2em 0;
	}

	.card {
		background: #f8f5f2;
		border-radius: 10px;
		box-shadow: 0 2px 10px rgba(124, 94, 72, 0.07);
		border: 1px solid #e0d7ce;
		padding: 1.1em 1.3em;
		min-width: 280px;
		max-width: 420px;
		flex: 1 1 180px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		transition:
			box-shadow 0.15s,
			transform 0.12s;
	}
	.card:hover {
		box-shadow: 0 6px 18px rgba(124, 94, 72, 0.13);
		transform: translateY(-3px) scale(1.03);
	}

	span {
		font-weight: 500;
		color: #a67c52;
		margin: 0 0.7em;
	}

	p {
		color: #bfa07a;
		font-style: italic;
		margin: 0.5em 0 1em 0;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.3em;
		gap: 1em;
	}

	.view-all-btn {
		padding: 0.4em 1em;
		border: none;
		border-radius: 5px;
		background: linear-gradient(90deg, #a67c52 60%, #7c5e48 100%);
		color: #fffdfa;
		cursor: pointer;
		font-size: 1em;
		font-weight: 500;
		box-shadow: 0 2px 6px rgba(124, 94, 72, 0.07);
		transition:
			background 0.2s,
			transform 0.1s;
		margin: 0;
	}
	.view-all-btn:hover:not(:disabled) {
		background: linear-gradient(90deg, #bfa07a 60%, #a67c52 100%);
		transform: translateY(-2px) scale(1.03);
	}

	/* --- Character card styles copied from ProfileCharacters --- */
	.characters-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 1.5rem;
		margin: 1.5rem 0 2.5rem 0;
	}
	.character-card {
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(30, 34, 54, 0.07);
		padding: 1.2rem 1rem 1.1rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: box-shadow 0.15s;
		max-width: 248px;
	}
	.character-card-link {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}
	.character-card-avatar {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		object-fit: cover;
		background: #f3f4f6;
		border: 2px solid #e5e7eb;
		margin-bottom: 0.7rem;
	}
	.character-card-avatar-placeholder {
		background: #e0e7ef;
		width: 72px;
		height: 72px;
		border-radius: 50%;
		margin-bottom: 0.7rem;
	}
	.character-card-name {
		font-weight: 600;
		font-size: 1.13rem;
		margin-bottom: 0.5rem;
		text-align: center;
	}
	.character-card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}
	.character-tag {
		display: inline-block;
		padding: 0.18em 0.85em;
		border-radius: 7px;
		font-size: 0.98em;
		font-weight: 500;
		background: #eef2ff;
		color: #6366f1;
	}
	.character-tag.type {
		background: #f3f4f6;
		color: #3730a3;
	}
	.character-tag.pronouns {
		background: #e0e7ef;
		color: #4b5563;
	}
	.character-tag.gender {
		background: #e0e7ef;
		color: #4b5563;
	}
	.characters-pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1.2rem;
		margin: 1.5rem 0 0 0;
	}
	.characters-pagination button {
		background: #6366f1;
		color: #fff;
		border: none;
		border-radius: 6px;
		padding: 0.3rem 1.1rem;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.15s;
	}
	.characters-pagination button:disabled {
		background: #c7d2fe;
		cursor: not-allowed;
	}
	.characters-pagination span {
		font-size: 1.05rem;
		color: #353857;
	}

	/* --- Story list styles from read page --- */
	.story-list {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		list-style: none;
		padding: 0;
		max-width: 1200px;
		margin: 2rem auto;
	}
	.story-item {
		flex: 1 1 320px;
		max-width: 400px;
		min-width: 260px;
		margin: 0;
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
		padding: 1.5rem 2rem;
		cursor: pointer;
		transition:
			box-shadow 0.2s,
			background 0.2s;
		outline: none;
		display: flex;
		flex-direction: column;
		margin-bottom: 0;
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

	@media (max-width: 900px) {
		.card-list {
			gap: 0.7em;
		}
		.card {
			min-width: 140px;
			max-width: 100%;
			padding: 0.8em 0.7em;
		}
		.characters-grid {
			gap: 0.7em;
		}
		.character-card {
			min-width: 140px;
			max-width: 100%;
			padding: 0.8em 0.7em;
		}
		.story-list {
			gap: 0.7em;
		}
		.story-item {
			min-width: 140px;
			max-width: 100%;
			padding: 0.8em 0.7em;
		}
	}
	@media (max-width: 600px) {
		.search-bar {
			flex-direction: column;
			align-items: stretch;
			gap: 0.7em;
		}
		input[type='text'] {
			width: 100%;
			font-size: 1em;
			margin: 0 0 0.7em 0;
		}
		section {
			padding: 1em 0.5em;
		}
		h2 {
			font-size: 1.15em;
		}
		.card-list {
			flex-direction: column;
			gap: 0.7em;
		}
		.characters-grid {
			grid-template-columns: 1fr;
			gap: 0.7em;
		}
		.story-list {
			flex-direction: column;
			gap: 0.7em;
		}
	}

	.loading-indicator {
		display: flex;
		align-items: flex-start;
		gap: 1.5rem;
		margin: 2rem auto;
		padding: 1.5rem;
		background: #fffdfa;
		border-radius: 12px;
		box-shadow: 0 4px 18px rgba(124, 94, 72, 0.08);
		border: 1.5px solid #e0d7ce;
		max-width: 600px;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e0d7ce;
		border-top: 3px solid #a67c52;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		flex-shrink: 0;
	}

	.loading-steps {
		flex-grow: 1;
	}

	.current-step {
		color: #a67c52;
		font-weight: 500;
		margin: 0 0 0.5rem 0;
	}

	.step {
		color: #bfa07a;
		margin: 0.3rem 0;
		font-size: 0.95em;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@media (max-width: 600px) {
		.loading-indicator {
			flex-direction: column;
			align-items: center;
			text-align: center;
			padding: 1rem;
		}
	}
</style>
