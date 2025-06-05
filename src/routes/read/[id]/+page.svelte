<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { page } from '$app/stores';
	import { coffeeMarkdown } from '$lib/md/coffeeMarkdown';
	import type { Database } from '$lib/types/database.types';

	let story: Database['public']['Tables']['stories']['Row'] | null = null;
	let chapters: Database['public']['Tables']['chapters']['Row'][] = [];
	let blocks: Database['public']['Tables']['blocks']['Row'][] = [];
	let author: { username: string } | null = null;
	let error = '';
	let loading = true;
	let loadingMessage = 'Loading story...';
	let storyId = '';
	$: storyId = $page.params.id;

	let blockOrder: 'oldest' | 'newest' = 'oldest';
	let readingWidth = 800;
	let resizing = false;
	let startX = 0;
	let startWidth = 0;

	let comments: Record<
		string,
		{ id: string; commenter_id: string; comment: string; username?: string }[]
	> = {};
	let commentInputs: Record<string, string> = {};
	let commentErrors: Record<string, string> = {};
	let submittingComment: Record<string, boolean> = {};

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

	function getBlocksForChapter(chapterId: string) {
		const arr = blocks.filter((b) => b.chapter_id === chapterId);
		return blockOrder === 'oldest'
			? arr
					.slice()
					.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
			: arr
					.slice()
					.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	}

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

	let selectedChapterId: string = '';

	async function fetchCommentsForBlocks(blockIds: string[]) {
		console.log('Fetching comments for blocks:', blockIds);
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
					username: c.profiles?.username
				});
			}
		}
		if (error) {
			console.error('Error fetching comments:', error);
		}
	}

	async function submitComment(blockId: string) {
		const text = (commentInputs[blockId] || '').trim();
		commentErrors[blockId] = '';
		if (!text) {
			commentErrors[blockId] = 'Comment cannot be empty.';
			return;
		}
		if (text.length > 300) {
			commentErrors[blockId] = 'Comment must be 300 characters or less.';
			return;
		}
		submittingComment[blockId] = true;
		const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
		const commenter_id = user?.id;
		if (!commenter_id) {
			commentErrors[blockId] = 'You must be logged in to comment.';
			submittingComment[blockId] = false;
			return;
		}
		const { error } = await supabase
			.from('story_block_comments')
			.insert([{ id: blockId, commenter_id, comment: text }]);
		if (error) {
			commentErrors[blockId] = 'Failed to post comment.\n' + error.message;
		} else {
			commentInputs[blockId] = '';
			await fetchCommentsForBlocks([blockId]);
		}
		submittingComment[blockId] = false;
	}

	let openCommentsBlockId: string | null = null;

	function toggleComments(blockId: string) {
		openCommentsBlockId = openCommentsBlockId === blockId ? null : blockId;
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
{:else}
	<div class="read-controls">
		<label>
			Block order:
			<select bind:value={blockOrder}>
				<option value="oldest">Oldest first</option>
				<option value="newest">Newest first</option>
			</select>
		</label>
		{#if chapters.length > 1}
			<label style="margin-left:1.5em;">
				Chapter:
				<select bind:value={selectedChapterId}>
					<option value="">All</option>
					{#each chapters as chapter}
						<option value={chapter.id}>{chapter.title}</option>
					{/each}
				</select>
			</label>
		{/if}
	</div>
	<div
		class="read-story-container resizable"
		style="max-width:{readingWidth}px;width:100%;position:relative;"
	>
		<div class="resize-handle left" on:mousedown={startResize}></div>
		<div class="resize-handle right" on:mousedown={startResize}></div>
		<h1>{story.title}</h1>
		{#if author}
			<p class="story-author">By <span>{author.username}</span></p>
		{/if}
		{#if story.description}
			<p class="story-desc">{story.description}</p>
		{/if}
		{#if selectedChapterId}
			{#each chapters.filter((c) => c.id === selectedChapterId) as chapter}
				<div class="chapter-block">
					<div class="chapter-header">
						<h2>{chapter.title}</h2>
					</div>
					{#each getBlocksForChapter(chapter.id) as block}
						<div class="block-row">
							<div class="block-content">
								<!-- Comments icon button at top right of block, with count -->
								<button
									class="comments-icon-btn"
									on:click={() => toggleComments(block.id)}
									aria-label="Show comments"
								>
									<svg width="22" height="22" fill="none" viewBox="0 0 24 24">
										<path
											d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
											stroke="#6366f1"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
									<span class="comments-count">
										{comments[block.id]?.length || 0}
									</span>
								</button>
								{@html coffeeMarkdown(block.content, block.styles)}
							</div>
						</div>
					{/each}
				</div>
			{/each}
		{:else}
			{#each chapters as chapter}
				<div class="chapter-block">
					<div class="chapter-header">
						<h2>{chapter.title}</h2>
					</div>
					{#each getBlocksForChapter(chapter.id) as block}
						<div class="block-row">
							<div class="block-content">
								<button
									class="comments-icon-btn"
									on:click={() => toggleComments(block.id)}
									aria-label="Show comments"
								>
									<svg width="22" height="22" fill="none" viewBox="0 0 24 24">
										<path
											d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
											stroke="#6366f1"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
									<span class="comments-count">
										{comments[block.id]?.length || 0}
									</span>
								</button>
								{@html coffeeMarkdown(block.content, block.styles)}
							</div>
						</div>
					{/each}
				</div>
			{/each}
		{/if}
	</div>
	<!-- Comments panel outside of read-story-container -->
	{#if openCommentsBlockId}
		<div class="global-comments-panel-backdrop" on:click={() => (openCommentsBlockId = null)}></div>
		<div class="global-comments-panel">
			<button
				class="close-comments-panel"
				on:click={() => (openCommentsBlockId = null)}
				aria-label="Close comments">&times;</button
			>
			<h4>Comments</h4>
			{#if comments[openCommentsBlockId]?.length}
				<ul>
					{#each comments[openCommentsBlockId] as c}
						<li>
							<span class="comment-user">{c.username ?? c.commenter_id.slice(0, 8)}:</span>
							<span class="comment-text">{c.comment}</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="no-comments">No comments yet.</p>
			{/if}
			<form on:submit|preventDefault={() => submitComment(openCommentsBlockId)}>
				<textarea
					bind:value={commentInputs[openCommentsBlockId]}
					maxlength="300"
					placeholder="Leave a comment (max 300 chars)..."
					rows="2"
				></textarea>
				<div class="comment-actions">
					<span class="char-count">{(commentInputs[openCommentsBlockId] || '').length}/300</span>
					<button type="submit" disabled={submittingComment[openCommentsBlockId]}>
						{submittingComment[openCommentsBlockId] ? 'Posting...' : 'Post'}
					</button>
				</div>
				{#if commentErrors[openCommentsBlockId]}
					<p class="comment-error">{commentErrors[openCommentsBlockId]}</p>
				{/if}
			</form>
		</div>
	{/if}
{/if}

<style>
	.read-controls {
		max-width: 800px;
		margin: 1.2rem auto 0 auto;
		display: flex;
		justify-content: flex-end;
	}
	.read-controls label {
		font-size: 1rem;
		color: #3730a3;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}
	.read-controls select {
		font-size: 1rem;
		padding: 0.2em 0.7em;
		border-radius: 6px;
		border: 1px solid #cbd5e1;
		background: #f3f4f6;
		color: #3730a3;
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
		background: #c7d2fe;
		border-radius: 2px;
		margin: 0 auto;
		margin-top: 40px;
	}
	.read-story-container {
		background: #fff;
		border-radius: 16px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		padding: 2.5rem 2.5rem 2rem 2.5rem;
		margin: 2rem auto;
		overflow-x: auto;
	}
	.read-story-container h1 {
		margin-top: 0;
		font-size: 2.2rem;
		color: #4f46e5;
	}
	.story-author {
		color: #888;
		margin-bottom: 0.5rem;
		font-size: 1.05rem;
	}
	.story-author span {
		color: #3730a3;
		font-weight: 500;
	}
	.story-desc {
		color: #444;
		margin-bottom: 2rem;
	}
	.chapter-block {
		margin-bottom: 2.5rem;
	}
	.chapter-header {
		display: flex;
		align-items: center;
		gap: 1em;
		margin-bottom: 0.5em;
	}
	.chapter-block h2 {
		margin-bottom: 1rem;
		color: #3730a3;
		font-size: 1.3rem;
	}
	.block-row {
		/* revert to block layout */
		display: block;
		position: relative;
	}
	.block-content {
		background: #f3f4f6;
		border-radius: 8px;
		padding: 2.2rem 1.2rem 1rem 1.2rem; /* add extra top padding */
		margin-bottom: 1.1rem;
		font-size: 1.08rem;
		color: #222;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
		overflow-wrap: break-word;
		position: relative;
	}
	.comments-icon-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		padding: 0.1em 0.5em 0.1em 0.1em;
		cursor: pointer;
		z-index: 3;
		transition: background 0.15s;
		border-radius: 50px;
		display: flex;
		align-items: center;
		gap: 0.3em;
	}
	.comments-icon-btn:hover,
	.comments-icon-btn:focus {
		background: #e0e7ff;
	}
	.comments-icon-btn svg {
		display: block;
	}
	.comments-count {
		font-size: 0.98em;
		color: #6366f1;
		background: #e0e7ff;
		border-radius: 1em;
		padding: 0.1em 0.7em;
		margin-left: 0.1em;
		font-weight: 500;
		line-height: 1;
	}
	.global-comments-panel-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(30, 41, 59, 0.18);
		z-index: 1000;
	}
	.global-comments-panel {
		position: fixed;
		top: 0;
		right: 0;
		width: 370px;
		max-width: 100vw;
		height: 100vh;
		background: #eef2ff;
		box-shadow: -2px 0 24px rgba(99, 102, 241, 0.1);
		padding: 2.2em 1.5em 1.5em 1.5em;
		z-index: 1001;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}
	.close-comments-panel {
		position: absolute;
		top: 1em;
		right: 1em;
		background: none;
		border: none;
		font-size: 2em;
		color: #6366f1;
		cursor: pointer;
		line-height: 1;
	}
	.global-comments-panel h4 {
		margin: 0 0 0.7em 0;
		font-size: 1.15em;
		color: #3730a3;
	}
	.global-comments-panel ul {
		list-style: none;
		padding: 0;
		margin: 0 0 0.5em 0;
	}
	.global-comments-panel li {
		margin-bottom: 0.4em;
		font-size: 0.98em;
	}
	.comment-user {
		color: #6366f1;
		font-weight: 500;
		margin-right: 0.5em;
	}
	.comment-text {
		color: #222;
	}
	.no-comments {
		color: #888;
		font-size: 0.97em;
		margin-bottom: 0.5em;
	}
	.global-comments-panel textarea {
		width: 100%;
		border-radius: 5px;
		border: 1px solid #c7d2fe;
		padding: 0.5em;
		font-size: 1em;
		resize: vertical;
		margin-bottom: 0.3em;
	}
	.comment-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.char-count {
		font-size: 0.92em;
		color: #888;
	}
	.global-comments-panel button[type='submit'] {
		background: #6366f1;
		color: #fff;
		border: none;
		border-radius: 5px;
		padding: 0.35em 1.1em;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
	}
	.global-comments-panel button[disabled] {
		background: #c7d2fe;
		cursor: not-allowed;
	}
	.comment-error {
		color: #dc2626;
		font-size: 0.97em;
		margin-top: 0.2em;
	}
	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
	}
	.loader {
		border: 4px solid #e0e7ff;
		border-top: 4px solid #6366f1;
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
	@media (max-width: 900px) {
		.global-comments-panel {
			width: 100vw;
			padding: 1.2em 0.5em 1em 0.5em;
		}
	}
</style>
