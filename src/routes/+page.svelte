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
	<meta
		name="description"
		content="Write, share, and discover stories one block at a time. A cozy platform for writers to express their creativity in manageable pieces."
	/>
	<meta
		name="keywords"
		content="writing platform, creative writing, stories, blogging, character creation"
	/>
	<meta property="og:title" content="Calm Coffee - A Cozy Writing Platform" />
	<meta
		property="og:description"
		content="Write, share, and discover stories one block at a time. A cozy platform for writers to express their creativity in manageable pieces."
	/>
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Calm Coffee - A Cozy Writing Platform" />
	<meta
		name="twitter:description"
		content="Write, share, and discover stories one block at a time. A cozy platform for writers to express their creativity in manageable pieces."
	/>
</svelte:head>

<div class="hero-section">
	<div class="hero-background">
		<div class="floating-elements">
			<div class="floating-element" style="--delay: 0s">☕</div>
			<div class="floating-element" style="--delay: 2s">✍️</div>
			<div class="floating-element" style="--delay: 4s">📚</div>
			<div class="floating-element" style="--delay: 1s">💭</div>
			<div class="floating-element" style="--delay: 3s">🎨</div>
			<div class="floating-element" style="--delay: 5s">🌟</div>
		</div>
	</div>

	<div class="hero-content">
		<div class="brand-header">
			<h1 class="main-title">
				<span class="title-highlight">Calm Coffee</span>
			</h1>
			<div class="brand-subtitle">Where creativity flows like a warm cup of inspiration</div>
		</div>

		<p class="hero-description">
			Discover a cozy writing platform where stories come to life one block at a time. No pressure
			to write a whole book. Just share your creativity in small, manageable pieces. Whether you're
			a seasoned author or just starting your journey, Calm Coffee is your perfect companion for
			brewing beautiful stories.
		</p>

		<div class="feature-grid">
			<div class="feature-card">
				<div class="feature-icon">✍️</div>
				<h3>Write</h3>
				<p>Create stories in short, creative blocks</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📚</div>
				<h3>Read</h3>
				<p>Discover and react to amazing works</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">💬</div>
				<h3>Connect</h3>
				<p>Engage with fellow writers and readers</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🎨</div>
				<h3>Style</h3>
				<p>Express yourself with our custom Markdown system</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📓</div>
				<h3>Blog</h3>
				<p>Share your thoughts and experiences</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📇</div>
				<h3>Catalogue</h3>
				<p>Share your Original Characters and Sonas</p>
			</div>
		</div>

		<div class="cta-section">
			<a href="/read" class="cta-primary">
				<span class="cta-text">Discover Stories</span>
				<span class="cta-arrow">→</span>
			</a>
			<a href="/create/new-project" class="cta-secondary">
				<span class="cta-text">Start Writing</span>
				<span class="cta-sparkle">✨</span>
			</a>
		</div>
	</div>
</div>

