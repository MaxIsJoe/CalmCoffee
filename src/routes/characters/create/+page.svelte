<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Database } from '../../../../database.types';
	import MarkdownToolbar from '$lib/comp/markdown/MarkdownToolbar.svelte';
	import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';
	import { get } from 'svelte/store';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import { createCharacter } from '$lib/db/characters';
	import { fetchStoreContent, StoreContentType, type StoreContent } from '$lib/db/content-shop';
	import DatePicker from '$lib/comp/common/DatePicker.svelte';

	type CharacterInsert = Database['public']['Tables']['characters']['Insert'];

	let character_name = '';
	let character_desc = '';
	let character_type: CharacterInsert['character_type'] = 'OC';
	let date_of_birth = '';
	let character_avatar = '';
	let art_links = '';
	let gender: CharacterInsert['gender'] = 'NB';
	let pronouns = '';
	let error: string | null = null;
	let loading = false;

	let descTextarea: HTMLTextAreaElement | null = null;

	let showTemplateModal = false;
	let templateSearch = '';
	let templateResults: StoreContent[] = [];
	let templateLoading = false;
	let templateError: string | null = null;

	function insertDescAtCursor(before: string, after: string = '', placeholder: string = '') {
		if (!descTextarea) return;
		const el = descTextarea;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = character_desc.slice(start, end) || placeholder;
		const newText =
			character_desc.slice(0, start) + before + selected + after + character_desc.slice(end);
		character_desc = newText;
		setTimeout(() => {
			el.focus();
			const cursorStart = start + before.length;
			const cursorEnd = cursorStart + selected.length;
			el.setSelectionRange(cursorStart, cursorEnd);
		}, 0);
	}

	const DRAFT_KEY = 'calmcaf_character_create_draft';

	// Load draft from localStorage if present (browser only)
	onMount(() => {
		if (typeof localStorage === 'undefined') return;
		const draft = localStorage.getItem(DRAFT_KEY);
		if (draft) {
			try {
				const d = JSON.parse(draft);
				character_name = d.character_name ?? '';
				character_desc = d.character_desc ?? '';
				character_type = d.character_type ?? 'OC';
				date_of_birth = d.date_of_birth ?? '';
				character_avatar = d.character_avatar ?? '';
				art_links = d.art_links ?? '';
				gender = d.gender ?? 'NB';
				pronouns = d.pronouns ?? '';
			} catch {}
		}
	});

	// Save draft to localStorage on change (browser only)
	$: saveDraft();
	function saveDraft() {
		if (typeof localStorage === 'undefined') return;
		const draft = {
			character_name,
			character_desc,
			character_type,
			date_of_birth,
			character_avatar,
			art_links,
			gender,
			pronouns
		};
		localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
	}

	const maxTags = 32;
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

	async function createCharacterHandler() {
		loading = true;
		error = null;
		const insertData: CharacterInsert = {
			creator: get(user)?.usr?.id || '',
			character_name,
			character_desc,
			character_type,
			date_of_birth,
			character_avatar,
			art_links: art_links
				? art_links
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: [],
			gender: gender || 'NB',
			pronouns,
			tags
		};
		try {
			const data = await createCharacter(insertData);
			if (typeof localStorage !== 'undefined') {
				localStorage.removeItem(DRAFT_KEY);
			}
			goto(`/characters/${data.id}`);
		} catch (err) {
			error = (err as Error).message;
		}
		loading = false;
	}

	async function openTemplateModal() {
		showTemplateModal = true;
		templateSearch = '';
		await searchTemplates();
	}

	async function searchTemplates() {
		templateLoading = true;
		templateError = null;
		try {
			const { data } = await fetchStoreContent({ limit: 50, offset: 0 });
			templateResults = (data || []).filter(
				(t) =>
					t.type === StoreContentType.TEMPLATE &&
					(t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
						t.description.toLowerCase().includes(templateSearch.toLowerCase()))
			);
		} catch (e) {
			templateError = e instanceof Error ? e.message : 'Failed to load templates.';
		} finally {
			templateLoading = false;
		}
	}

	function insertTemplateContent(content: string) {
		insertDescAtCursor(content, '', '');
		showTemplateModal = false;
	}
</script>

<h1>Create New Character</h1>

