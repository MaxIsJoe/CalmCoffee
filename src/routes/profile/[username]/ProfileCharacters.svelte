<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchCharactersByCreator } from '$lib/db/characters';
	import type { Character } from '$lib/db/characters';
	import type { Profile } from '$lib/db/profile';

	export let profile: Profile | null;

	let characters: Character[] = [];
	let loading: boolean = true;
	let error: string | null = null;

	let page: number = 1;
	let pageSize: number = 12;
	let total: number = 0;
	let totalPages: number = 1;

	const genderFlags = {
		M: '🧙‍♂️',
		F: '🧙‍♀️',
		NB: '🧙‍⚧️',
		I: '⚪'
	};

	async function loadCharacters() {
		if (!profile?.account_id) return;
		loading = true;
		error = null;
		try {
			const result = await fetchCharactersByCreator(profile.account_id, page, pageSize);
			characters = result.data;
			total = result.total;
			totalPages = result.totalPages;
		} catch (e) {
			error = (e as Error).message;
			characters = [];
			total = 0;
			totalPages = 1;
		}
		loading = false;
	}

	$: if (profile) loadCharacters();
	$: if (page) loadCharacters();

	function prevPage() {
		if (page > 1) page -= 1;
	}
	function nextPage() {
		if (page < totalPages) page += 1;
	}
</script>

<div class="characters-tab-container">
	{#if loading}
		<p class="characters-loading">Loading characters...</p>
	{:else if error}
		<p class="characters-error">{error}</p>
	{:else if characters.length === 0}
		<p class="characters-empty">No characters found.</p>
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
		{#if totalPages > 1}
			<div class="characters-pagination">
				<button on:click={prevPage} disabled={page === 1}>&lt; Prev</button>
				<span>Page {page} of {totalPages}</span>
				<button on:click={nextPage} disabled={page === totalPages}>Next &gt;</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.characters-tab-container {
		width: 100%;
	}
	.characters-loading,
	.characters-error,
	.characters-empty {
		color: var(--color-secondary);
		text-align: center;
		margin: 2rem 0;
	}
	.characters-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 1.5rem;
		margin: 1.5rem 0 2.5rem 0;
	}
	.character-card {
		background: var(--color-card-bg);
		border-radius: 12px;
		box-shadow: 0 2px 12px var(--color-card-shadow);
		padding: 1.2rem 1rem 1.1rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: box-shadow 0.15s;
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
		background: var(--color-bg-hover);
		border: 2px solid var(--color-border);
		margin-bottom: 0.7rem;
	}
	.character-card-avatar-placeholder {
		background: var(--color-bg-hover);
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
		background: var(--color-bg-hover);
		color: var(--color-link);
	}
	.character-tag.type {
		background: var(--color-bg-alt);
		color: var(--color-primary);
	}
	.character-tag.pronouns {
		background: var(--color-bg-hover);
		color: var(--color-secondary);
	}
	.character-tag.gender {
		background: var(--color-bg-hover);
		color: var(--color-secondary);
	}
	.characters-pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1.2rem;
		margin: 1.5rem 0 0 0;
	}
	.characters-pagination button {
		background: var(--color-link);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 6px;
		padding: 0.3rem 1.1rem;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.15s;
	}
	.characters-pagination button:disabled {
		background: var(--color-secondary);
		cursor: not-allowed;
	}
	.characters-pagination span {
		font-size: 1.05rem;
		color: var(--color-primary);
	}
</style>