<div class="community-section">
	<div class="stats-container">
		{#if storyCount !== null && userCount !== null && commentCount !== null && characterCount !== null}
			<div class="stat-item">
				<div class="stat-number">{storyCount.toLocaleString()}</div>
				<div class="stat-label">Stories Brewing</div>
			</div>
			<div class="stat-divider"></div>
			<div class="stat-item">
				<div class="stat-number">{userCount.toLocaleString()}</div>
				<div class="stat-label">Users Joined</div>
			</div>
			<div class="stat-divider"></div>
			<div class="stat-item">
				<div class="stat-number">{commentCount.toLocaleString()}</div>
				<div class="stat-label">Comments</div>
			</div>
			<div class="stat-divider"></div>
			<div class="stat-item">
				<div class="stat-number">{characterCount.toLocaleString()}</div>
				<div class="stat-label">Characters Born</div>
			</div>
		{:else}
			<div class="loading-stats">
				<div class="loading-dots">
					<span></span>
					<span></span>
					<span></span>
				</div>
				<p>Loading community stats...</p>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Hero Section */
	.hero-section {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		overflow: hidden;
	}

	.hero-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			135deg,
			var(--color-bg) 0%,
			var(--color-bg-alt) 50%,
			var(--color-card-bg) 100%
		);
		z-index: -2;
	}

	.floating-elements {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: -1;
	}

	.floating-element {
		position: absolute;
		font-size: 2rem;
		opacity: 0.1;
		animation: float 6s ease-in-out infinite;
		animation-delay: var(--delay);
	}

	.floating-element:nth-child(1) {
		top: 10%;
		left: 10%;
	}
	.floating-element:nth-child(2) {
		top: 20%;
		right: 15%;
	}
	.floating-element:nth-child(3) {
		top: 60%;
		left: 5%;
	}
	.floating-element:nth-child(4) {
		top: 70%;
		right: 10%;
	}
	.floating-element:nth-child(5) {
		top: 40%;
		left: 20%;
	}
	.floating-element:nth-child(6) {
		top: 30%;
		right: 25%;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(10deg);
		}
	}

	.hero-content {
		max-width: 1200px;
		width: 100%;
		text-align: center;
		z-index: 1;
	}

	.brand-header {
		margin-bottom: 2rem;
	}

	.main-title {
		font-size: clamp(2.5rem, 5vw, 4rem);
		margin: 0;
		line-height: 1.2;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.title-highlight {
		background: linear-gradient(135deg, var(--color-link), var(--color-accent));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-weight: 700;
		text-shadow: 0 0 30px rgba(var(--color-link-rgb), 0.3);
	}

	.brand-subtitle {
		font-size: 1.2rem;
		color: var(--color-text-muted);
		margin-top: 1rem;
		font-style: italic;
	}

	.hero-description {
		font-size: 1.25rem;
		color: var(--color-text);
		max-width: 800px;
		margin: 0 auto 3rem auto;
		line-height: 1.6;
	}

	/* Feature Grid */
	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin: 3rem 0;
		max-width: 1000px;
		margin-left: auto;
		margin-right: auto;
	}

	.feature-card {
		background: var(--color-card-bg);
		border-radius: 16px;
		padding: 2rem 1.5rem;
		text-align: center;
		box-shadow: 0 8px 32px var(--color-card-shadow);
		transition: all 0.3s ease;
		border: 1px solid var(--color-border);
		position: relative;
		overflow: hidden;
	}

	.feature-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--color-link), var(--color-accent));
		transform: scaleX(0);
		transition: transform 0.3s ease;
	}

	.feature-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 16px 48px var(--color-card-shadow);
	}

	.feature-card:hover::before {
		transform: scaleX(1);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		display: block;
	}

	.feature-card h3 {
		font-size: 1.4rem;
		color: var(--color-link);
		margin: 0 0 0.5rem 0;
		font-weight: 600;
	}

	.feature-card p {
		color: var(--color-text);
		margin: 0;
		font-size: 1rem;
		line-height: 1.5;
	}

	/* CTA Section */
	.cta-section {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 3rem;
	}

	.cta-primary,
	.cta-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 2rem;
		border-radius: 12px;
		font-size: 1.1rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.cta-primary {
		background: linear-gradient(135deg, var(--color-link), var(--color-accent));
		color: white;
		box-shadow: 0 8px 24px rgba(var(--color-link-rgb), 0.3);
	}

	.cta-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(var(--color-link-rgb), 0.4);
	}

	.cta-secondary {
		background: var(--color-card-bg);
		color: var(--color-link);
		border: 2px solid var(--color-link);
		box-shadow: 0 4px 16px var(--color-card-shadow);
	}

	.cta-secondary:hover {
		background: var(--color-link);
		color: white;
		transform: translateY(-2px);
	}

	.cta-arrow {
		transition: transform 0.3s ease;
	}

	.cta-primary:hover .cta-arrow {
		transform: translateX(4px);
	}

	.cta-sparkle {
		animation: sparkle 2s ease-in-out infinite;
	}

	@keyframes sparkle {
		0%,
		100% {
			transform: scale(1) rotate(0deg);
		}
		50% {
			transform: scale(1.2) rotate(180deg);
		}
	}

	/* Community Stats */
	.community-section {
		padding: 4rem 2rem;
		background: var(--color-bg-alt);
	}

	.stats-container {
		max-width: 1000px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.stat-item {
		text-align: center;
		flex: 1;
		min-width: 150px;
	}

	.stat-number {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-link);
		background: linear-gradient(135deg, var(--color-link), var(--color-accent));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.stat-label {
		font-size: 1rem;
		color: var(--color-text);
		margin-top: 0.5rem;
		font-weight: 500;
	}

	.stat-divider {
		width: 1px;
		height: 60px;
		background: var(--color-border);
	}

	.loading-stats {
		text-align: center;
		color: var(--color-text);
	}

	.loading-dots {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.loading-dots span {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-link);
		animation: loading 1.4s ease-in-out infinite both;
	}

	.loading-dots span:nth-child(1) {
		animation-delay: -0.32s;
	}
	.loading-dots span:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes loading {
		0%,
		80%,
		100% {
			transform: scale(0);
		}
		40% {
			transform: scale(1);
		}
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-section {
			min-height: auto;
			padding: 3rem 1rem;
		}

		.main-title {
			font-size: 2.5rem;
		}

		.hero-description {
			font-size: 1.1rem;
		}

		.feature-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.cta-section {
			flex-direction: column;
			align-items: center;
		}

		.cta-primary,
		.cta-secondary {
			width: 100%;
			max-width: 300px;
			justify-content: center;
		}

		.stats-container {
			flex-direction: column;
			gap: 1.5rem;
		}

		.stat-divider {
			display: none;
		}

		.stat-item {
			min-width: auto;
		}
	}

	@media (max-width: 480px) {
		.hero-section {
			padding: 2rem 0.5rem;
		}

		.main-title {
			font-size: 2rem;
		}

		.brand-subtitle {
			font-size: 1rem;
		}

		.hero-description {
			font-size: 1rem;
		}

		.feature-card {
			padding: 1.5rem 1rem;
		}

		.feature-icon {
			font-size: 2.5rem;
		}
	}
</style>
