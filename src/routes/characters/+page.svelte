<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Database } from '../../../database.types';
	import { user } from '$lib/stores/user';
	import { get } from 'svelte/store';

	type Character = Database['public']['Tables']['characters']['Row'] & {
		profiles: { username: string } | null;
		characters_reactions: { reaction: string }[] | null;
		reaction_counts: Record<string, number>;
	};
	const CHARACTER_TYPES = ['OC', 'SONA'];

	let characters: Character[] = [];
	let loading = true;
	let error: string | null = null;

	let search = '';
	let typeFilter: string | null = null;
	let sort = 'popular'; // Default to popular
	let currentPage = 1;
	let itemsPerPage = 10;
	let totalItems = 0;
	let totalPages = 1;

	async function fetchCharacters() {
		loading = true;
		error = null;

		// First get total count
		let countQuery = supabase
			.from('characters')
			.select('id', { count: 'exact', head: true });

		if (search.trim()) {
			countQuery = countQuery.ilike('character_name', `%${search.trim()}%`);
		}
		if (typeFilter) {
			countQuery = countQuery.eq('character_type', typeFilter);
		}

		const { count, error: countError } = await countQuery;
		if (countError) {
			error = countError.message;
			characters = [];
			loading = false;
			return;
		}

		totalItems = count || 0;
		totalPages = Math.ceil(totalItems / itemsPerPage);

		// Then fetch the actual characters with reactions
		let query = supabase
			.from('characters')
			.select(`
				*,
				profiles:creator(username),
				characters_reactions (
					reaction
				)
			`)
			.range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

		if (search.trim()) {
			query = query.ilike('character_name', `%${search.trim()}%`);
		}
		if (typeFilter) {
			query = query.eq('character_type', typeFilter);
		}

		// Apply sorting
		if (sort === 'newest') {
			query = query.order('created_at', { ascending: false });
		} else if (sort === 'popular') {
			// For popular sorting, we'll need to do it client-side since we need to count reactions
			query = query.order('created_at', { ascending: false });
		}

		const { data, error: err } = await query;
		if (err) {
			error = err.message;
			characters = [];
		} else {
			// Process the data to add reaction counts
			characters = (data || []).map((char: any) => {
				const reactionCounts: Record<string, number> = {};
				(char.characters_reactions || []).forEach((r: { reaction: string }) => {
					reactionCounts[r.reaction] = (reactionCounts[r.reaction] || 0) + 1;
				});
				return {
					...char,
					reaction_counts: reactionCounts
				} as Character; // Cast to Character to ensure type compatibility
			});

			// Sort by popularity if needed
			if (sort === 'popular') {
				characters.sort((a, b) => {
					const aPositiveReactions = ((a.reaction_counts || {})['0'] || 0) + ((a.reaction_counts || {})['1'] || 0);
					const bPositiveReactions = ((b.reaction_counts || {})['0'] || 0) + ((b.reaction_counts || {})['1'] || 0);
					return bPositiveReactions - aPositiveReactions;
				});
			}
		}
		loading = false;
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		fetchCharacters();
	}

	$: if (search || typeFilter || sort) {
		currentPage = 1; // Reset to first page when filters change
		fetchCharacters();
	}

	let myCharacters: Character[] = [];

	async function fetchMyCharacters() {
		const currentUser = get(user);
		if (!currentUser) {
			myCharacters = [];
			return;
		}
		const { data, error: err } = await supabase
			.from('characters')
			.select('*,profiles:creator(username)')
			.eq('creator', currentUser.usr?.id)
			.order('created_at', { ascending: false });
		if (err) {
			myCharacters = [];
		} else {
			myCharacters = data ?? [];
		}
	}

	onMount(async () => {
		await fetchCharacters();
		await fetchMyCharacters();
	});
</script>

<svelte:head>
	<title>Characters - Calm Coffee</title>
	<meta name="description" content="Discover and catalogue your original characters (OCs) and Sonas in the Calm Coffee community. Share your character designs and stories." />
	<meta name="keywords" content="original characters, OCs, sonas, character creation, character design" />
	<meta property="og:title" content="Characters - Calm Coffee" />
	<meta property="og:description" content="Discover and create original characters (OCs) and sonas in the Calm Coffee community. Share your character designs and stories." />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Characters - Calm Coffee" />
	<meta name="twitter:description" content="Discover and catalogue your original characters (OCs) and sonas in the Calm Coffee community. Share your character designs and stories." />
</svelte:head>

