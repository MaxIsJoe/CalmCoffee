<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function insert(before: string, after: string = '', placeholder: string = '') {
		dispatch('insert', { before, after, placeholder });
	}
</script>

<div class="markdown-toolbar">
	<button type="button" title="Bold" on:click={() => insert('**', '**', 'bold')}><b>B</b></button>
	<button type="button" title="Italic" on:click={() => insert('*', '*', 'italic')}><i>I</i></button>
	<button type="button" title="Underline" on:click={() => insert('<u>', '</u>', 'underline')}
		><u>U</u></button
	>
	<button type="button" title="Heading" on:click={() => insert('# ', '', 'Heading')}>H</button>
	<button type="button" title="List" on:click={() => insert('- ', '', 'list item')}>• List</button>
	<button type="button" title="Ordered List" on:click={() => insert('1. ', '', 'ordered item')}
		>1. List</button
	>
	<button type="button" title="Blockquote" on:click={() => insert('> ', '', 'quote')}>&gt;</button>
	<button type="button" title="Code" on:click={() => insert('`', '`', 'code')}
		><code>&lt;/&gt;</code></button
	>
	<button type="button" title="Link" on:click={() => insert('[', '](https://)', 'link text')}
		>🔗</button
	>
	<button type="button" title="Image" on:click={() => insert('![](img-proxy:', ')', 'img url)')}
		>🖼️</button
	>
	<button
		type="button"
		title="CSS"
		on:click={() =>
			insert(
				'<custom style="padding:0.7em 1em;border-radius:8px;margin:1em 0;">\n',
				'\n</custom>',
				'/* Custom Styled Paragraph */'
			)}>CSS</button
	>
	<button
		type="button"
		title="Background Color Section"
		on:click={() => insert('<bgc bg:white text:#222>\n', '\n</bgc>', 'background section')}
		>BG</button
	>
</div>

<!--
USAGE DOCUMENTATION:

The MarkdownToolbar component emits an `insert` event when a toolbar button is clicked.

- The event detail is an object: { before: string, after: string, placeholder: string }
- The parent component should listen for the `insert` event and call a function that inserts the markdown at the current cursor position in the target input or textarea.

Example usage in a parent Svelte component:

<script lang="ts">
	let textareaEl: HTMLTextAreaElement | null = null;
	let content = "";

	function insertAtCursor(before: string, after: string = '', placeholder: string = '') {
		if (!textareaEl) return;
		const el = textareaEl;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = content.slice(start, end) || placeholder;
		const newText = content.slice(0, start) + before + selected + after + content.slice(end);
		content = newText;
		// Optionally, restore cursor/selection position:
		setTimeout(() => {
			el.focus();
			const cursorStart = start + before.length;
			const cursorEnd = cursorStart + selected.length;
			el.setSelectionRange(cursorStart, cursorEnd);
		}, 0);
	}
</script>

<MarkdownToolbar on:insert={e => insertAtCursor(e.detail.before, e.detail.after, e.detail.placeholder)} />
<textarea bind:this={textareaEl} bind:value={content}></textarea>

-->

<style>
	.markdown-toolbar {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.7rem;
		flex-wrap: wrap;
	}
	.markdown-toolbar button {
		background: #f3f4f6;
		border: 1px solid #cbd5e1;
		border-radius: 4px;
		padding: 0.3rem 0.7rem;
		font-size: 1rem;
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s;
	}
	.markdown-toolbar button:hover {
		background: #e0e7ff;
		border-color: #4f46e5;
	}
</style>
