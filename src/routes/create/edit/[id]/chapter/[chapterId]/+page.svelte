<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';
	import type { Database } from '../../../../../../../database.types';
	import ZenMarkdownEditor from '$lib/comp/markdown/ZenMarkdownEditor.svelte';

	let blocks: Database['public']['Tables']['blocks']['Row'][] = [];
	let error = '';
	let loading = true;
	let newBlockContent = '';
	let newBlockStyles = JSON.stringify(defaultStyles, null, 2); // Use defaultStyles as initial value
	let canCreateBlock = true;

	let chapterId = '';
	$: chapterId = $page.params.chapterId;

	let showBlocksList = true; // Collapsible blocks list
	let showEditor = true;

	onMount(() => {
		// Check if we're on mobile
		const isMobile = window.matchMedia('(max-width: 900px)').matches;
		if (isMobile) {
			showBlocksList = false;
		}

		// Listen for screen size changes
		const mediaQuery = window.matchMedia('(max-width: 900px)');
		const handleResize = (e: MediaQueryListEvent) => {
			showBlocksList = !e.matches;
		};
		mediaQuery.addEventListener('change', handleResize);

		return () => {
			mediaQuery.removeEventListener('change', handleResize);
		};
	});

	function toggleBlocksList() {
		showBlocksList = !showBlocksList;
	}
	function toggleEditor() {
		showEditor = !showEditor;
	}
	function clearEditor() {
		newBlockContent = '';
	}
	function copyMarkdown() {
		navigator.clipboard.writeText(newBlockContent);
	}

	onMount(async () => {
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			error = 'You must be logged in.';
			loading = false;
			return;
		}
		// Check chapter ownership by joining to story
		const { data: chapterData, error: chapterError } = await supabase
			.from('chapters')
			.select('*, stories:user_id')
			.eq('id', chapterId)
			.single();
		if (chapterError || !chapterData || chapterData.user_id !== user.id) {
			error = `You do not have access to this chapter. Expected user_id: ${chapterData.user_id}, your user_id: ${user.id}.`;
			loading = false;
			return;
		}
		const { data: blockData, error: blockError } = await supabase
			.from('blocks')
			.select('*')
			.eq('chapter_id', chapterId)
			.order('created_at', { ascending: true });
		if (blockError) {
			error = blockError.message;
		} else {
			blocks = blockData || [];
		}
		// Check if user can create a new block (last block created_at > 35 minutes ago)
		const lastBlock = blocks.length > 0 ? blocks[blocks.length - 1] : null;
		if (lastBlock && lastBlock.created_at) {
			const last = new Date(lastBlock.created_at);
			const now = new Date();
			const diff = (now.getTime() - last.getTime()) / (1000 * 60); // diff in minutes
			canCreateBlock = diff >= 35;
			if (!canCreateBlock) {
				nextBlockTime = new Date(last.getTime() + 35 * 60 * 1000);
				updateTimeUntilNextBlock();
				timerInterval = setInterval(updateTimeUntilNextBlock, 1000);
			}
		}
		loading = false;
	});

	let nextBlockTime: Date | null = null;
	let timeUntilNextBlock = '';

	function updateTimeUntilNextBlock() {
		if (!nextBlockTime) {
			timeUntilNextBlock = '';
			return;
		}
		const now = new Date();
		const diff = nextBlockTime.getTime() - now.getTime();
		if (diff <= 0) {
			timeUntilNextBlock = '';
			canCreateBlock = true;
			return;
		}
		const minutes = Math.floor(diff / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		timeUntilNextBlock = `${hours > 0 ? hours + 'h ' : ''}${mins}m ${seconds}s`;
	}

	let timerInterval: ReturnType<typeof setInterval> | null = null;

	$: if (canCreateBlock && timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}

	async function addBlock() {
		if (!canCreateBlock) return;
		if (!newBlockContent.trim() || newBlockContent.length > 1000) {
			error = 'Block must be 1-1000 characters.';
			return;
		}
		let stylesObj = {};
		if (newBlockStyles.trim()) {
			try {
				stylesObj = JSON.parse(newBlockStyles);
			} catch (e) {
				error = 'Styles must be valid JSON.';
				return;
			}
		}
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			error = 'You must be logged in.';
			return;
		}
		// Double check chapter ownership
		const { data: chapterData, error: chapterError } = await supabase
			.from('chapters')
			.select('*, stories:user_id')
			.eq('id', chapterId)
			.single();
		if (chapterError || !chapterData || chapterData.user_id !== user.id) {
			error = 'You do not have access to this chapter.';
			return;
		}
		const nowIso = new Date().toISOString();
		const { data, error: insertError } = await supabase
			.from('blocks')
			.insert({
				content: newBlockContent,
				chapter_id: chapterId,
				user_id: user.id,
				styles: stylesObj,
				updated_at: nowIso
			})
			.select()
			.single();
		if (insertError) {
			error = insertError.message;
			return;
		}
		// Update chapter's updated_at
		await supabase.from('chapters').update({ updated_at: nowIso }).eq('id', chapterId);
		// Update story's updated_at
		if (chapterData && chapterData.story_id) {
			await supabase.from('stories').update({ updated_at: nowIso }).eq('id', chapterData.story_id);
		}

		blocks = [...blocks, data];
		newBlockContent = '';
		newBlockStyles = '{}';
		canCreateBlock = false;
	}

	// Live preview variables
	let previewHtml = '';
	$: previewHtml = (() => {
		try {
			return coffeeMarkdown(newBlockContent, JSON.parse(newBlockStyles));
		} catch {
			return coffeeMarkdown(newBlockContent, undefined);
		}
	})();

	let showStylesEditor = false; // for new block
	let showEditStylesEditor = false; // for editing block

	function toggleStylesEditor() {
		showStylesEditor = !showStylesEditor;
	}
	function toggleEditStylesEditor() {
		showEditStylesEditor = !showEditStylesEditor;
	}

	let editingBlockId: string | null = null;
	let editingContent = '';
	let editingStyles = '{}'; // JSON string for editing block styles
	let editLoading = false;

	function startEditBlock(blockId: string, content: string, styles: any) {
		editingBlockId = blockId;
		editingContent = content;
		editingStyles = styles ? JSON.stringify(styles, null, 2) : '{}';
		showEditStylesEditor = false;
		error = '';
	}
	function cancelEditBlock() {
		editingBlockId = null;
		editingContent = '';
		editingStyles = '{}';
		showEditStylesEditor = false;
		error = '';
	}
	async function saveEditBlock(blockId: string) {
		if (!editingContent.trim() || editingContent.length > 1000) {
			error = 'Block must be 1-1000 characters.';
			return;
		}
		let stylesObj = {};
		if (editingStyles.trim()) {
			try {
				stylesObj = JSON.parse(editingStyles);
			} catch (e) {
				error = 'Styles must be valid JSON.';
				return;
			}
		}
		editLoading = true;
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			error = 'You must be logged in.';
			editLoading = false;
			return;
		}
		// Double check chapter ownership
		const { data: chapterData, error: chapterError } = await supabase
			.from('chapters')
			.select('*, stories:user_id')
			.eq('id', chapterId)
			.single();
		if (chapterError || !chapterData || chapterData.user_id !== user.id) {
			error = 'You do not have access to this chapter.';
			editLoading = false;
			return;
		}
		const nowIso = new Date().toISOString();
		const { error: updateError, data: updated } = await supabase
			.from('blocks')
			.update({ content: editingContent, styles: stylesObj, updated_at: nowIso })
			.eq('id', blockId)
			.select();
		if (updateError) {
			error = updateError.message;
			editLoading = false;
			return;
		}
		// Update chapter's updated_at
		await supabase.from('chapters').update({ updated_at: nowIso }).eq('id', chapterId);
		// Update story's updated_at
		if (chapterData && chapterData.story_id) {
			await supabase.from('stories').update({ updated_at: nowIso }).eq('id', chapterData.story_id);
		}

		// Update local blocks array
		blocks = blocks.map((b) =>
			b.id === blockId
				? { ...b, content: editingContent, styles: stylesObj, updated_at: nowIso }
				: b
		);
		editingBlockId = null;
		editingContent = '';
		editingStyles = '{}';
		editLoading = false;
	}
