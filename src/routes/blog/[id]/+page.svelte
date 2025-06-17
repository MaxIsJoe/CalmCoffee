<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { coffeeMarkdown } from '$lib/md/coffeeMarkdown';
	import type { BlogType } from '$lib/types/blog';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let blog: BlogType | null = $state(null);
	let loading = $state(true);
	let error = $state('');
	let shareUrl = '';

	onMount(async () => {
		const blogId = $page.params.id;
		if (!blogId) {
			error = 'Invalid blog ID';
			loading = false;
			return;
		}

		if (browser) {
			shareUrl = `${window.location.origin}/blog/${blogId}`;
		}

		const { data, error: fetchError } = await supabase
			.from('microblogs')
			.select('*, profiles:writer(username, avatar_url)')
			.eq('post_id', blogId)
			.single();

		if (fetchError) {
			error = fetchError.message;
			blog = null;
		} else {
			blog = data;
		}
		loading = false;
	});
</script>

<svelte:head>
	{#if blog}
		<title>{blog.profiles?.username}'s Blog Post - Calm Coffee</title>
		<meta name="description" content={blog.content.slice(0, 160)} />
		
		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="article" />
		<meta property="og:url" content={shareUrl} />
		<meta property="og:site_name" content="Calm Coffee" />
		<meta property="og:title" content={`${blog.profiles?.username}'s Blog Post on Calm Coffee`} />
		<meta property="og:description" content={blog.content.slice(0, 160)} />
		{#if blog.profiles?.avatar_url}
			<meta property="og:image" content={blog.profiles.avatar_url} />
			<meta property="og:image:alt" content={`${blog.profiles.username}'s profile picture`} />
		{/if}
		
		<!-- Twitter -->
		<meta name="twitter:card" content="summary" />
		<meta name="twitter:url" content={shareUrl} />
		<meta name="twitter:title" content={`${blog.profiles?.username}'s Blog Post on Calm Coffee`} />
		<meta name="twitter:description" content={blog.content.slice(0, 160)} />
		{#if blog.profiles?.avatar_url}
			<meta name="twitter:image" content={blog.profiles.avatar_url} />
			<meta name="twitter:image:alt" content={`${blog.profiles.username}'s profile picture`} />
		{/if}
	{/if}
</svelte:head>

<div class="blog-page">
	{#if loading}
		<div class="blog-loading">
			<div class="spinner"></div>
			<p>Loading blog post...</p>
		</div>
	{:else if error}
		<div class="blog-error">
			<p>{error}</p>
			<button class="back-btn" on:click={() => goto('/blog')}>Back to Blogs</button>
		</div>
	{:else if !blog}
		<div class="blog-error">
			<p>Blog post not found</p>
			<button class="back-btn" on:click={() => goto('/blog')}>Back to Blogs</button>
		</div>
	{:else}
		<article class="blog-post">
			{#if blog.profiles}
				<div class="blog-header">
					<img class="blog-avatar" src={blog.profiles.avatar_url} alt="Profile picture" />
					<div class="blog-meta">
						<h2 class="blog-author">{blog.profiles.username}</h2>
						<time class="blog-date">{new Date(blog.created_at).toLocaleString()}</time>
					</div>
				</div>
			{/if}
			<div class="blog-content">{@html coffeeMarkdown(blog.content, blog.styles)}</div>
			{#if blog.tags && blog.tags.length}
				<div class="blog-tags">
					{#each blog.tags as tag}
						<span class="blog-tag">{tag}</span>
					{/each}
				</div>
			{/if}
			<div class="blog-footer">
				<span class="blog-age-rating">{blog.age_rating}</span>
				<button class="back-btn" on:click={() => goto('/blog')}>Back to Blogs</button>
			</div>
		</article>
	{/if}
</div>

<style>
	.blog-page {
		max-width: 700px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.blog-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 200px;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 4px solid #e0e7ff;
		border-top: 4px solid #6366f1;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.blog-error {
		text-align: center;
		color: #b91c1c;
		margin: 2rem 0;
	}

	.blog-post {
		background: #fff;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
	}

	.blog-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.blog-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid #e5e7eb;
		background: #f3f4f6;
	}

	.blog-meta {
		display: flex;
		flex-direction: column;
	}

	.blog-author {
		font-size: 1.2rem;
		font-weight: 600;
		color: #334155;
		margin: 0;
	}

	.blog-date {
		font-size: 0.9rem;
		color: #64748b;
	}

	.blog-content {
		font-size: 1.1rem;
		line-height: 1.6;
		color: #1e293b;
		margin-bottom: 1.5rem;
	}

	.blog-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.blog-tag {
		background: #ede9e3;
		color: #7c5e48;
		font-size: 0.9rem;
		padding: 0.2rem 0.7rem;
		border-radius: 999px;
		font-weight: 500;
		border: 1px solid #e0d7ce;
	}

	.blog-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.blog-age-rating {
		color: #6366f1;
		font-weight: 500;
	}

	.back-btn {
		background: #6366f1;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.95rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.back-btn:hover {
		background: #4f46e5;
	}
</style> 