<div class="characters-header">
	<h1>Characters</h1>
	<div class="characters-controls">
		<input type="text" placeholder="Search by name..." bind:value={search} class="input" />
		<select bind:value={typeFilter} class="input">
			<option value={null}>All Types</option>
			{#each CHARACTER_TYPES as t}
				<option value={t}>{t}</option>
			{/each}
		</select>
		<select bind:value={sort} class="input">
			<option value="popular">Most Popular</option>
			<option value="newest">Newest</option>
		</select>
		{#if $user}
			<a href="/characters/create" class="btn-primary">Create New Character</a>
		{/if}
	</div>
</div>

<div class="characters-main">
	<div class="characters-list-section">
		{#if loading}
			<p class="muted">Loading...</p>
		{:else if error}
			<p class="error">{error}</p>
		{:else if characters.length === 0}
			<p class="muted">No characters found.</p>
		{:else}
			<ul class="character-list">
				{#each characters as char}
					<li class="character-item">
						<a href={`/characters/${char.id}`} class="character-link">
							{#if char.character_avatar}
								<img src={char.character_avatar} alt="Avatar" class="character-avatar" />
							{/if}
							<div class="character-info">
								<strong class="character-name">{char.character_name}</strong>
								<span class="character-type">{char.character_type}</span>
								{#if char.gender}
									<span class="character-gender">Gender: {char.gender}</span>
								{/if}
								{#if char.reaction_counts}
									<span class="character-popularity">
										Likes: {(char.reaction_counts['0'] || 0) + (char.reaction_counts['1'] || 0)}
									</span>
								{/if}
								{#if char.profiles && char.profiles.username}
									<span class="character-creator">by {char.profiles.username}</span>
								{:else if char.creator}
									<span class="character-creator">by {char.creator}</span>
								{/if}
							</div>
						</a>
					</li>
				{/each}
			</ul>
			{#if totalPages > 1}
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
		{/if}
	</div>
	{#if $user && myCharacters.length}
		<div class="my-characters-section">
			<h2 class="my-characters-title">Your Characters</h2>
			<div class="my-characters-cards-grid">
				{#each myCharacters as char}
					<div class="my-character-card">
						<a href={`/characters/${char.id}`}>
							{#if char.character_avatar}
								<img src={char.character_avatar} alt="Avatar" class="my-character-avatar" />
							{/if}
							<div class="my-character-name">{char.character_name}</div>
						</a>
						<a href={`/characters/${char.id}/edit`} class="edit-btn">Edit</a>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.characters-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding: 1.5rem 1.5rem 0 1.5rem;
	}
	.characters-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
		padding: 0.5rem 25px;
	}
	.input {
		padding: 0.5rem 0.9rem;
		border: 1px solid #d3d6db;
		border-radius: 6px;
		font-size: 1rem;
		background: #fafbfc;
		transition: border 0.2s;
	}
	.input:focus {
		border-color: #a3a8b8;
		outline: none;
	}
	.btn-primary {
		background: #4b4f6b;
		color: #fff;
		padding: 0.5rem 1.2rem;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 500;
		transition: background 0.2s;
		border: none;
		cursor: pointer;
	}
	.btn-primary:hover {
		background: #353857;
	}
	.character-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
		padding: 0 1.5rem 1.5rem 1.5rem;
	}
	.character-item {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 0.8rem 1.1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		transition:
			box-shadow 0.15s,
			border 0.15s;
		box-shadow: 0 1px 2px rgba(30, 34, 54, 0.03);
	}
	.character-item:hover {
		border-color: #bfc2d4;
		box-shadow: 0 2px 8px rgba(30, 34, 54, 0.07);
	}
	.character-link {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-decoration: none;
		color: inherit;
		width: 100%;
		gap: 0.7rem;
	}
	.character-avatar {
		width: 96px;
		height: 96px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #e5e7eb;
		background: #f6f7fa;
		margin-bottom: 0.5rem;
	}
	.character-info {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.character-name {
		font-size: 1.2rem;
		font-weight: 600;
	}
	.character-type {
		font-size: 0.95rem;
		color: #6b7280;
		background: #f3f4f6;
		border-radius: 4px;
		padding: 0.1rem 0.5rem;
		/* margin-left: 0.2rem; */
	}
	.character-gender,
	.character-popularity {
		font-size: 0.9rem;
		color: #8a8fa3;
		margin-top: 0.1rem;
	}
	.character-creator {
		font-size: 0.93rem;
		color: #8a8fa3;
		margin-top: 0.1rem;
	}
	.muted {
		color: #888;
		font-size: 1rem;
		margin: 1.5rem 0;
	}
	.error {
		color: #c00;
		font-weight: 500;
		margin: 1.5rem 0;
	}
	.characters-main {
		display: flex;
		gap: 2.5rem;
		align-items: flex-start;
		padding: 0 1.5rem;
	}
	.characters-list-section {
		flex: 2;
	}
	.my-characters-section {
		flex: 1;
		background: #fafbfc;
		border-radius: 12px;
		padding: 1.2rem 1rem;
		box-shadow: 0 2px 8px rgba(30, 34, 54, 0.04);
	}
	.my-characters-title {
		font-size: 1.15rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #4b4f6b;
	}
	.my-characters-cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1.1rem;
	}
	.my-character-card {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 0.7rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
		justify-content: flex-start;
		box-shadow: 0 1px 2px rgba(30, 34, 54, 0.03);
	}
	.my-character-card a {
		text-decoration: none;
		color: inherit;
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}
	.my-character-avatar {
		width: 38px;
		height: 38px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid #e5e7eb;
		background: #f6f7fa;
	}
	.my-character-name {
		font-size: 1rem;
		font-weight: 500;
		text-align: center;
	}
	.edit-btn {
		background: #4f46e5;
		color: #fff;
		border: none;
		padding: 0.3rem 0.9rem;
		border-radius: 6px;
		font-size: 0.95rem;
		cursor: pointer;
		transition: background 0.2s;
		text-decoration: none;
		margin-top: 0.5rem;
	}
	.edit-btn:hover {
		background: #3730a3;
	}
	@media (max-width: 900px) {
		.characters-main {
			flex-direction: column;
			gap: 1.5rem;
		}
		.my-characters-section {
			width: 100%;
			margin-top: 1.5rem;
		}
		.my-characters-cards-grid {
			grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		}
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