</script>

{#if loading}
	<div class="modern-loading">Loading...</div>
{:else if error}
	<div class="modern-error">{error}</div>
{:else}
	<div class="modern-block-editor">
		<div class="modern-blocks-list-wrapper {showBlocksList ? '' : 'collapsed'}">
			<button class="collapse-btn" on:click={toggleBlocksList} aria-label="Toggle blocks list">
				{showBlocksList ? '⮜ Hide' : '⮞'}
			</button>
			{#if showBlocksList}
				<div class="modern-blocks-list">
					<h2>Blocks in Chapter</h2>
					<ul>
						{#each blocks as block}
							<li class="block-item">
								{#if editingBlockId === block.id}
									<ZenMarkdownEditor
										bind:value={editingContent}
										maxLength={1000}
										placeholder="Edit your block content..."
										bind:showPreview={showEditStylesEditor}
										customStyles={(() => {
											try {
												return JSON.parse(editingStyles);
											} catch {
												return defaultStyles;
											}
										})()}
									/>
									<button
										class="styles-toggle-btn"
										type="button"
										on:click={toggleEditStylesEditor}
										style="margin:0.5rem 0;"
									>
										{showEditStylesEditor ? 'Hide Styles ▲' : 'Advanced Styles ▼'}
									</button>
									{#if showEditStylesEditor}
										<textarea
											class="modern-textarea"
											bind:value={editingStyles}
											placeholder="Block styles (JSON)"
											style="margin-bottom:0.5rem;height:70px;font-size:0.95rem;"
										></textarea>
									{/if}
									<div style="display:flex;gap:0.5rem;">
										<button
											class="control-btn"
											on:click={() => saveEditBlock(block.id)}
											disabled={editLoading}
										>
											{editLoading ? 'Saving...' : 'Save'}
										</button>
										<button class="control-btn" on:click={cancelEditBlock} type="button"
											>Cancel</button
										>
									</div>
								{:else}
									<div class="block-content">
										{@html coffeeMarkdown(block.content, block.styles === null ? undefined : (block.styles as any))}
									</div>
									<small class="block-date"
										>{block.created_at ? new Date(block.created_at).toLocaleString() : ''}</small
									>
									<button
										class="control-btn"
										style="margin-top:0.3rem;"
										on:click={() => startEditBlock(block.id, block.content, block.styles)}
									>
										Edit
									</button>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
		<div class="modern-editor-panel">
			<div class="editor-controls">
				<button on:click={toggleEditor} class="control-btn"
					>{showEditor ? 'Hide' : 'Show'} Editor</button
				>
				<button on:click={clearEditor} class="control-btn">Clear</button>
				<button on:click={copyMarkdown} class="control-btn">Copy Markdown</button>
			</div>
			<div class="editor-main">
				{#if showEditor}
					<div class="editor-column">
						<ZenMarkdownEditor
							bind:value={newBlockContent}
							maxLength={1000}
							placeholder="Write your next 1000 characters (markdown supported)"
							customStyles={(() => {
								try {
									return JSON.parse(newBlockStyles);
								} catch {
									return defaultStyles;
								}
							})()}
						/>
						<button
							class="styles-toggle-btn"
							type="button"
							on:click={toggleStylesEditor}
							style="margin:0.5rem 0;"
						>
							{showStylesEditor ? 'Hide Styles ▲' : 'Advanced Styles ▼'}
						</button>
						{#if showStylesEditor}
							<textarea
								bind:value={newBlockStyles}
								placeholder="Block styles (JSON)"
								class="modern-textarea"
								style="margin-top:0.5rem;height:70px;font-size:0.95rem;"
							></textarea>
						{/if}
					</div>
				{/if}
			</div>
			{#if canCreateBlock}
				<button class="add-block-btn" on:click={addBlock}>Add Block</button>
			{:else}
				<p class="block-wait-msg">
					You can add a new block every 35 minutes.<br />
					{#if timeUntilNextBlock}
						Next block available in <b>{timeUntilNextBlock}</b>
					{/if}
				</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modern-block-editor {
		display: flex;
		gap: 2rem;
		margin: 2rem auto;
		max-width: 100%;
	}
	.modern-blocks-list-wrapper {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		min-width: 270px;
		max-width: 320px;
		transition: width 0.2s;
	}
	.modern-blocks-list-wrapper.collapsed {
		min-width: 0;
		max-width: 40px;
	}
	.collapse-btn {
		background: #e0e7ff;
		color: #3730a3;
		border: none;
		padding: 0.3rem 0.7rem;
		border-radius: 6px;
		font-size: 1rem;
		margin-bottom: 0.7rem;
		cursor: pointer;
		align-self: flex-end;
		transition: background 0.2s;
	}
	.collapse-btn:hover {
		background: #c7d2fe;
	}
	.modern-blocks-list {
		width: 100%;
		background: #f9f9fb;
		border-radius: 12px;
		padding: 1.5rem 1.5rem 1rem 1.5rem;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
		height: fit-content;
	}
	.modern-blocks-list h2 {
		margin-top: 0;
		font-size: 1.2rem;
		color: #4f46e5;
	}
	.block-item {
		background: #fff;
		border-radius: 8px;
		margin-bottom: 1.2rem;
		padding: 1rem 1.2rem;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
	}
	.block-content {
		font-size: 1.05rem;
		color: #222;
		margin-bottom: 0.5rem;
	}
	.block-date {
		color: #888;
		font-size: 0.85rem;
	}
	.modern-editor-panel {
		flex: 1.2;
		background: #fff;
		border-radius: 12px;
		padding: 2rem 2rem 1.5rem 2rem;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}
	.editor-controls {
		display: flex;
		gap: 0.7rem;
		margin-bottom: 0.5rem;
	}
	.control-btn {
		background: #e0e7ff;
		color: #3730a3;
		border: none;
		padding: 0.4rem 1.1rem;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	.control-btn:hover {
		background: #c7d2fe;
	}
	.editor-main {
		display: flex;
		gap: 2rem;
		flex-direction: row;
	}
	.editor-column {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.modern-textarea {
		width: 100%;
		padding: 0.7rem;
		border-radius: 8px;
		border: 1.5px solid #cbd5e1;
		background: #f8fafc;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
		resize: vertical;
		margin-bottom: 0.5rem;
	}
	.preview-content {
		font-size: 1.05rem;
		color: #222;
		word-break: break-word;
	}
	.add-block-btn {
		margin-top: 1.2rem;
		background: #4f46e5;
		color: #fff;
		border: none;
		padding: 0.7rem 2.2rem;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}
	.add-block-btn:hover {
		background: #3730a3;
	}
	.block-wait-msg {
		color: #b91c1c;
		font-weight: 500;
		margin-top: 1.2rem;
	}
	.modern-loading {
		text-align: center;
		font-size: 1.2rem;
		color: #4f46e5;
		margin-top: 3rem;
	}
	.modern-error {
		text-align: center;
		font-size: 1.1rem;
		color: #b91c1c;
		margin-top: 3rem;
	}
	.block-content,
	.preview-content {
		/* existing styles for .block-content and .preview-content */
		font-size: 1.05rem;
		color: #222;
		margin-bottom: 0.5rem;
		word-break: break-word;
	}
	@media (max-width: 900px) {
		.modern-block-editor {
			flex-direction: column;
			gap: 1.5rem;
		}
		.editor-main {
			flex-direction: column;
			gap: 1rem;
		}
		.editor-column {
			width: 100%;
		}
		.modern-preview.collapsable-preview {
			min-width: 500px;
			margin-left: 0;
			max-width: 100%;
		}
		.modern-blocks-list-wrapper {
			max-width: 100vw;
			min-width: 0;
		}
	}
	.block-item .control-btn {
		font-size: 0.95rem;
		padding: 0.25rem 0.8rem;
		margin-left: 0;
	}
	.block-item textarea.modern-textarea {
		height: 120px;
		width: 100%;
		font-size: 1rem;
	}
	.styles-toggle-btn {
		background: #f3f4f6;
		color: #3730a3;
		border: 1px solid #cbd5e1;
		border-radius: 5px;
		padding: 0.25rem 0.9rem;
		font-size: 0.98rem;
		cursor: pointer;
		transition:
			background 0.2s,
			border 0.2s;
	}
	.styles-toggle-btn:hover {
		background: #e0e7ff;
		border-color: #4f46e5;
	}
</style>
