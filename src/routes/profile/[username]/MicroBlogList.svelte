<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchMicroblogsByAccountId } from '$lib/db/profile';
	import type { Profile } from '$lib/db/profile';
	import MicroBlogItem from '$lib/comp/microblog/MicroBlogItem.svelte';
	import type { BlogType } from '$lib/types/blog';

	export let profile: Profile;
	let microblogs: BlogType[] = [];
	let loading: boolean = true;
	let error: string = '';

	async function loadMicroblogs() {
		loading = true;
		try {
			microblogs = await fetchMicroblogsByAccountId(profile.account_id ?? '', 10);
			error = '';
		} catch (e) {
			error = (e as Error).message;
			microblogs = [];
		}
		loading = false;
	}

	onMount(loadMicroblogs);
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
