<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import MarkdownToolbar from './MarkdownToolbar.svelte';
	import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';

	const dispatch = createEventDispatcher();

	export let value = '';
	export let placeholder = 'Start writing...';
	export let maxLength = 10000;
	export let showPreview = true;
	export let zenMode = false;
	export let customStyles = defaultStyles;

	let textareaEl: HTMLTextAreaElement | null = null;
	let previewHtml = '';
	let previewWidth = 400; // Default preview width
	let isResizing = false;
	let startX = 0;
	let startWidth = 0;

	function startResize(e: MouseEvent) {
		isResizing = true;
		startX = e.clientX;
		startWidth = previewWidth;
		document.body.style.cursor = 'ew-resize';
		document.addEventListener('mousemove', onResize);
		document.addEventListener('mouseup', stopResize);
	}

	function onResize(e: MouseEvent) {
		if (!isResizing) return;
		const dx = e.clientX - startX;
		let newWidth = startWidth - dx; // Subtract because we're dragging left
		newWidth = Math.max(300, Math.min(800, newWidth)); // Min 300px, max 800px
		previewWidth = newWidth;
	}

	function stopResize() {
		isResizing = false;
		document.body.style.cursor = '';
		document.removeEventListener('mousemove', onResize);
		document.removeEventListener('mouseup', stopResize);
	}

	$: previewHtml = coffeeMarkdown(value, customStyles);

	function insertAtCursor(before: string, after: string = '', placeholder: string = '') {
		if (!textareaEl) return;
		const el = textareaEl;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = value.slice(start, end) || placeholder;
		const newText = value.slice(0, start) + before + selected + after + value.slice(end);
		value = newText;
		// Wait for DOM update before setting selection
		setTimeout(() => {
			el.focus();
			const cursorStart = start + before.length;
			const cursorEnd = cursorStart + selected.length;
			el.setSelectionRange(cursorStart, cursorEnd);
		}, 0);
	}

	function toggleZenMode() {
		zenMode = !zenMode;
		if (zenMode) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}

	function togglePreview() {
		showPreview = !showPreview;
	}
</script>

<div class="zen-editor {zenMode ? 'zen-mode' : ''}">
	<div class="editor-header">
		<div class="editor-controls">
			<button type="button" class="control-btn" on:click={toggleZenMode} title="Toggle Zen Mode">
				{zenMode ? 'Exit Zen' : 'Zen Mode'}
			</button>
			<button type="button" class="control-btn" on:click={togglePreview} title="Toggle Preview">
				{showPreview ? 'Hide Preview' : 'Show Preview'}
			</button>
		</div>
		{#if zenMode}
			<button type="button" class="exit-zen-btn" on:click={toggleZenMode}>✕</button>
		{/if}
	</div>

	<div class="editor-main">
		<div class="editor-column">
			<MarkdownToolbar useMarkdown={true} on:insert={e => insertAtCursor(e.detail.before, e.detail.after, e.detail.placeholder)} />
			<textarea
				bind:this={textareaEl}
				bind:value
				{placeholder}
				maxlength={maxLength}
				class="editor-textarea"
			></textarea>
			<div class="char-counter {value.length > maxLength * 0.9 ? 'warn' : ''}">
				{value.length} / {maxLength} characters
			</div>
		</div>

		{#if showPreview}
			<div class="resize-handle" on:mousedown={startResize}></div>
			<div class="preview-column" style="width: {previewWidth}px">
				<div class="preview-content">
					{#if value.trim()}
						{@html previewHtml}
					{:else}
						<div class="empty-preview">
							<p>Start writing to see a preview of your content here.</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.zen-editor {
		background: #fff;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	.zen-editor.zen-mode {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000;
		border-radius: 0;
		border: none;
		background: #fff;
		display: flex;
		flex-direction: column;
	}

	.editor-header {
		padding: 0.5rem;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #f8fafc;
	}

	.editor-controls {
		display: flex;
		gap: 0.5rem;
	}

	.control-btn {
		background: #f1f5f9;
		border: 1px solid #cbd5e1;
		border-radius: 4px;
		padding: 0.3rem 0.7rem;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.control-btn:hover {
		background: #e0e7ff;
		border-color: #4f46e5;
	}

	.exit-zen-btn {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0.3rem 0.7rem;
		color: #64748b;
		transition: color 0.2s ease;
	}

	.exit-zen-btn:hover {
		color: #1e293b;
	}

	.editor-main {
		display: flex;
		flex: 1;
		min-height: 300px;
		position: relative;
	}

	.editor-column {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		min-width: 300px;
	}

	.editor-textarea {
		flex: 1;
		width: 100%;
		padding: 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 1rem;
		line-height: 1.5;
		resize: none;
		background: #fff;
		transition: border-color 0.2s ease;
	}

	.editor-textarea:focus {
		outline: none;
		border-color: #4f46e5;
	}

	.preview-column {
		background: #f8fafc;
		padding: 1rem;
		border-left: 1px solid #e2e8f0;
		overflow-y: auto;
		transition: width 0.1s ease;
	}

	.resize-handle {
		width: 4px;
		background: #e2e8f0;
		cursor: ew-resize;
		transition: background-color 0.2s ease;
	}

	.resize-handle:hover,
	.resize-handle:active {
		background: #4f46e5;
	}

	.preview-content {
		font-size: 1rem;
		line-height: 1.6;
		color: #1e293b;
        word-wrap: break-word;
	}

	.empty-preview {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #94a3b8;
		text-align: center;
		padding: 2rem;
	}

	.empty-preview p {
		margin: 0;
		font-style: italic;
	}

	.char-counter {
		font-size: 0.9rem;
		color: #64748b;
		text-align: right;
		margin-top: 0.5rem;
	}

	.char-counter.warn {
		color: #dc2626;
	}

	@media (max-width: 768px) {
		.editor-main {
			flex-direction: column;
		}

		.preview-column {
			width: 100% !important;
			border-left: none;
			border-top: 1px solid #e2e8f0;
		}

		.resize-handle {
			display: none;
		}

		.zen-editor.zen-mode {
			height: 100vh;
			height: 100dvh;
		}
	}
</style> 