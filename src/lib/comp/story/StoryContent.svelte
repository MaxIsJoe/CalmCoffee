<script lang="ts">
	import type { Database } from '../../../../database.types';
	import { coffeeMarkdown } from '$lib/md/coffeeMarkdown';

	export let chapters: Database['public']['Tables']['chapters']['Row'][];
	export let blocks: Database['public']['Tables']['blocks']['Row'][];
	export let selectedChapterId: string;
	export let blockOrder: 'oldest' | 'newest';
	export let comments: Record<string, { id: string; commenter_id: string; comment: string; username?: string }[]>;
	export let onToggleComments: (blockId: string) => void;

	function getBlocksForChapter(chapterId: string) {
		const arr = blocks.filter((b) => b.chapter_id === chapterId);
		return blockOrder === 'oldest'
			? arr
					.slice()
					.sort((a, b) => {
						const dateA = a.created_at ? new Date(a.created_at).getTime() : Number.MAX_VALUE;
						const dateB = b.created_at ? new Date(b.created_at).getTime() : Number.MAX_VALUE;
						return dateA - dateB;
					})
			: arr
					.slice()
					.sort((a, b) => {
						const dateA = a.created_at ? new Date(a.created_at).getTime() : Number.MIN_VALUE;
						const dateB = b.created_at ? new Date(b.created_at).getTime() : Number.MIN_VALUE;
						return dateB - dateA;
					});
	}
</script>

{#if selectedChapterId}
	{#each chapters.filter((c) => c.id === selectedChapterId) as chapter}
		<div class="chapter-block">
			<div class="chapter-header">
				<h2>{chapter.title}</h2>
			</div>
			{#each getBlocksForChapter(chapter.id) as block}
				<div class="block-row">
					<div class="block-content">
						<button
							class="comments-icon-btn"
							on:click={() => onToggleComments(block.id)}
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
						{@html coffeeMarkdown(block.content, block.styles ?? undefined)}
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
							on:click={() => onToggleComments(block.id)}
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
						{@html coffeeMarkdown(block.content, block.styles ?? undefined)}
					</div>
				</div>
			{/each}
		</div>
	{/each}
{/if}

<style>
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
		display: block;
		position: relative;
	}

	.block-content {
		background: #f3f4f6;
		border-radius: 8px;
		padding: 2.2rem 1.2rem 1rem 1.2rem;
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
</style> 