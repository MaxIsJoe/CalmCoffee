<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';

	let storyCount: number | null = null;
	let userCount: number | null = null;
	let commentCount: number | null = null;
	let characterCount: number | null = null;

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

		const { count: characters } = await supabase
			.from('characters')
			.select('*', { count: 'exact', head: true });
		characterCount = characters ?? 0;
	});
</script>

<svelte:head>
	<title>Calm Coffee - A Cozy Writing Platform</title>
	<meta name="description" content="Write, share, and discover stories one block at a time. A cozy platform for writers to express their creativity in manageable pieces." />
	<meta name="keywords" content="writing platform, creative writing, stories, blogging, character creation" />
	<meta property="og:title" content="Calm Coffee - A Cozy Writing Platform" />
	<meta property="og:description" content="Write, share, and discover stories one block at a time. A cozy platform for writers to express their creativity in manageable pieces." />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Calm Coffee - A Cozy Writing Platform" />
	<meta name="twitter:description" content="Write, share, and discover stories one block at a time. A cozy platform for writers to express their creativity in manageable pieces." />
</svelte:head>

<div class="home-hero">
	<h1>Welcome to Calm Coffee</h1>
	<p class="subtitle">
		Calm Coffee is a cozy, writing platform for stories.<br />
		Write, share, and discover stories one block at a time. Don't feel pressured to write a whole book,
		write your chapters in small, manageable pieces.<br /> Whether you're a seasoned author or just starting
		out, Calm Coffee is the perfect place to brew your creativity.
	</p>
	<ul class="features">
		<li>✍️ <b>Write</b> stories in short, creative blocks</li>
		<li>📚 <b>Read</b> and follow works by others</li>
		<li>💬 <b>Interact</b> with other readers and writers</li>
		<li>🎨 <b>Style</b> your writing with Markdown and custom CSS</li>
		<li>📓 <b>Blog</b> your thoughts and experiences</li>
		<li>📇 <b>Catalogue</b> your OCs and Sonas</li>
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
			<b>{commentCount}</b> comments shared &nbsp;|&nbsp;
			<b>{characterCount}</b> characters imagined
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
		background: var(--color-card-bg);
		border-radius: 18px;
		box-shadow: 0 4px 24px var(--color-card-shadow);
		text-align: center;
	}
	h1 {
		font-size: 2.5rem;
		color: var(--color-link);
		margin-bottom: 0.5rem;
	}
	.subtitle {
		font-size: 1.18rem;
		color: var(--color-text);
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
		color: var(--color-link);
		background: var(--color-bg-alt);
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
		background: var(--color-link);
		color: var(--color-primary-alt);
		padding: 0.8em 2.2em;
		border-radius: 8px;
		font-size: 1.13rem;
		font-weight: 500;
		text-decoration: none;
		transition: background 0.18s;
		box-shadow: 0 2px 8px var(--color-card-shadow);
	}
	.cta:hover {
		background: var(--color-link-hover);
	}
	.cta.secondary {
		background: var(--color-secondary);
		color: var(--color-link);
	}
	.cta.secondary:hover {
		background: var(--color-accent);
	}
	.site-stats {
		max-width: 700px;
		margin: 2rem auto 0 auto;
		padding: 1.1rem 2rem;
		background: var(--color-bg-alt);
		border-radius: 12px;
		box-shadow: 0 2px 8px var(--color-card-shadow);
		text-align: center;
		font-size: 1.13rem;
		color: var(--color-link);
	}
	.site-stats b {
		color: var(--color-link);
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
