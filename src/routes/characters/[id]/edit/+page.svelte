<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import type { Database } from '../../../../../database.types';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';
	import { get } from 'svelte/store';
	import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';
	import MarkdownToolbar from '$lib/comp/markdown/MarkdownToolbar.svelte';
	import RelationshipGraphEditor from '$lib/comp/characters/RelationshipGraphEditor.svelte';

	type Character = Database['public']['Tables']['characters']['Row'];

	let id: string = '';
	let character: Character | null = null;
	let loading = true;
	let error: string | null = null;
	let saving = false;
	let saveError: string | null = null;

	let character_name = '';
	let character_avatar = '';
	let character_type = '';
	let character_desc = '';
	let date_of_birth = '';
	let art_links: string = '';

	let descTextarea: HTMLTextAreaElement | null = null;

	let relationships: any = null;
	let relationshipsJson: string = '';
	let relationshipsChanged = false;

	interface RelationshipGraph {
		nodes: { id: string; label: string; type: string }[];
	}

	let gender: Database['public']['Enums']['GENDER'] | '' = '';
	let pronouns: string = '';

	let tagInput = '';
	let tags: string[] = [];
	let tagWarning = '';
	const maxTags = 6;

	onMount(async () => {
		id = $page.params.id;
		const { data, error: err } = await supabase
			.from('characters')
			.select('*')
			.eq('id', id)
			.single();

		if (err || !data) {
			error = err?.message ?? 'Character not found.';
			loading = false;
			return;
		}
		character = data;
		if (!character) {
			error = 'Character not found.';
			loading = false;
			return;
		}
		character_name = character.character_name ?? '';
		character_avatar = character.character_avatar ?? '';
		character_type = character.character_type ?? '';
		character_desc = character.character_desc ?? '';
		date_of_birth = character.date_of_birth ?? '';
		art_links = (character.art_links ?? []).join('\n');
		gender = character.gender ?? '';
		pronouns = character.pronouns ?? '';
		tags = Array.isArray(character.tags) ? [...character.tags] : [];
		relationships = character.relations
			? JSON.parse(character.relations.toLocaleString())
			: { categories: {}, nodes: [] };
		relationshipsJson = character.relations?.toLocaleString() ?? '';
		loading = false;
	});

	function insertAtCursor(before: string, after: string = '', placeholder = '') {
		if (!descTextarea) return;
		const start = descTextarea.selectionStart;
		const end = descTextarea.selectionEnd;
		const value = descTextarea.value;
		const selected = value.slice(start, end) || placeholder;
		const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
		character_desc = newValue;
		// Move cursor inside the inserted text
		setTimeout(() => {
			const pos = start + before.length + selected.length + after.length;
			descTextarea?.focus();
			descTextarea?.setSelectionRange(pos, pos);
		}, 0);
	}

	function onRelationshipsChange(newGraph: RelationshipGraph) {
		relationships = newGraph;
		relationshipsJson = JSON.stringify(newGraph);
		console.log('Relationships changed:', relationshipsJson);
		relationshipsChanged = true;
	}

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

	async function save() {
		saving = true;
		saveError = null;
		const currentUser = get(user);
		if (!currentUser || character?.creator !== currentUser.usr?.id) {
			saveError = 'You are not allowed to edit this character.';
			saving = false;
			return;
		}
		const { error: updateError } = await supabase
			.from('characters')
			.update({
				character_name,
				character_avatar,
				character_type,
				character_desc,
				date_of_birth,
				gender: gender || null,
				pronouns,
				art_links: art_links
					.split('\n')
					.map((s) => s.trim())
					.filter(Boolean),
				relations: relationships ? JSON.stringify(relationships) : null,
				tags
			})
			.eq('id', id);

		if (updateError) {
			saveError = updateError.message;
		} else {
			goto(`/characters/${id}`);
		}
		saving = false;
	}

	async function deleteCharacter() {
		if (!confirm('Are you sure you want to delete this character? This cannot be undone.')) return;
		saving = true;
		saveError = null;
		const currentUser = get(user);
		if (!currentUser || character?.creator !== currentUser.usr?.id) {
			saveError = 'You are not allowed to delete this character.';
			saving = false;
			return;
		}
		const { error: deleteError } = await supabase.from('characters').delete().eq('id', id);
		if (deleteError) {
			saveError = deleteError.message;
		} else {
			goto('/characters');
		}
		saving = false;
	}
