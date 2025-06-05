<script lang="ts">
	import MicroBlogEditor from '$lib/comp/microblog/MicroBlogEditor.svelte';
	import MicroBlogList from './MicroBlogList.svelte';
	import { user } from '$lib/stores/user';
	import type { ProfileType } from '$lib/types/profile';

	export let profile: ProfileType;
	let updates = 0;
	$: updates++;

	function handleBlogPosted() {
		updates++;
	}
</script>

<div class="microblogs-section">
	{#if $user && profile && $user.usr?.id === profile.account_id}
		<MicroBlogEditor userId={profile.account_id} on:posted={handleBlogPosted} />
	{/if}
	{#key updates}
		<MicroBlogList {profile} />
	{/key}
</div>

<style>
	.microblogs-section {
		margin-bottom: 1.5rem;
	}
</style>
