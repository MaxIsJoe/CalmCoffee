<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Database } from '../../../../database.types';
	import CharacterProfile from '$lib/comp/characters/CharacterProfile.svelte';

	type Character = Database['public']['Tables']['characters']['Row'];

	let character: Character | null = null;
	let loading = true;
	let error: string | null = null;

	$: id = $page.params.id;

	onMount(async () => {
		const { data, error: err } = await supabase
			.from('characters')
			.select('*')
			.eq('id', id)
			.single();

		if (err) {
			error = err.message;
		} else {
			character = data;
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
		color: #888;
		font-size: 1rem;
		margin: 2rem 0;
		text-align: center;
	}
	.error {
		color: #c00;
		font-weight: 500;
		margin: 2rem 0;
		text-align: center;
	}
</style>
