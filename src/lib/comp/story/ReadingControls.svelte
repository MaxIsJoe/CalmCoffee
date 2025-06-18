<script lang="ts">
	import type { Database } from '../../../../database.types';

	export let isFullScreen: boolean;
	export let chapters: Database['public']['Tables']['chapters']['Row'][];
	export let selectedChapterId: string;
	export let blockOrder: 'oldest' | 'newest';
	export let onBackToOverview: () => void;
	export let onToggleLayout: () => void;

	function handleBlockOrderChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		blockOrder = select.value as 'oldest' | 'newest';
	}

	function handleChapterChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		selectedChapterId = select.value;
	}
</script>

<div class="read-controls">
	<button class="back-to-overview" on:click={onBackToOverview}>
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M19 12H5M12 19l-7-7 7-7"/>
		</svg>
		Back to Overview
	</button>
	<label>
		Block order:
		<select value={blockOrder} on:change={handleBlockOrderChange}>
			<option value="oldest">Oldest first</option>
			<option value="newest">Newest first</option>
		</select>
	</label>
	{#if chapters.length > 1}
		<label style="margin-left:1.5em;">
			Chapter:
			<select value={selectedChapterId} on:change={handleChapterChange}>
				<option value="">All</option>
				{#each chapters as chapter}
					<option value={chapter.id}>{chapter.title}</option>
				{/each}
			</select>
		</label>
	{/if}
	<button 
		class="layout-toggle" 
		on:click={onToggleLayout}
		title={isFullScreen ? "Switch to contained layout" : "Switch to full-screen layout"}
	>
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			{#if isFullScreen}
				<path d="M4 14h6m0 0v6m0-6l-7 7m17-11h-6m0 0V4m0 6l7-7"/>
			{:else}
				<path d="M4 4h6m0 0v6m0-6l-7 7m17 11h-6m0 0v-6m0 6l7-7"/>
			{/if}
		</svg>
	</button>
</div>

<style>
	.read-controls {
		max-width: 800px;
		margin: 1.2rem auto 0 auto;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1rem;
	}

	.read-controls label {
		font-size: 1rem;
		color: var(--color-link);
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.read-controls select {
		font-size: 1rem;
		padding: 0.2em 0.7em;
		border-radius: 6px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		color: var(--color-link);
	}

	.layout-toggle {
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 0.4em;
		cursor: pointer;
		color: var(--color-link);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.layout-toggle:hover {
		background: var(--color-link-hover);
	}

	.back-to-overview {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 0.4em 0.8em;
		cursor: pointer;
		color: var(--color-link);
		font-size: 0.95rem;
		transition: all 0.2s;
	}

	.back-to-overview:hover {
		background: var(--color-link-hover);
	}

	.back-to-overview svg {
		display: block;
	}
</style> 