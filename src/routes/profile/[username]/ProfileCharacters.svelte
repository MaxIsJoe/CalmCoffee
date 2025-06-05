<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Database } from '../../../../database.types';

	export let profile;

	let characters: Database['public']['Tables']['characters']['Row'][] = [];
	let loading = true;
	let error: string | null = null;

	let page = 1;
	let pageSize = 12;
	let total = 0;
	let totalPages = 1;

	const genderFlags = {
		M: '🧙‍♂️',
		F: '🧙‍♀️',
		NB: '🧙‍⚧️',
		I: '⚪'
	};

	async function fetchCharacters() {
		if (!profile?.account_id) return;
		loading = true;
		error = null;
		const from = (page - 1) * pageSize;
		const to = from + pageSize - 1;
		const {
			data,
			error: err,
			count
		} = await supabase
			.from('characters')
			.select('*', { count: 'exact' })
			.eq('creator', profile.account_id)
			.order('created_at', { ascending: false })
			.range(from, to);

		if (err) {
			error = err.message;
			characters = [];
			total = 0;
			totalPages = 1;
		} else {
			characters = data || [];
			total = count || 0;
			totalPages = Math.max(1, Math.ceil(total / pageSize));
		}
		loading = false;
	}

	$: if (profile) fetchCharacters();
	$: if (page) fetchCharacters();

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
		color: #888;
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
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(30, 34, 54, 0.07);
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
		background: #f3f4f6;
		border: 2px solid #e5e7eb;
		margin-bottom: 0.7rem;
	}
	.character-card-avatar-placeholder {
		background: #e0e7ef;
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
</style>