</script>

{#if loading}
	<p class="muted">Loading...</p>
{:else if error}
	<p class="error">{error}</p>
{:else}
	<div class="edit-character-main">
		<div class="edit-character-container">
			<h1>Edit Character</h1>
			<form on:submit|preventDefault={save} class="edit-character-form">
				<label>
					Name:
					<input type="text" bind:value={character_name} maxlength="100" required />
				</label>
				<label>
					Avatar URL:
					<input type="url" bind:value={character_avatar} maxlength="400" />
				</label>
				<label>
					Type:
					<select bind:value={character_type} required>
						<option value="">Select type</option>
						<option value="OC">OC</option>
						<option value="SONA">SONA</option>
						<option value="FROM-MEDIA">Not Your Original Work</option>
					</select>
				</label>
				<label>
					Date of Birth:
					<input type="date" bind:value={date_of_birth} />
				</label>
				<label>
					Description:
					<MarkdownToolbar
						on:insert={(e) => insertAtCursor(e.detail.before, e.detail.after, e.detail.placeholder)}
					/>
					<textarea bind:this={descTextarea} bind:value={character_desc} rows="5"></textarea>
				</label>
				<label>
					Art Links (one per line):
					<textarea bind:value={art_links} rows="3"></textarea>
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
						maxlength="40"
						placeholder="e.g. she/her, they/them"
					/>
				</label>
				<label>
					Tags:
					<div class="tag-input-container">
						<input
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
					{#if tagWarning}
						<div class="tag-warning">{tagWarning}</div>
					{/if}
				</label>
				{#if saveError}
					<p class="error">{saveError}</p>
				{/if}
				<div class="actions">
					<button type="submit" class="btn-primary" disabled={saving}>
						{saving ? 'Saving...' : 'Save'}
					</button>
					<a href={`/characters/${id}`} class="btn-secondary">Cancel</a>
					<button
						type="button"
						class="btn-danger"
						on:click={deleteCharacter}
						disabled={saving}
						style="margin-left:auto"
					>
						Delete Character
					</button>
				</div>
			</form>
			<RelationshipGraphEditor
				bind:graph={relationships}
				{character}
				owner={character?.creator === $user?.usr?.id}
				on:change={(e) => onRelationshipsChange(e.detail)}
			/>
		</div>
		<div class="preview-section">
			<h2>Preview</h2>
			<div class="character-profile">
				{#if character_avatar}
					<img src={character_avatar} alt="Avatar" class="character-avatar" />
				{/if}
				<div class="character-details">
					<h1 class="character-name">{character_name}</h1>
					<div class="character-meta">
						<span class="character-type">{character_type}</span>
						{#if date_of_birth}
							<span class="character-dob">DOB: {date_of_birth}</span>
						{/if}
					</div>
					{#if character_desc}
						<div class="character-desc">
							<strong>Description:</strong>
							<div class="desc-content">
								{@html coffeeMarkdown(character_desc, defaultStyles)}
							</div>
						</div>
					{/if}
					{#if art_links.trim()}
						<div class="character-art">
							<h3>Art Links</h3>
							<ul>
								{#each art_links
									.split('\n')
									.map((s) => s.trim())
									.filter(Boolean) as link}
									<li><a href={link} target="_blank">{link}</a></li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.edit-character-main {
		display: flex;
		gap: 2.5rem;
		align-items: flex-start;
		justify-content: center;
	}
	.edit-character-container {
		width: 70%;
		margin: 2rem 0;
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(30, 34, 54, 0.07);
		padding: 2rem 2rem 1.5rem 2rem;
	}
	h1 {
		font-size: 1.4rem;
		margin-bottom: 1.2rem;
		color: #4b4f6b;
		text-align: center;
	}
	.edit-character-form {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}
	.edit-character-form label {
		display: flex;
		flex-direction: column;
		font-weight: 500;
		color: #353857;
		gap: 0.3rem;
	}
	.edit-character-form input[type='text'],
	.edit-character-form input[type='url'],
	.edit-character-form input[type='date'],
	.edit-character-form select,
	.edit-character-form textarea {
		padding: 0.5rem 0.9rem;
		border: 1px solid #d3d6db;
		border-radius: 6px;
		font-size: 1rem;
		background: #fafbfc;
		transition: border 0.2s;
	}
	.edit-character-form input:focus,
	.edit-character-form select:focus,
	.edit-character-form textarea:focus {
		border-color: #a3a8b8;
		outline: none;
	}
	.edit-character-form textarea {
		min-height: 80px;
		resize: vertical;
	}
	.edit-character-form .actions {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-top: 0.5rem;
	}
	.edit-character-form .btn-primary {
		background: #4f46e5;
		color: #fff;
		padding: 0.5rem 1.2rem;
		border-radius: 6px;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
	}
	.edit-character-form .btn-primary:disabled {
		background: #a5b4fc;
		cursor: not-allowed;
	}
	.edit-character-form .btn-primary:hover:enabled {
		background: #3730a3;
	}
	.edit-character-form .btn-secondary {
		background: #f3f4f6;
		color: #3730a3;
		padding: 0.5rem 1.2rem;
		border-radius: 6px;
		font-weight: 500;
		text-decoration: none;
		border: none;
		transition: background 0.2s;
	}
	.edit-character-form .btn-secondary:hover {
		background: #e0e7ff;
	}
	.edit-character-form .btn-danger {
		background: #e53e3e;
		color: #fff;
		padding: 0.5rem 1.2rem;
		border-radius: 6px;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
	}
	.edit-character-form .btn-danger:disabled {
		background: #fca5a5;
		cursor: not-allowed;
	}
	.edit-character-form .btn-danger:hover:enabled {
		background: #b91c1c;
	}
	.error {
		color: #c00;
		font-weight: 500;
		margin: 0.5rem 0 0 0;
		text-align: center;
	}
	.muted {
		color: #888;
		font-size: 1rem;
		margin: 2rem 0;
		text-align: center;
	}
	.preview-section {
		width: 380px;
		min-width: 280px;
		max-width: 420px;
		margin-top: 2rem;
	}
	.preview-section h2 {
		font-size: 1.1rem;
		color: #4b4f6b;
		margin-bottom: 1rem;
	}
	.character-profile {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(30, 34, 54, 0.07);
		padding: 2rem 1.5rem;
		max-width: 420px;
		margin: 0 auto;
		gap: 1.5rem;
	}
	.character-avatar {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #e5e7eb;
		background: #f6f7fa;
		box-shadow: 0 2px 8px rgba(30, 34, 54, 0.09);
	}
	.character-details {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
	}
	.character-name {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		color: #353857;
		text-align: center;
	}
	.character-meta {
		display: flex;
		gap: 1.2rem;
		font-size: 1.05rem;
		color: #6b7280;
		justify-content: center;
	}
	.character-type {
		background: #f3f4f6;
		border-radius: 4px;
		padding: 0.1rem 0.7rem;
		font-weight: 500;
	}
	.character-dob {
		background: #f3f4f6;
		border-radius: 4px;
		padding: 0.1rem 0.7rem;
	}
	.character-desc {
		width: 100%;
		background: #f7f7fa;
		border-radius: 8px;
		padding: 1rem;
		margin-top: 0.5rem;
		color: #444;
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
		color: #4b4f6b;
	}
	.character-art ul {
		list-style: disc inside;
		padding-left: 1.2rem;
		margin: 0;
	}
	.character-art li {
		margin-bottom: 0.3rem;
	}
	.character-art a {
		color: #6c63ff;
		text-decoration: underline;
		word-break: break-all;
	}
	.character-art a:hover {
		color: #554fd8;
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
		margin-top: 0.2em;
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
	.tag-warning {
		color: #bfa007;
		margin-top: 0.3em;
		font-size: 0.98em;
	}
	@media (max-width: 900px) {
		.edit-character-main {
			flex-direction: column;
			gap: 1.5rem;
		}
		.preview-section {
			width: 100%;
			max-width: 100vw;
			margin-top: 1.5rem;
		}
		.character-profile {
			max-width: 100vw;
		}
	}
</style>
