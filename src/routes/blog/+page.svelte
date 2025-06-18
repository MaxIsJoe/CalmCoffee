<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { coffeeMarkdown, type CoffeeMarkdownStyles } from '$lib/md/coffeeMarkdown';
	import type { AgeRating } from '$lib/types/story';
	import type { BlogType } from '$lib/types/blog';
	import MicroBlogItem from '$lib/comp/microblog/MicroBlogItem.svelte';
	import { user } from '$lib/stores/user';

	let blogs: BlogType[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let ageFilter: AgeRating | 'all' = $state('all');
	let currentTab: 'latest' | 'interests' = $state('latest');

	const ageRatings: string[] = ['all', 'Everyone', 'Teen', 'Mature', 'Adult'];

	async function fetchBlogs() {
		loading = true;
		let query = supabase
			.from('microblogs')
			.select('*, profiles:writer(username, avatar_url)')
			.order('created_at', { ascending: false })
			.limit(20);

		if (ageFilter !== 'all') {
			query = query.eq('age_rating', ageFilter);
		}

		if (currentTab === 'interests' && $user?.profile?.interests && $user.profile.interests.length > 0) {
			query = query.overlaps('tags', $user.profile.interests);
		}

		const { data, error: fetchError } = await query;

		if (fetchError) {
			error = fetchError.message;
			blogs = [];
		} else {
			blogs = data || [];
			error = '';
		}
		loading = false;
	}

	onMount(async () => {
		const { data: userData, error: userError } = await supabase.auth.getUser();
		if (userData?.user) {
			const { data: profileData, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('account_id', userData.user.id)
				.single();

			if (profileData) {
				currentTab = 'interests';
				user.set({ usr: userData.user, profile: profileData });
			} else {
				if (profileError) console.error('Error fetching profile:', profileError);
			}
		} else {
			if (userError) console.error('Error fetching user:', userError);
		}

		console.log($user);

		await fetchBlogs();
		loading = false;
	});
</script>

<div class="blog-page">
	<h1>Latest Blogs</h1>
	<div class="filter-row">
		<label for="age-filter">Filter by age rating:</label>
		<select id="age-filter" bind:value={ageFilter} onchange={fetchBlogs}>
			{#each ageRatings as rating}
				<option value={rating}>{rating === 'all' ? 'All' : rating}</option>
			{/each}
		</select>
	</div>

	<div class="tabs">
		<button
			class:active={currentTab === 'latest'}
			onclick={() => {
				loading = true;
				currentTab = 'latest';
				fetchBlogs();
			}}
		>
			Latest
		</button>
		{#if $user}
			<button
				class:active={currentTab === 'interests'}
				onclick={() => {
					loading = true;
					currentTab = 'interests';
					fetchBlogs();
				}}
			>
				Interests
			</button>
		{/if}
	</div>

	{#if loading}
		<div class="blog-loading">
			<div class="spinner"></div>
			<p>Loading the latest blogs and applying your age rating filter...</p>
		</div>
	{:else if error}
		<p class="blog-error">{error}</p>
	{:else if currentTab === 'interests' && blogs.length === 0}
		<p>You don't have any interests set in your profile. Go to your <a href="/profile/{$user?.profile?.username}">profile</a> to add some!</p>
	{:else if blogs.length === 0}
		<p>No blogs found.</p>
	{:else}
		<ul class="blog-list">
			{#each blogs as blog}
				<MicroBlogItem mb={blog} profile={blog.profiles} />
			{/each}
		</ul>
	{/if}
</div>

<style>
	a {
		color: var(--color-link);
		text-decoration: underline;
	}

	.blog-page {
		max-width: 700px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}
	h1 {
		font-size: 2.1rem;
		font-weight: 700;
		color: var(--color-blog-heading, var(--color-text));
		margin-bottom: 1.2rem;
		letter-spacing: -0.5px;
	}
	.filter-row {
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}
	label[for="age-filter"] {
		font-size: 1.06rem;
		font-weight: 500;
		color: var(--color-blog-label, var(--color-secondary));
		margin-right: 0.4rem;
	}
	select#age-filter {
		padding: 0.35em 1.1em 0.35em 0.7em;
		border-radius: 6px;
		border: 1px solid var(--color-blog-select-border, #c7d2fe);
		background: var(--color-blog-select-bg, #f8fafc);
		font-size: 1.05rem;
		color: var(--color-blog-select-text, var(--color-text));
		transition: border 0.2s;
	}
	select#age-filter:focus {
		outline: none;
		border-color: var(--color-blog-select-focus-border, var(--color-link));
		background: var(--color-blog-select-focus-bg, #eef2ff);
	}
	.blog-list {
		list-style: none;
		padding: 0;
	}
	.blog-error {
		color: var(--color-blog-error, var(--color-danger));
	}
	.blog-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 120px;
	}
	.spinner {
		width: 32px;
		height: 32px;
		border: 4px solid var(--color-blog-spinner-bg, #e0e7ff);
		border-top: 4px solid var(--color-blog-spinner-fg, var(--color-link));
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	.tabs {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-blog-tabs-border, #e5e7eb);
	}

	.tabs button {
		padding: 0.5rem 1rem;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 1rem;
		color: var(--color-blog-tabs-btn, #6b7280);
		transition: color 0.2s, border-bottom 0.2s;
	}

	.tabs button.active {
		color: var(--color-blog-tabs-btn-active, var(--color-text));
		border-bottom: 2px solid var(--color-blog-tabs-btn-active-border, var(--color-link));
	}

	.tabs button:hover:not(.active) {
		color: var(--color-blog-tabs-btn-hover, var(--color-link-hover));
	}
</style>
