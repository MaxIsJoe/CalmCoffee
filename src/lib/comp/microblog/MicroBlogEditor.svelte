<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';
	import { onMount, createEventDispatcher } from 'svelte';
	import MarkdownToolbar from '../markdown/MarkdownToolbar.svelte';

	const dispatch = createEventDispatcher();

	export let userId: string;
	export let onPosted: () => void = () => {};

	const characterLimit = 650;

	let content = '';
	let styles = JSON.stringify(defaultStyles, null, 2);
	let error = '';
	let loading = false;
	let previewHtml = '';
	let showStyles = false;

	const ageRatings = ["Everyone", "Teens", "Mature", "Adult"]
	let ageRating: string = ageRatings[0];

	$: previewHtml = (() => {
		try {
			return coffeeMarkdown(content, JSON.parse(styles));
		} catch {
			return coffeeMarkdown(content, undefined);
		}
	})();

	const maxTags = 6;
	let tagInput = '';
	let tags: string[] = [];
	let tagWarning = '';

	function addTag() {
		const tag = tagInput.trim();
		if (!tag) return;
		if (tags.length >= maxTags) {
			tagWarning = `You can only add up to ${maxTags} tags.`;
			return;
		}
		if (tags.includes(tag)) {
			tagWarning = 'Tag already added.';
			return;
		}
		tags = [...tags, tag];
		tagInput = '';
		tagWarning = '';
	}

	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
		tagWarning = '';
	}

	function handleTagInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addTag();
		}
	}

	let confirmNoTags = false;

	async function postMicroBlog() {
		error = '';
		tagWarning = '';
		if (!content.trim() || content.length > characterLimit) {
			error = `Micro-blog must be 1-${characterLimit} characters.`;
			return;
		}
		let stylesObj = {};
		if (styles.trim()) {
			try {
				stylesObj = JSON.parse(styles);
			} catch (e) {
				error = 'Styles must be valid JSON.';
				return;
			}
		}
		// If no tags, show confirmation prompt
		if (tags.length === 0 && confirmNoTags === false) {
			tagWarning = 'No tags were added. Posts without tags may not reach as many people.';
			console.log(`No tags added, showing confirmation prompt. confirmNoTags: ${confirmNoTags}`);
			confirmNoTags = true;
			return;
		}
		loading = true;
		const { error: insertError } = await supabase.from('microblogs').insert({
			content,
			writer: userId,
			age_rating: ageRating,
			styles: stylesObj,
			tags
		});
		loading = false;
		if (insertError) {
			error = insertError.message;
			return;
		}
		// Reset everything to default state
		content = '';
		styles = JSON.stringify(defaultStyles, null, 2);
		ageRating = ageRatings[0];
		tags = [];
		tagInput = '';
		confirmNoTags = false;
		tagWarning = '';
		error = '';
		showStyles = false;
		previewHtml = '';
		if (textareaEl) textareaEl.value = '';
		dispatch('posted');
		onPosted();
	}

	let textareaEl: HTMLTextAreaElement | null = null;

	function insertAtCursor(before: string, after: string = '', placeholder: string = '') {
		if (!textareaEl) return;
		const el = textareaEl;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = content.slice(start, end) || placeholder;
		const newText = content.slice(0, start) + before + selected + after + content.slice(end);
		content = newText;
		// Wait for DOM update before setting selection
		setTimeout(() => {
			el.focus();
			const cursorStart = start + before.length;
			const cursorEnd = cursorStart + selected.length;
			el.setSelectionRange(cursorStart, cursorEnd);
		}, 0);
	}
</script>

