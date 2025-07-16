<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import CharacterProfile from '$lib/comp/characters/CharacterProfile.svelte';
	import { fetchCharacterById } from '$lib/db/characters';
	import type { Character } from '$lib/db/characters';

	let character: Character | null = null;
	let loading = true;
	let error: string | null = null;

	$: id = $page.params.id;

	onMount(async () => {
		try {
			character = await fetchCharacterById(id);
		} catch (err) {
			error = (err as Error).message;
		}
		loading = false;
	});
</script>

{#if loading}
	<p class="muted">Loading...</p>
{:else if error}
	<p class="error">{error}</p>
{:else if !character}
	<p class="muted">Character not found.</p>
{:else}
	<CharacterProfile {character} />
{/if}

<style>
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
</style>