<div class="create-character-layout">
	<div class="create-character-form-col">
		<!-- Move the form here for side-by-side layout -->
		<form class="character-form" on:submit|preventDefault={createCharacterHandler}>
			<div>Name: <span class="required-indicator">*</span></div>
			<label>
				<input bind:value={character_name} required minlength="3" />
			</label>
			<label>
				<div>Description: <span class="required-indicator">*</span></div>
				<MarkdownToolbar
					on:insert={(e) =>
						insertDescAtCursor(e.detail.before, e.detail.after, e.detail.placeholder)}
				/>
				<button type="button" class="browse-templates-btn" on:click={openTemplateModal}
					>Browse Templates</button
				>
				<textarea bind:this={descTextarea} bind:value={character_desc} required></textarea>
			</label>
			{#if showTemplateModal}
				<div class="template-modal-backdrop" on:click={() => (showTemplateModal = false)}></div>
				<div class="template-modal">
					<div class="template-modal-header">
						<span>Browse Templates</span>
						<button class="close-modal-btn" on:click={() => (showTemplateModal = false)}
							>&times;</button
						>
					</div>
					<input
						class="template-search-input"
						type="text"
						placeholder="Search templates..."
						bind:value={templateSearch}
						on:input={searchTemplates}
					/>
					{#if templateLoading}
						<div class="template-modal-status">Loading...</div>
					{:else if templateError}
						<div class="template-modal-status error">{templateError}</div>
					{:else if templateResults.length === 0}
						<div class="template-modal-status">No templates found.</div>
					{:else}
						<ul class="template-modal-list">
							{#each templateResults as t}
								<li class="template-modal-item">
									<div class="template-modal-name">{t.name}</div>
									<div class="template-modal-desc">{t.description}</div>
									<pre class="template-modal-preview">{t.content.slice(0, 200)}{t.content.length >
										200
											? '...'
											: ''}</pre>
									<div class="template-modal-actions">
										<button
											class="insert-template-btn"
											on:click={() => insertTemplateContent(t.content)}>Insert</button
										>
										<a
											class="goto-templates-btn"
											href="/templates"
											target="_blank"
											title="Go to templates page">See all</a
										>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
			<label>
				<div>Type: <span class="required-indicator">*</span></div>
				<select bind:value={character_type} required>
					<option value="OC">OC</option>
					<option value="SONA">SONA</option>
					<option value="FROM-MEDIA">Non-Original / Already Existing Character</option>
				</select>
			</label>
			<label>
				<div>Date of Birth: <span class="required-indicator">*</span></div>
				<DatePicker bind:value={date_of_birth}></DatePicker>
			</label>
			<label>
				Avatar URL:
				<input type="url" bind:value={character_avatar} />
			</label>
			<label>
				Art Links (comma separated URLs):
				<input bind:value={art_links} />
			</label>
			<label>
				Gender:
				<select bind:value={gender}>
					<option value="">Select gender</option>
					<option value="M">Male</option>
					<option value="F">Female</option>
					<option value="NB">Non-binary</option>
					<option value="I">Intersex</option>
				</select>
			</label>
			<label>
				Pronouns:
				<input
					type="text"
					bind:value={pronouns}
					maxlength="24"
					placeholder="e.g. she/her, they/them"
				/>
			</label>
			<label>
				<div>Tags:</div>
				<div class="tag-input-container">
					<input
						type="text"
						placeholder="Add tag and press Enter (max {maxTags})"
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
				{#if tagWarning}
					<div class="tag-warning">{tagWarning}</div>
				{/if}
			</label>
			<button type="submit" disabled={loading}>Create</button>
			{#if error}
				<p class="error">{error}</p>
			{/if}
		</form>
	</div>
	<div class="preview-section">
		<h2>Preview</h2>
		<div class="character-profile-layout preview-profile-layout">
			<div class="character-left-panel">
				<div class="character-info-card">
					{#if character_avatar}
						<img src={character_avatar} alt="Avatar" class="character-avatar" />
					{/if}
					<div class="info-fields">
						<div><strong>Name:</strong> {character_name}</div>
						<div><strong>Type:</strong> {character_type}</div>
						{#if date_of_birth}
							<div>
								<strong>Date of Birth:</strong>
								<DatePicker
									bind:value={date_of_birth}
									previewMode={true}
									previewColor={'var(--color-primary)'}
								></DatePicker>
							</div>
						{/if}
						{#if gender}
							<div><strong>Gender:</strong> {gender}</div>
						{/if}
						{#if pronouns}
							<div><strong>Pronouns:</strong> {pronouns}</div>
						{/if}
					</div>
					{#if character_desc}
						<div class="character-desc">
							<div class="desc-content">
								{@html coffeeMarkdown(character_desc, defaultStyles)}
							</div>
						</div>
					{/if}
				</div>
				{#if art_links.trim()}
					<div class="character-art">
						<h3>Art Gallery</h3>
						<div class="art-gallery">
							{#each art_links
								.split(',')
								.map((s) => s.trim())
								.filter(Boolean) as link}
								<a href={link} target="_blank" class="art-thumb-link">
									<img src={link} alt="Art" class="art-thumb" loading="lazy" />
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	h1 {
		text-align: center;
		margin-top: 2rem;
		margin-bottom: 2.5rem;
		font-size: 2rem;
		color: var(--color-primary);
	}

	.create-character-layout {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: center;
		gap: 1.7rem;
		margin-top: 2.5rem;
	}

	.create-character-form-col {
		flex: 2 1 0;
		max-width: 655px;
	}

	.character-form {
		max-width: 75%;
		min-width: 560px;
		margin: 0 auto;
		background: var(--color-card-bg);
		padding: 2rem 2.2rem 1.5rem 2.2rem;
		border-radius: 12px;
		box-shadow: 0 2px 12px var(--color-card-shadow);
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.character-form label {
		display: flex;
		flex-direction: column;
		font-weight: 500;
		color: var(--color-text);
		gap: 0.4rem;
	}

	.character-form input,
	.character-form select,
	.character-form textarea {
		padding: 0.5rem 0.9rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 1rem;
		background: var(--color-bg-alt);
		transition: border 0.2s;
	}

	.character-form input:focus,
	.character-form select:focus,
	.character-form textarea:focus {
		border-color: var(--color-accent);
		outline: none;
	}

	.character-form textarea {
		min-height: 80px;
		resize: vertical;
	}

	.character-form button[type='submit'] {
		margin-top: 1rem;
		background: var(--color-primary);
		color: var(--color-primary-alt);
		padding: 0.6rem 1.2rem;
		border-radius: 6px;
		font-size: 1.08rem;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
	}

	.character-form button[type='submit']:hover:enabled {
		background: var(--color-accent);
	}

	.character-form button[type='submit']:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.error {
		color: var(--color-danger);
		font-weight: 500;
		margin-top: 0.5rem;
		text-align: center;
	}

	.required-indicator {
		color: var(--color-danger);
		margin-left: 0.2em;
		font-size: 1.1em;
		font-weight: bold;
		vertical-align: middle;
	}

	.preview-section {
		flex: 1 1 0;
		background: var(--color-bg-alt);
		border-radius: 12px;
		box-shadow: 0 2px 12px var(--color-card-shadow);
		padding: 2rem 1.5rem 1.5rem 1.5rem;
		margin-top: 0;
		max-width: 760px;
	}

	.preview-section h2 {
		font-size: 1.2rem;
		color: var(--color-link);
		margin-bottom: 1.2rem;
		text-align: center;
	}

	.character-left-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
		background: none;
		box-shadow: none;
		padding: 0;
	}

	.character-info-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--color-bg-alt);
		border-radius: 12px;
		box-shadow: 0 2px 12px var(--color-card-shadow);
		width: 100%;
	}

	.character-info-card .character-avatar {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid var(--color-border);
		background: var(--color-bg-hover);
		box-shadow: 0 2px 8px var(--color-card-shadow);
		margin-bottom: 0.7rem;
		margin-top: 0.07rem;
	}

	.info-fields {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		font-size: 1.05rem;
		color: var(--color-primary);
		background: var(--color-bg-hover);
		border-radius: 10px;
		padding: 1.1rem 1.2rem 1.1rem 1.2rem;
		box-shadow: 0 1px 4px var(--color-card-shadow);
	}
	.info-fields > div {
		padding: 0.4rem 0.2rem;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		align-items: center;
	}
	.info-fields > div:last-child {
		border-bottom: none;
	}
	.info-fields strong {
		min-width: 110px;
		font-weight: 600;
		color: var(--color-link);
		margin-right: 0.7rem;
		letter-spacing: 0.01em;
	}

	.character-desc {
		width: 100%;
		background: var(--color-bg-hover);
		border-radius: 8px;
		padding: 1rem;
		margin-top: 1.2rem;
		color: var(--color-text);
		word-wrap: break-word;
	}

	.desc-content {
		margin-top: 0.3rem;
		font-size: 1.05rem;
		line-height: 1.6;
	}

	.character-art {
		width: 100%;
		margin-top: 1.2rem;
	}
	.character-art h3 {
		margin-bottom: 0.5rem;
		font-size: 1.1rem;
		color: var(--color-link);
	}
	.art-gallery {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		margin-top: 0.5rem;
	}
	.art-thumb-link {
		display: block;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 1px 6px var(--color-card-shadow);
		transition: box-shadow 0.15s;
		max-width: 120px;
		max-height: 120px;
	}
	.art-thumb-link:hover {
		box-shadow: 0 2px 12px var(--color-card-shadow);
	}
	.art-thumb {
		width: 120px;
		height: 120px;
		object-fit: cover;
		display: block;
		background: var(--color-bg-alt);
	}

	/* Make preview visually distinct */
	.preview-section .character-info-card {
		box-shadow: 0 1px 8px var(--color-card-shadow);
	}

	@media (max-width: 1100px) {
		.create-character-layout {
			flex-direction: column;
			gap: 1.5rem;
			padding: 0;
			max-width: 100%;
			margin: 0;
		}
		.create-character-form-col {
			max-width: 100%;
			width: 100%;
			margin: 0;
		}
		.character-form {
			max-width: 100%;
			width: 100%;
			margin: 0;
			box-sizing: border-box;
		}
		.preview-section {
			max-width: 100%;
			width: 100%;
			margin-top: 1.5rem;
			padding: 1.5rem 0;
			box-sizing: border-box;
		}

		.character-left-panel {
			max-width: 100%;
			margin: 0;
			width: 100%;
			box-sizing: border-box;
		}
		.character-info-card {
			width: 100%;
			box-sizing: border-box;
			padding: 1.5rem 0;
		}
	}

	@media (max-width: 900px) {
		.character-profile-layout,
		.preview-profile-layout {
			flex-direction: column;
			align-items: stretch;
		}
		.character-left-panel {
			max-width: 100%;
			min-width: 0;
			margin: 0 auto;
		}
		.art-gallery {
			justify-content: flex-start;
		}
	}

	@media (max-width: 768px) {
		h1 {
			margin-top: 1.5rem;
			margin-bottom: 1.5rem;
			font-size: 1.75rem;
		}

		.create-character-layout {
			margin-top: 1.5rem;
			padding: 0;
		}

		.create-character-form-col {
			max-width: 100%;
			width: 100%;
		}

		.character-form {
			max-width: 100%;
			width: 100%;
			padding: 1.5rem 0.5rem;
			border-radius: 8px;
			box-sizing: border-box;
		}

		.preview-section {
			max-width: 100%;
			padding: 1.5rem 0.5rem;
			border-radius: 8px;
			box-sizing: border-box;
		}

		.character-info-card {
			padding: 1.5rem 0.5rem;
			box-sizing: border-box;
		}

		.info-fields {
			padding: 0.75rem;
			box-sizing: border-box;
		}

		.art-gallery {
			justify-content: center;
		}

		.art-thumb-link {
			max-width: 100px;
			max-height: 100px;
		}

		.art-thumb {
			width: 100px;
			height: 100px;
		}
	}

	@media (max-width: 480px) {
		h1 {
			font-size: 1.5rem;
			margin-top: 1rem;
			margin-bottom: 1rem;
		}

		.create-character-layout {
			margin-top: 1rem;
			padding: 0;
		}

		.character-form {
			padding: 1.2rem 0.25rem;
		}

		.preview-section {
			max-width: 100%;
			padding: 1.2rem 0.25rem;
		}

		.character-info-card {
			padding: 1.2rem 0.25rem;
		}

		.info-fields {
			padding: 0.5rem;
			font-size: 0.95rem;
		}

		.info-fields strong {
			min-width: 90px;
		}

		.desc-content {
			font-size: 0.95rem;
		}

		.art-gallery {
			gap: 0.5rem;
		}

		.art-thumb-link {
			max-width: 90px;
			max-height: 90px;
		}

		.art-thumb {
			width: 90px;
			height: 90px;
		}
	}

	.error {
		color: var(--color-error);
	}
	.tag-warning {
		color: var(--color-character-tag-warning, var(--color-warning, #bfa007));
	}
	.add-tag-btn {
		background: var(--color-character-add-tag-bg, var(--color-accent));
		color: var(--color-character-add-tag-text, #fff);
		border: none;
		border-radius: 5px;
		padding: 0.35em 1em;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
	}
	.add-tag-btn:disabled {
		background: var(--color-character-add-tag-disabled-bg, var(--color-border));
		color: var(--color-character-add-tag-disabled-text, var(--color-secondary));
		cursor: not-allowed;
	}
	.add-tag-btn:hover:not(:disabled) {
		background: var(--color-character-add-tag-hover-bg, var(--color-primary));
	}
	.tag {
		background: var(--color-character-tag-bg, var(--color-section-bg));
		color: var(--color-character-tag-text, var(--color-accent));
		font-size: 0.97em;
		padding: 0.18em 0.7em;
		border-radius: 999px;
		font-weight: 500;
		letter-spacing: 0.01em;
		border: 1px solid var(--color-character-tag-border, var(--color-border));
		display: flex;
		align-items: center;
	}
	.remove-tag-btn {
		background: none;
		border: none;
		color: var(--color-character-remove-tag, var(--color-accent));
		font-size: 1.1em;
		margin-left: 0.3em;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}
	.remove-tag-btn:hover {
		color: var(--color-character-remove-tag-hover, var(--color-danger));
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
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
		margin-top: 0.2em;
	}
	.browse-templates-btn {
		margin: 0.5em 0 0.5em 0;
		background: var(--color-btn-primary, #4f46e5);
		color: var(--color-btn-primary-text, #fff);
		border: none;
		border-radius: 4px;
		padding: 0.4em 1.2em;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}
	.browse-templates-btn:hover {
		background: var(--color-btn-primary-hover, #3730a3);
	}
	.template-modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 1000;
	}
	.template-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--color-block-bg, #fff);
		border-radius: 10px;
		box-shadow: 0 2px 16px var(--color-card-shadow, rgba(0, 0, 0, 0.18));
		padding: 2em 2em 1.5em 2em;
		z-index: 1001;
		min-width: 340px;
		max-width: 95vw;
		max-height: 80vh;
		overflow-y: auto;
	}
	.template-modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 1.2em;
		font-weight: 600;
		margin-bottom: 1em;
	}
	.close-modal-btn {
		background: none;
		border: none;
		font-size: 1.5em;
		color: var(--color-danger, #dc2626);
		cursor: pointer;
		margin-left: 1em;
	}
	.template-search-input {
		width: 100%;
		padding: 0.5em;
		border-radius: 4px;
		border: 1px solid var(--color-border, #e0d7ce);
		margin-bottom: 1em;
		font-size: 1em;
	}
	.template-modal-status {
		color: var(--color-muted, #888);
		margin: 1em 0;
	}
	.template-modal-status.error {
		color: var(--color-error, #c00);
	}
	.template-modal-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.template-modal-item {
		border-bottom: 1px solid var(--color-border, #e0d7ce);
		padding-bottom: 1em;
		margin-bottom: 1em;
	}
	.template-modal-name {
		font-weight: 600;
		color: var(--color-primary, #4b2e19);
		font-size: 1.1em;
	}
	.template-modal-desc {
		color: var(--color-muted, #888);
		font-size: 0.97em;
		margin-bottom: 0.5em;
	}
	.template-modal-preview {
		background: var(--color-block-bg, #fff);
		padding: 0.7em;
		border-radius: 4px;
		font-size: 0.95em;
		overflow-x: auto;
		margin-bottom: 0.5em;
		box-shadow: 0 1px 2px var(--color-block-shadow, rgba(0, 0, 0, 0.03));
		max-height: 7em;
	}
	.insert-template-btn {
		background: var(--color-btn-primary, #4f46e5);
		color: var(--color-btn-primary-text, #fff);
		border: none;
		border-radius: 4px;
		padding: 0.3em 1em;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}
	.insert-template-btn:hover {
		background: var(--color-btn-primary-hover, #3730a3);
	}
	.template-modal-actions {
		display: flex;
		gap: 0.5em;
		align-items: center;
		margin-top: 0.2em;
	}
	.goto-templates-btn {
		font-size: 0.92em;
		color: var(--color-muted, #888);
		background: var(--color-block-btn-bg, #e0e7ff);
		border-radius: 4px;
		padding: 0.2em 0.7em;
		text-decoration: none;
		border: none;
		opacity: 0.7;
		transition:
			background 0.2s,
			color 0.2s,
			opacity 0.2s;
		margin-left: 0.2em;
	}
	.goto-templates-btn:hover {
		background: var(--color-block-btn-hover, #c7d2fe);
		color: var(--color-link-hover, #3730a3);
		opacity: 1;
	}
</style>
