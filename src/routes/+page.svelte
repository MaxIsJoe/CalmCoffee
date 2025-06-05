<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';

	let storyCount: number | null = null;
	let userCount: number | null = null;
	let commentCount: number | null = null;

	onMount(async () => {
		const { count: stories } = await supabase
			.from('stories')
			.select('*', { count: 'exact', head: true });
		storyCount = stories ?? 0;

		const { count: users } = await supabase
			.from('profiles')
			.select('*', { count: 'exact', head: true });
		userCount = users ?? 0;

		const { count: comments } = await supabase
			.from('story_block_comments')
			.select('*', { count: 'exact', head: true });
		commentCount = comments ?? 0;
	});
</script>

<div class="home-hero">
	<h1>Welcome to Calm Coffee</h1>
	<p class="subtitle">
		Calm Coffee is a cozy, writing platform for stories.<br />
		Write, share, and discover stories one block at a time. Don't feel pressured to write a whole book,
		write your chapters in small, manageable pieces. Whether you're a seasoned author or just starting
		out, Calm Coffee is the perfect place to brew your creativity.
	</p>
	<ul class="features">
		<li>✍️ <b>Write</b> stories in short, creative blocks</li>
		<li>📚 <b>Read</b> and follow works by others</li>
		<li>💬 <b>Interact</b> with other readers and writers</li>
		<li>🎨 <b>Style</b> your writing with Markdown and custom CSS</li>
		<li>📓 <b>Blog</b> your thoughts and experiences</li>
	</ul>
	<div class="cta-buttons">
		<a href="/read" class="cta">Discover Stories</a>
		<a href="/create/new-project" class="cta secondary">Start Writing</a>
	</div>
</div>

<div class="site-stats">
	{#if storyCount !== null && userCount !== null && commentCount !== null}
		<p>
			<b>{storyCount}</b> stories being written &nbsp;|&nbsp;
			<b>{userCount}</b> users signed up &nbsp;|&nbsp;
			<b>{commentCount}</b> comments shared
		</p>
	{:else}
		<p>Loading community stats...</p>
	{/if}
</div>

<style>
	/* filepath: f:\projects\websites\CalmCaf\calm-coffee\src\routes\+page.svelte */
	.home-hero {
		max-width: 700px;
		margin: 3rem auto 0 auto;
		padding: 2.5rem 2rem 2rem 2rem;
		background: #fff;
		border-radius: 18px;
		box-shadow: 0 4px 24px rgba(99, 102, 241, 0.07);
		text-align: center;
	}
	h1 {
		font-size: 2.5rem;
		color: #4f46e5;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		font-size: 1.18rem;
		color: #444;
		margin-bottom: 1.7rem;
	}
	.features {
		list-style: none;
		padding: 0;
		margin: 0 0 2rem 0;
		text-align: left;
		max-width: 480px;
		margin-left: auto;
		margin-right: auto;
	}
	.features li {
		font-size: 1.08rem;
		margin-bottom: 0.7em;
		color: #3730a3;
		background: #f3f4f6;
		border-radius: 7px;
		padding: 0.6em 1em;
	}
	.cta-buttons {
		display: flex;
		justify-content: center;
		gap: 1.2rem;
		margin-top: 1.5rem;
	}
	.cta {
		display: inline-block;
		background: #4f46e5;
		color: #fff;
		padding: 0.8em 2.2em;
		border-radius: 8px;
		font-size: 1.13rem;
		font-weight: 500;
		text-decoration: none;
		transition: background 0.18s;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
	}
	.cta:hover {
		background: #3730a3;
	}
	.cta.secondary {
		background: #e0e7ff;
		color: #3730a3;
	}
	.cta.secondary:hover {
		background: #c7d2fe;
	}
	.site-stats {
		max-width: 700px;
		margin: 2rem auto 0 auto;
		padding: 1.1rem 2rem;
		background: #f3f4f6;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04);
		text-align: center;
		font-size: 1.13rem;
		color: #3730a3;
	}
	.site-stats b {
		color: #4f46e5;
		font-weight: 600;
	}
	@media (max-width: 700px) {
		.home-hero {
			padding: 1.2rem 0.5rem 1.5rem 0.5rem;
		}
		.features {
			padding-left: 0.2em;
		}
	}
</style>
