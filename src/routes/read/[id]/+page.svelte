<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { page } from '$app/stores';
	import type { Database } from '../../../../database.types';
	import StoryOverview from '$lib/comp/story/StoryOverview.svelte';
	import StoryHeader from '$lib/comp/story/StoryHeader.svelte';
	import ReadingControls from '$lib/comp/story/ReadingControls.svelte';
	import StoryContent from '$lib/comp/story/StoryContent.svelte';
	import CommentsPanel from '$lib/comp/story/CommentsPanel.svelte';
	import { saveLastReadChapter } from '$lib/utils/readingProgress';

	let story: Database['public']['Tables']['stories']['Row'] | null = null;
	let chapters: Database['public']['Tables']['chapters']['Row'][] = [];
	let blocks: Database['public']['Tables']['blocks']['Row'][] = [];
	let author: { username: string } | null = null;
	let error = '';
	let loading = true;
	let loadingMessage = 'Loading story...';
	let storyId = '';
	let isReading = false;
	let selectedChapterId: string = '';
	$: storyId = $page.params.id;

	let blockOrder: 'oldest' | 'newest' = 'oldest';
	let readingWidth = 800;
	let resizing = false;
	let startX = 0;
	let startWidth = 0;
	let isFullScreen = true;

	let comments: Record<
		string,
		{ id: string; commenter_id: string; comment: string; username?: string }[]
	> = {};
	let openCommentsBlockId: string | null = null;

	onMount(async () => {
		loading = true;
		loadingMessage = 'Loading story...';
		const { data: storyData, error: storyError } = await supabase
			.from('stories')
			.select('*')
			.eq('id', storyId)
			.single();
		if (storyError || !storyData) {
			error = 'Story not found.';
			loading = false;
			return;
		}
		story = storyData;
		// Fetch author profile
		if (story && story.user_id) {
			loadingMessage = 'Loading author...';
			const { data: authorData, error: authorError } = await supabase
				.from('profiles')
				.select('username')
				.eq('account_id', story.user_id)
				.single();
			author = authorData || null;
		}
		loadingMessage = 'Loading chapters...';
		const { data: chapterData, error: chapterError } = await supabase
			.from('chapters')
			.select('*')
			.eq('story_id', storyId)
			.order('created_at', { ascending: true });
		if (chapterError) {
			error = chapterError.message;
			loading = false;
			return;
		}
		chapters = chapterData || [];
		if (chapters.length > 0) {
			loadingMessage = 'Loading blocks...';
			const chapterIds = chapters.map((c) => c.id);
			const { data: blockData, error: blockError } = await supabase
				.from('blocks')
				.select('*')
				.in('chapter_id', chapterIds)
				.order('created_at', { ascending: true });
			if (blockError) {
				error = blockError.message;
			} else {
				blocks = blockData || [];
				// Fetch comments for all blocks
				await fetchCommentsForBlocks(blocks.map((b) => b.id));
			}
		}
		loading = false;
	});

	function startResize(e: MouseEvent) {
		resizing = true;
		startX = e.clientX;
		startWidth = readingWidth;
		document.body.style.cursor = 'ew-resize';
	}

	function onResize(e: MouseEvent) {
		if (!resizing) return;
		const dx = e.clientX - startX;
		let newWidth = startWidth + dx * 2; // scale for both sides
		newWidth = Math.max(400, Math.min(1200, newWidth));
		readingWidth = newWidth;
	}

	function stopResize() {
		resizing = false;
		document.body.style.cursor = '';
	}

	// Only attach listeners in the browser
	import { browser } from '$app/environment';

	// Attach/detach mousemove/mouseup listeners for resizing
	$: if (browser && resizing) {
		window.addEventListener('mousemove', onResize);
		window.addEventListener('mouseup', stopResize);
	} else if (browser) {
		window.removeEventListener('mousemove', onResize);
		window.removeEventListener('mouseup', stopResize);
	}

	async function fetchCommentsForBlocks(blockIds: string[]) {
		if (!blockIds || !Array.isArray(blockIds) || blockIds.length === 0) {
			comments = {};
			return;
		}
		const { data, error } = await supabase
			.from('story_block_comments')
			.select('id, commenter_id, comment, created_at, profiles(username)')
			.in('id', blockIds)
			.order('created_at', { ascending: true });
		if (!error && data) {
			comments = {};
			for (const c of data) {
				const blockId = c.id;
				if (!comments[blockId]) comments[blockId] = [];
				comments[blockId].push({
					id: c.id,
					commenter_id: c.commenter_id,
					comment: c.comment,
					username: (c.profiles as { username: string }[])[0]?.username
				});
			}
		}
		if (error) {
			console.error('Error fetching comments:', error);
		}
	}

	function toggleComments(blockId: string) {
		openCommentsBlockId = openCommentsBlockId === blockId ? null : blockId;
	}

	function startReading(chapterId?: string) {
		isReading = true;
		if (chapterId) {
			selectedChapterId = chapterId;
			saveLastReadChapter(storyId, chapterId);
		}
	}

	// Watch for chapter changes to save progress
	$: if (selectedChapterId && isReading) {
		saveLastReadChapter(storyId, selectedChapterId);
	}