<div class="microblog-editor">
	<MarkdownToolbar
		on:insert={(e) => insertAtCursor(e.detail.before, e.detail.after, e.detail.placeholder)}
	/>
	<textarea
		class="microblog-textarea"
		bind:this={textareaEl}
		bind:value={content}
		maxlength={characterLimit}
		placeholder="What's on your mind? (max 650 characters)"
	></textarea>
	<div class="editor-row">
		<div class="char-counter">{content.length} / {characterLimit}</div>
		<button type="button" class="toggle-styles-btn" on:click={() => (showStyles = !showStyles)}>
			{showStyles ? 'Hide Styles ▲' : 'Show Styles ▼'}
		</button>
	</div>
	<div class="age-rating-row">
		<label for="age-rating-select">Age Rating:</label>
		<select id="age-rating-select" bind:value={ageRating}>
			{#each ageRatings as rating}
				<option value={rating}>{rating}</option>
			{/each}
		</select>
	</div>
	<div class="tag-row">
		<label for="tag-input">Tags:</label>
		<div class="tag-input-container">
			<input
				id="tag-input"
				type="text"
				placeholder="Add tag and press Enter (max 6)"
				bind:value={tagInput}
				on:keydown={handleTagInputKeydown}
				disabled={tags.length >= maxTags}
				maxlength={24}
			/>
			<button
				type="button"
				class="add-tag-btn"
				on:click={addTag}
				disabled={tags.length >= maxTags || !tagInput.trim()}>Add</button
			>
		</div>
		<div class="tag-list">
			{#each tags as tag}
				<span class="tag">
					{tag}
					<button
						type="button"
						class="remove-tag-btn"
						on:click={() => removeTag(tag)}
						title="Remove tag">&times;</button
					>
				</span>
			{/each}
		</div>
	</div>
	{#if showStyles}
		<textarea
			bind:value={styles}
			placeholder="Block styles (JSON)"
			class="microblog-styles"
			style="margin-top:0.5rem;height:70px;font-size:0.97rem;"
		></textarea>
	{/if}
	<button class="post-btn" on:click={postMicroBlog} disabled={loading}
		>{loading ? 'Posting...' : 'Post Micro-Blog'}</button
	>
	{#if tagWarning}
		<div class="microblog-warning">
			{tagWarning}
			{#if confirmNoTags}
				<br />
				<button
					class="confirm-btn"
					on:click={() => {
						postMicroBlog();
					}}
					disabled={loading}
				>
					Yes, post without tags
				</button>
				<button
					class="cancel-btn"
					on:click={() => {
						confirmNoTags = false;
						tagWarning = '';
					}}
				>
					Cancel
				</button>
			{/if}
		</div>
	{/if}
	{#if error}
		<div class="microblog-error">{error}</div>
	{/if}
	<div class="microblog-preview">
		<h4>Preview</h4>
		<div class="preview-content">{@html previewHtml}</div>
	</div>
</div>

<style>
	.microblog-editor {
		background: #ebecec;
		border-radius: 10px;
		box-shadow: 0 2px 8px rgba(60, 60, 90, 0.06);
		padding: 1.5rem 1.2rem 1.2rem 1.2rem;
		margin-bottom: 2rem;
		border: 1px solid #e5e7eb;
	}
	.microblog-textarea {
		width: 100%;
		height: 90px;
		margin-bottom: 0.5rem;
		border-radius: 6px;
		border: 1px solid #cbd5e1;
		padding: 0.7rem;
		font-size: 1.07rem;
		background: #fff;
		resize: vertical;
		transition: border-color 0.15s;
	}
	.microblog-textarea:focus {
		border-color: #6366f1;
		outline: none;
	}
	.editor-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.2rem;
	}
	.toggle-styles-btn {
		background: none;
		border: none;
		color: #6366f1;
		font-size: 0.98rem;
		cursor: pointer;
		padding: 0.1rem 0.3rem;
		transition: color 0.15s;
	}
	.toggle-styles-btn:hover {
		color: #1e293b;
		text-decoration: underline;
	}
	.microblog-styles {
		width: 100%;
		border-radius: 6px;
		border: 1px solid #cbd5e1;
		padding: 0.5rem;
		background: #f9fafb;
		font-family: 'Fira Mono', 'Consolas', monospace;
		resize: vertical;
		transition: border-color 0.15s;
	}
	.microblog-styles:focus {
		border-color: #6366f1;
		outline: none;
	}
	.char-counter {
		font-size: 0.97rem;
		color: #64748b;
		text-align: right;
	}
	.post-btn {
		margin-top: 0.7rem;
		background: linear-gradient(90deg, #6366f1 60%, #818cf8 100%);
		color: #fff;
		border: none;
		border-radius: 6px;
		padding: 0.55rem 1.3rem;
		font-size: 1.07rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background 0.18s,
			box-shadow 0.18s;
		box-shadow: 0 1px 4px rgba(60, 60, 90, 0.07);
	}
	.post-btn:disabled {
		background: #c7d2fe;
		color: #fff;
		cursor: not-allowed;
	}
	.post-btn:hover:enabled {
		background: linear-gradient(90deg, #4f46e5 60%, #6366f1 100%);
	}
	.microblog-error {
		color: #b91c1c;
		margin-top: 0.7rem;
		font-size: 1.01rem;
	}
	.microblog-warning {
		color: #bfa007;
		margin-top: 0.7rem;
		font-size: 1.01rem;
	}
	.microblog-preview {
		background: #f3f4f6;
		border-radius: 8px;
		padding: 0.9em 1.2em;
		margin-top: 1.2em;
		border: 1px solid #e5e7eb;
	}
	.preview-content {
		font-size: 1.04rem;
		color: #222;
	}
	.age-rating-row {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin: 0.3rem 0 0.7rem 0;
	}
	.age-rating-row label {
		font-size: 1rem;
		color: #334155;
	}
	.age-rating-row select {
		border-radius: 5px;
		border: 1px solid #cbd5e1;
		padding: 0.25rem 0.7rem;
		font-size: 1rem;
		background: #fff;
		color: #222;
		transition: border-color 0.15s;
	}
	.age-rating-row select:focus {
		border-color: #6366f1;
		outline: none;
	}
	.tag-row {
		margin-bottom: 0.7em;
	}
	.tag-input-container {
		display: flex;
		gap: 0.5em;
		margin-bottom: 0.4em;
	}
	.tag-input-container input[type='text'] {
		flex: 1;
		padding: 0.4em 0.7em;
		border-radius: 5px;
		border: 1px solid #cbd5e1;
		font-size: 1em;
		background: #fff;
		transition: border-color 0.15s;
	}
	.tag-input-container input[type='text']:focus {
		border-color: #6366f1;
		outline: none;
	}
	.add-tag-btn {
		background: #a67c52;
		color: #fff;
		border: none;
		border-radius: 5px;
		padding: 0.35em 1em;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
	}
	.add-tag-btn:disabled {
		background: #e0d7ce;
		color: #bfa07a;
		cursor: not-allowed;
	}
	.add-tag-btn:hover:not(:disabled) {
		background: #7c5e48;
	}
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
	}
	.tag {
		background: #ede9e3;
		color: #7c5e48;
		font-size: 0.97em;
		padding: 0.18em 0.7em;
		border-radius: 999px;
		font-weight: 500;
		letter-spacing: 0.01em;
		border: 1px solid #e0d7ce;
		display: flex;
		align-items: center;
	}
	.remove-tag-btn {
		background: none;
		border: none;
		color: #a67c52;
		font-size: 1.1em;
		margin-left: 0.3em;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}
	.remove-tag-btn:hover {
		color: #b91c1c;
	}
	.confirm-btn,
	.cancel-btn {
		margin-top: 0.6em;
		margin-right: 0.7em;
		padding: 0.35em 1em;
		border-radius: 5px;
		font-size: 1em;
		font-weight: 500;
		cursor: pointer;
		border: none;
	}
	.confirm-btn {
		background: #a67c52;
		color: #fff;
	}
	.confirm-btn:disabled {
		background: #e0d7ce;
		color: #bfa07a;
		cursor: not-allowed;
	}
	.confirm-btn:hover:not(:disabled) {
		background: #7c5e48;
	}
	.cancel-btn {
		background: #e0d7ce;
		color: #7c5e48;
	}
	.cancel-btn:hover {
		background: #bfa07a;
		color: #fff;
	}
</style>
