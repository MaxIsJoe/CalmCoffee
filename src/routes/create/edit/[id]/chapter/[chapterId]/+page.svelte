<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';
	import type { Database } from '../../../../../../../database.types';
	import BlockList from '$lib/comp/markdown/BlockList.svelte';
	import BlockEditor from '$lib/comp/markdown/BlockEditor.svelte';
	import BlockPreview from '$lib/comp/markdown/BlockPreview.svelte';

	let blocks: Database['public']['Tables']['blocks']['Row'][] = [];
	let error = '';
	let loading = true;
	let canCreateBlock = true;
	let chapterId = '';
	$: chapterId = $page.params.chapterId;

	// Modes: 'preview', 'add', 'edit'
	let mode: 'preview' | 'add' | 'edit' = 'preview';
	let editingBlockId: string | null = null;
	let editorContent = '';
	let editorStyles = JSON.stringify(defaultStyles, null, 2);
	let editorLoading = false;
	let nextBlockTime: Date | null = null;
	let timeUntilNextBlock = '';

	onMount(async () => {
		loading = true;
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			error = 'You must be logged in.';
			loading = false;
			return;
		}
		const { data: chapterData, error: chapterError } = await supabase
			.from('chapters')
			.select('*, stories:user_id')
			.eq('id', chapterId)
			.single();
		if (chapterError || !chapterData || chapterData.user_id !== user.id) {
			error = 'You do not have access to this chapter.';
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
			blocks = (blockData || []).map(b => ({ ...b, created_at: b.created_at || '' }));
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

	let timerInterval: ReturnType<typeof setInterval> | null = null;
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
	$: if (canCreateBlock && timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}

	function handleAddClick() {
		mode = 'add';
		editorContent = '';
		editorStyles = JSON.stringify(defaultStyles, null, 2);
		error = '';
	}
	function handleEditClick(blockId: string) {
		const block = blocks.find(b => b.id === blockId);
		if (!block) return;
		mode = 'edit';
		editingBlockId = blockId;
		editorContent = block.content;
		editorStyles = block.styles ? JSON.stringify(block.styles, null, 2) : JSON.stringify(defaultStyles, null, 2);
		error = '';
	}
	function handleCancel() {
		mode = 'preview';
		editingBlockId = null;
		editorContent = '';
		editorStyles = JSON.stringify(defaultStyles, null, 2);
		error = '';
	}
	async function handleSave(e: CustomEvent<{ value: string, styles: string }>) {
		const value = e.detail.value;
		let stylesObj = {};
		try {
			stylesObj = JSON.parse(e.detail.styles);
		} catch {
			error = 'Styles must be valid JSON.';
			return;
		}
		editorLoading = true;
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			error = 'You must be logged in.';
			editorLoading = false;
			return;
		}
		const nowIso = new Date().toISOString();
		if (mode === 'add') {
			// Double check chapter ownership
			const { data: chapterData, error: chapterError } = await supabase
				.from('chapters')
				.select('*, stories:user_id')
				.eq('id', chapterId)
				.single();
			if (chapterError || !chapterData || chapterData.user_id !== user.id) {
				error = 'You do not have access to this chapter.';
				editorLoading = false;
				return;
			}
			const { data, error: insertError } = await supabase
				.from('blocks')
				.insert({
					content: value,
					chapter_id: chapterId,
					user_id: user.id,
					styles: stylesObj,
					updated_at: nowIso
				})
				.select()
				.single();
			if (insertError) {
				error = insertError.message;
				editorLoading = false;
				return;
			}
			await supabase.from('chapters').update({ updated_at: nowIso }).eq('id', chapterId);
			if (chapterData && chapterData.story_id) {
				await supabase.from('stories').update({ updated_at: nowIso }).eq('id', chapterData.story_id);
			}
			blocks = [...blocks, data];
			canCreateBlock = false;
		} else if (mode === 'edit' && editingBlockId) {
			const { data: chapterData, error: chapterError } = await supabase
				.from('chapters')
				.select('*, stories:user_id')
				.eq('id', chapterId)
				.single();
			if (chapterError || !chapterData || chapterData.user_id !== user.id) {
				error = 'You do not have access to this chapter.';
				editorLoading = false;
				return;
			}
			const { error: updateError, data: updated } = await supabase
				.from('blocks')
				.update({ content: value, styles: stylesObj, updated_at: nowIso })
				.eq('id', editingBlockId)
				.select();
			if (updateError) {
				error = updateError.message;
				editorLoading = false;
				return;
			}
			await supabase.from('chapters').update({ updated_at: nowIso }).eq('id', chapterId);
			if (chapterData && chapterData.story_id) {
				await supabase.from('stories').update({ updated_at: nowIso }).eq('id', chapterData.story_id);
			}
			blocks = blocks.map((b) =>
				b.id === editingBlockId
					? { ...b, content: value, styles: stylesObj, updated_at: nowIso }
					: b
			);
			editingBlockId = null;
		}
		mode = 'preview';
		editorContent = '';
		editorStyles = JSON.stringify(defaultStyles, null, 2);
		editorLoading = false;
	}
</script>

{#if loading}
	<div class="modern-loading">Loading...</div>
{:else if error}
	<div class="modern-error">{error}</div>
{:else}
	<div class="chapter-blocks-layout">
		<div class="chapter-blocks-header">
			<h2>Blocks in Chapter</h2>
			{#if mode === 'preview'}
				<button class="add-block-btn" on:click={handleAddClick} disabled={!canCreateBlock}>
					Add Block
				</button>
			{/if}
			{#if !canCreateBlock && mode === 'preview'}
				<span class="block-wait-msg">
					Next block available in <b>{timeUntilNextBlock}</b>
				</span>
			{/if}
		</div>
		{#if mode === 'add'}
			<BlockEditor
				value={editorContent}
				styles={editorStyles}
				on:save={handleSave}
				on:cancel={handleCancel}
				loading={editorLoading}
				error={error}
			/>
		{/if}
		<ul class="block-list">
			{#each blocks as block (block.id)}
				<li>
					{#if mode === 'edit' && editingBlockId === block.id}
						<BlockEditor
							value={editorContent}
							styles={editorStyles}
							isEditing={true}
							on:save={handleSave}
							on:cancel={handleCancel}
							loading={editorLoading}
							error={error}
						/>
					{:else}
						<BlockPreview
							content={block.content}
							styles={block.styles}
							createdAt={block.created_at}
							onEdit={() => handleEditClick(block.id)}
						/>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.chapter-blocks-layout {
		width: 90%;
		min-height: 90vh;
		margin: 0;
		background: var(--color-block-list-bg);
		border-radius: 0;
		box-shadow: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		word-break: break-all;
		margin: 0 auto;
	}
	.chapter-blocks-header {
		width: 90%;
		background: var(--color-block-list-bg);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 2rem 2vw 1.2rem 2vw;
		margin: 0;
		border-bottom: 1.5px solid var(--color-block-list-shadow);
	}
	.add-block-btn {
		background: var(--color-block-add-btn-bg);
		color: var(--color-block-add-btn-text);
		border: none;
		padding: 0.7rem 2.2rem;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}
	.add-block-btn:disabled {
		background: var(--color-block-btn-bg);
		color: var(--color-block-btn-text);
		cursor: not-allowed;
	}
	.add-block-btn:hover:enabled {
		background: var(--color-block-add-btn-hover);
	}
	.block-wait-msg {
		color: var(--color-block-wait);
		font-weight: 500;
		margin-left: 1.2rem;
	}
	.block-list {
		width: 100%;
		padding: 0 2vw 2vw 2vw;
		margin: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}
	.block-list > li {
		width: 100%;
		margin: 0;
		padding: 0;
	}
	.modern-loading {
		text-align: center;
		font-size: 1.2rem;
		color: var(--color-block-loading);
		margin-top: 3rem;
	}
	.modern-error {
		text-align: center;
		font-size: 1.1rem;
		color: var(--color-block-error);
		margin-top: 3rem;
	}
	@media (max-width: 900px) {
		.chapter-blocks-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.7rem;
			padding: 1.2rem 2vw 0.7rem 2vw;
		}
		.block-list {
			padding: 0 2vw 1vw 2vw;
			gap: 0.7rem;
		}
	}
	@media (max-width: 600px) {
		.chapter-blocks-header {
			padding: 0.7rem 1vw 0.5rem 1vw;
		}
		.block-list {
			padding: 0 1vw 1vw 1vw;
		}
	}
</style>