</script>

{#if loading}
	<div class="loading-screen">
		<div class="loader"></div>
		<p>{loadingMessage}</p>
	</div>
{:else if error}
	<p style="color:red">{error}</p>
{:else if !story}
	<p>Story not found.</p>
{:else if !isReading}
	<StoryOverview
		{story}
		{author}
		{chapters}
		{blocks}
		onStartReading={startReading}
	/>
{:else}
	<ReadingControls
		{isFullScreen}
		{chapters}
		bind:selectedChapterId
		bind:blockOrder
		onBackToOverview={() => (isReading = false)}
		onToggleLayout={() => (isFullScreen = !isFullScreen)}
	/>
	<div
		class="read-story-container {isFullScreen ? 'fullscreen' : 'resizable'}"
		style={isFullScreen ? '' : `max-width:${readingWidth}px;width:100%;position:relative;`}
	>
		{#if !isFullScreen}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="resize-handle left" on:mousedown={startResize}></div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="resize-handle right" on:mousedown={startResize}></div>
		{/if}
		<StoryHeader {story} {author} />
		<StoryContent
			{chapters}
			{blocks}
			{selectedChapterId}
			{blockOrder}
			{comments}
			onToggleComments={toggleComments}
		/>
	</div>
	{#if openCommentsBlockId}
		<CommentsPanel
			blockId={openCommentsBlockId}
			comments={comments[openCommentsBlockId] || []}
			onClose={() => (openCommentsBlockId = null)}
		/>
	{/if}
{/if}

<style>
	.read-story-container.fullscreen {
		max-width: none;
		width: 100%;
		margin: 0;
		border-radius: 0;
		min-height: 100vh;
	}

	.read-story-container.resizable {
		resize: none;
		transition: max-width 0.15s;
	}

	.resize-handle {
		position: absolute;
		top: 0;
		width: 12px;
		height: 100%;
		cursor: ew-resize;
		z-index: 10;
	}

	.resize-handle.left {
		left: -6px;
	}

	.resize-handle.right {
		right: -6px;
	}

	.resize-handle::after {
		content: '';
		display: block;
		width: 4px;
		height: 40px;
		background: var(--color-link-hover);
		border-radius: 2px;
		margin: 0 auto;
		margin-top: 40px;
	}

	.read-story-container {
		background: var(--color-card-bg);
		border-radius: 16px;
		box-shadow: 0 4px 24px var(--color-card-shadow);
		padding: 2.5rem 2.5rem 2rem 2.5rem;
		margin: 2rem auto;
		overflow-x: auto;
	}

	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
	}

	.loader {
		border: 4px solid var(--color-secondary);
		border-top: 4px solid var(--color-link);
		border-radius: 50%;
		width: 38px;
		height: 38px;
		animation: spin 1s linear infinite;
		margin-bottom: 1.2rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
