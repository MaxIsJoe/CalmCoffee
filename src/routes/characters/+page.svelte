<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchCharacters, fetchMyCharacters } from '$lib/db/characters';
	import { user } from '$lib/stores/user';
	import { get } from 'svelte/store';
	import type { Character } from '$lib/db/characters';

	const CHARACTER_TYPES = ['OC', 'SONA'];

	let characters: Character[] = [];
	let loading = true;
	let error: string | null = null;

	let search = '';
	let typeFilter: string | null = null;
	let sort = 'popular';
	let currentPage = 1;
	let itemsPerPage = 10;
	let totalItems = 0;
	let totalPages = 1;

	async function loadCharacters() {
		loading = true;
		error = null;
		try {
			const result = await fetchCharacters({
				search,
				typeFilter,
				sort: sort as 'popular' | 'newest',
				currentPage,
				itemsPerPage
			});
			characters = result.characters;
			totalItems = result.totalItems;
			totalPages = result.totalPages;
		} catch (e) {
			error = (e as Error).message;
			characters = [];
		}
		loading = false;
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		loadCharacters();
	}

	$: if (search || typeFilter || sort) {
		currentPage = 1;
		loadCharacters();
	}

	let myCharacters: Character[] = [];
	async function loadMyCharacters() {
		myCharacters = await fetchMyCharacters();
	}

	onMount(async () => {
		await loadCharacters();
		await loadMyCharacters();
	});
</script>

<svelte:head>
	<title>Characters - Calm Coffee</title>
	<meta
		name="description"
		content="Discover and catalogue your original characters (OCs) and Sonas in the Calm Coffee community. Share your character designs and stories."
	/>
	<meta
		name="keywords"
		content="original characters, OCs, sonas, character creation, character design"
	/>
	<meta property="og:title" content="Characters - Calm Coffee" />
	<meta
		property="og:description"
		content="Discover and create original characters (OCs) and sonas in the Calm Coffee community. Share your character designs and stories."
	/>
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Characters - Calm Coffee" />
	<meta
		name="twitter:description"
		content="Discover and catalogue your original characters (OCs) and sonas in the Calm Coffee community. Share your character designs and stories."
	/>
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
		background: var(--color-card-bg);
		border: 1px solid var(--color-border);
		color: var(--color-text);
		border-radius: 6px;
		padding: 0.4em 0.8em;
		font-size: 1em;
		transition: border 0.15s;
	}
	.input:focus {
		border-color: var(--color-accent);
		outline: none;
	}
	.btn-primary {
		background: var(--color-btn-primary, var(--color-link));
		color: var(--color-btn-primary-text, #fff);
		border: none;
		border-radius: 6px;
		padding: 0.5em 1.2em;
		font-size: 1em;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}
	.btn-primary:hover {
		background: var(--color-btn-primary-hover, var(--color-link-hover));
	}
	.characters-header h1 {
		color: var(--color-primary);
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
		background: var(--color-character-card-bg, var(--color-card-bg));
		border-radius: 10px;
		box-shadow: 0 2px 8px var(--color-character-card-shadow, var(--color-card-shadow));
		margin-bottom: 1.2em;
		padding: 1.2em 1.5em;
		display: flex;
		align-items: center;
		gap: 1.2em;
		border: 1px solid var(--color-character-card-border, var(--color-border));
	}
	.character-item:hover {
		border-color: var(--color-border);
		box-shadow: 0 2px 8px var(--color-card-shadow);
	}
	.character-link {
		text-decoration: none;
		color: inherit;
		display: flex;
		align-items: center;
		gap: 1.2em;
	}
	.character-avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		object-fit: cover;
		background: var(--color-character-avatar-bg, var(--color-secondary));
		border: 2px solid var(--color-character-avatar-border, var(--color-border));
		box-shadow: 0 1px 4px var(--color-character-avatar-shadow, var(--color-card-shadow));
	}
	.character-info {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
	}
	.character-name {
		font-size: 1.15em;
		font-weight: 600;
		color: var(--color-character-name, var(--color-link));
	}
	.character-type {
		font-size: 0.98em;
		color: var(--color-character-type, var(--color-accent));
	}
	.character-gender,
	.character-popularity {
		font-size: 0.97em;
		color: var(--color-character-gender, var(--color-secondary));
	}
	.character-creator {
		font-size: 0.93rem;
		color: var(--color-secondary);
		margin-top: 0.1rem;
	}
	.muted {
		color: var(--color-muted);
		font-size: 1rem;
		margin: 2rem 0;
		text-align: center;
	}
	.error {
		color: var(--color-error);
		font-weight: 500;
		margin: 2rem 0;
		text-align: center;
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
		background: var(--color-bg-alt);
		border-radius: 12px;
		padding: 1.2rem 1rem;
		box-shadow: 0 2px 8px var(--color-card-shadow);
	}
	.my-characters-title {
		font-size: 1.15rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--color-primary);
	}
	.my-characters-cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1.1rem;
	}
	.my-character-card {
		background: var(--color-card-bg);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 0.7rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
		justify-content: flex-start;
		box-shadow: 0 1px 2px var(--color-card-shadow);
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
		gap: 0.5em;
		margin-top: 1.5em;
		justify-content: center;
	}
	.pagination-btn {
		background: var(--color-btn-primary, var(--color-link));
		color: var(--color-btn-primary-text, #fff);
		border: none;
		border-radius: 5px;
		padding: 0.3em 1em;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
	}
	.pagination-btn:disabled {
		background: var(--color-border);
		color: var(--color-secondary);
		cursor: not-allowed;
	}
	.page-numbers {
		display: flex;
		gap: 0.5rem;
	}
	.page-number {
		font-size: 1em;
		color: var(--color-secondary);
		margin: 0 0.3em;
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
