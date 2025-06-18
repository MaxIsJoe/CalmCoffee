<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { AgeRating } from '$lib/types/story';
	import type { ProfileType } from '$lib/types/profile';
	import MicroBlogItem from '$lib/comp/microblog/MicroBlogItem.svelte';

	export let profile: ProfileType;
	let microblogs: BlogType[] = [];
	let loading = true;
	let error = '';

	interface BlogType {
		age_rating: AgeRating;
		content: string;
		created_at: string;
		edited_at: string;
		post_id: number;
		styles: any;
		writer: string;
	}

	async function fetchMicroblogs() {
		loading = true;
		const { data, error: fetchError } = await supabase
			.from('microblogs')
			.select('*')
			.eq('writer', profile.account_id)
			.order('created_at', { ascending: false })
			.limit(10);
		if (fetchError) {
			error = fetchError.message;
		} else {
			microblogs = data || [];
		}
		loading = false;
	}

	onMount(fetchMicroblogs);
</script>

<div class="microblog-list">
	{#if loading}
		<p>Loading micro-blogs...</p>
	{:else if error}
		<p class="microblog-error">{error}</p>
	{:else if microblogs.length === 0}
		<p>{profile.username} has not blogged anything yet.</p>
	{:else}
		<ul>
			{#each microblogs as mb}
				<MicroBlogItem {mb} {profile} />
			{/each}
		</ul>
	{/if}
</div>

<style>
	.microblog-list ul {
		list-style: none;
		padding: 0;
	}
	.microblog-error {
		color: var(--color-danger);
	}
</style>
