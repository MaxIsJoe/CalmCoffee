<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';
	import BlockEditor from '$lib/comp/markdown/BlockEditor.svelte';
	import BlockPreview from '$lib/comp/markdown/BlockPreview.svelte';
	import { user } from '$lib/stores/user';
	import type { Block } from '$lib/db/story';
	import { fetchBlocksByChapterIds, addBlock, updateBlock } from '$lib/db/story';

	let blocks: Block[] = [];
	let error = '';
	let loading = true;
	let canCreateBlock = true;
	let chapterId = '';
	$: chapterId = $page.params.chapterId;

	let mode: 'preview' | 'add' | 'edit' = 'preview';
	let editingBlockId: string | null = null;
	let editorContent = '';
	let editorStyles = JSON.stringify(defaultStyles, null, 2);
	let editorLoading = false;
	let nextBlockTime: Date | null = null;
	let timeUntilNextBlock = '';

	const timeLimit: number = 15;

	onMount(async () => {
		loading = true;
		let userId: string | undefined;
		if ($user?.usr?.id) {
			userId = $user.usr.id;
		} else {
			const { data: userData } = await import('$lib/supabaseClient').then((m) =>
				m.supabase.auth.getUser()
			);
			userId = userData.user?.id;
		}
		if (!userId) {
			error = 'You must be logged in.';
			loading = false;
			return;
		}
		// Ownership check would require fetching chapter info, which is not in db/story.ts yet. For now, skip ownership check.
		try {
			blocks = await fetchBlocksByChapterIds([chapterId]);
			const lastBlock = blocks.length > 0 ? blocks[blocks.length - 1] : null;
			if (lastBlock && lastBlock.created_at) {
				const last = new Date(lastBlock.created_at);
				const now = new Date();
				const diff = (now.getTime() - last.getTime()) / (1000 * 60);
				canCreateBlock = diff >= timeLimit;
				if (!canCreateBlock) {
					nextBlockTime = new Date(last.getTime() + timeLimit * 60 * 1000);
					updateTimeUntilNextBlock();
					timerInterval = setInterval(updateTimeUntilNextBlock, 1000);
				}
			}
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			blocks = [];
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
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;
		mode = 'edit';
		editingBlockId = blockId;
		editorContent = block.content;
		editorStyles = block.styles
			? JSON.stringify(block.styles, null, 2)
			: JSON.stringify(defaultStyles, null, 2);
		error = '';
	}
	function handleCancel() {
		mode = 'preview';
		editingBlockId = null;
		editorContent = '';
		editorStyles = JSON.stringify(defaultStyles, null, 2);
		error = '';
	}
	async function handleSave(e: CustomEvent<{ value: string; styles: string }>) {
		const value = e.detail.value;
		let stylesObj = {};
		try {
			stylesObj = JSON.parse(e.detail.styles);
		} catch {
			error = 'Styles must be valid JSON.';
			return;
		}
		editorLoading = true;
		let userId: string | undefined;
		if ($user?.usr?.id) {
			userId = $user.usr.id;
		} else {
			const { data: userData } = await import('$lib/supabaseClient').then((m) =>
				m.supabase.auth.getUser()
			);
			userId = userData.user?.id;
		}
		if (!userId) {
			error = 'You must be logged in.';
			editorLoading = false;
			return;
		}
		const nowIso = new Date().toISOString();
		try {
			if (mode === 'add') {
				const block = await addBlock({
					content: value,
					chapter_id: chapterId,
					user_id: userId,
					styles: stylesObj,
					updated_at: nowIso
				});
				blocks = [...blocks, block];
				canCreateBlock = false;
			} else if (mode === 'edit' && editingBlockId) {
				const block = await updateBlock(editingBlockId, {
					content: value,
					styles: stylesObj,
					updated_at: nowIso
				});
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
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			editorLoading = false;
		}
	}
</script>

{#if loading}
	<div class="modern-loading">Loading...</div>
{:else if error}
	<div class="modern-error">{error}</div>
{:else}
	<div class="chapter-blocks-layout">
		{#if !canCreateBlock && mode === 'preview'}
			<div class="block-wait-msg-info">
				<span class="wait-icon" aria-hidden="true">⏳</span>
				<span>
					<span class="block-wait-title">You can add a new block every {timeLimit} minutes.</span
					><br />
					{#if timeUntilNextBlock}
						Next block available in <b>{timeUntilNextBlock}</b>
					{/if}
				</span>
			</div>
		{/if}
		<div class="chapter-blocks-header">
			<h2>Blocks in Chapter</h2>
			{#if mode === 'preview'}
				<button class="add-block-btn" on:click={handleAddClick} disabled={!canCreateBlock}>
					Add Block
				</button>
			{/if}
		</div>
		{#if mode === 'add'}
			<BlockEditor
				value={editorContent}
				styles={editorStyles}
				on:save={handleSave}
				on:cancel={handleCancel}
				loading={editorLoading}
				{error}
				draftKey={`block-editor-draft-${chapterId}-add`}
				showDraftStatus={true}
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
							{error}
							draftKey={`block-editor-draft-${chapterId}-${block.id}`}
							showDraftStatus={true}
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
		width: 95%;
		background: var(--color-block-list-bg);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 2rem 1.2rem 1.2rem 2.2rem;
		margin: 12px;
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
	.block-wait-msg-info {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		color: var(--color-block-wait);
		font-weight: 500;
		background: var(--color-block-wait-info-bg);
		border-left: 5px solid var(--color-block-wait-info-border);
		margin: 0 auto;
		padding-bottom: 24px;
		padding-top: 24px;
		padding-left: 24px;
		padding-right: 24px;
		border-radius: 10px;
		font-size: 1.08rem;
		max-width: 75%;
		box-shadow: 0 2px 8px var(--color-block-list-shadow);
	}
	.block-wait-msg-info .wait-icon {
		font-size: 1.7em;
		margin-right: 0.5em;
		margin-top: 0.1em;
		flex-shrink: 0;
		opacity: 0.85;
	}
	.block-wait-title {
		color: var(--color-block-wait);
		font-weight: 600;
		margin-bottom: 0.2em;
		display: block;
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
		.block-wait-msg-info {
			padding: 0.8rem 1vw 0.8rem 1vw;
			font-size: 0.99rem;
			max-width: 98vw;
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
