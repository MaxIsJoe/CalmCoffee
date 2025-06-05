<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Database } from '../../../database.types';
	import { user } from '$lib/stores/user';
	import { get } from 'svelte/store';

	type Character = Database['public']['Tables']['characters']['Row'] & {
		profiles: { username: string } | null;
	};
	const CHARACTER_TYPES = ['OC', 'SONA'];

	let characters: Character[] = [];
	let loading = true;
	let error: string | null = null;

	let search = '';
	let typeFilter: string | null = null;

	async function fetchCharacters() {
		loading = true;
		error = null;
		let query = supabase
			.from('characters')
			.select('*,profiles:creator(username)')
			.order('created_at', { ascending: false })
			.limit(20);

		if (search.trim()) {
			query = query.ilike('character_name', `%${search.trim()}%`);
		}
		if (typeFilter) {
			query = query.eq('character_type', typeFilter);
		}

		const { data, error: err } = await query;
		if (err) {
			error = err.message;
			characters = [];
		} else {
			characters = data ?? [];
		}
		loading = false;
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

	$: search, typeFilter, fetchCharacters();
	$: if ($user) fetchMyCharacters();
</script>

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
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		padding: 0 1.5rem 1.5rem 1.5rem;
	}
	.character-item {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 0.8rem 1.1rem;
		display: flex;
		align-items: center;
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
		align-items: center;
		text-decoration: none;
		color: inherit;
		width: 100%;
		gap: 1.1rem;
	}
	.character-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid #e5e7eb;
		background: #f6f7fa;
	}
	.character-info {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.character-name {
		font-size: 1.1rem;
		font-weight: 600;
	}
	.character-type {
		font-size: 0.95rem;
		color: #6b7280;
		background: #f3f4f6;
		border-radius: 4px;
		padding: 0.1rem 0.5rem;
		margin-left: 0.2rem;
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
</style>
