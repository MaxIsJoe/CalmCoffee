<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';
	import { get } from 'svelte/store';
	import RelationshipGraphEditor from '$lib/comp/characters/RelationshipGraphEditor.svelte';
	import CharacterProfile from '$lib/comp/characters/CharacterProfile.svelte';
	import ZenMarkdownEditor from '$lib/comp/markdown/ZenMarkdownEditor.svelte';
	import ArtUploadButton from '$lib/comp/characters/ArtUploadButton.svelte';
	import { fetchCharacterById, updateCharacter, deleteCharacter } from '$lib/db/characters';
	import type { Character } from '$lib/db/characters';
	import type { Database } from '../../../../../database.types';
	import DatePicker from '$lib/comp/common/DatePicker.svelte';
	import { supabase } from '$lib/supabaseClient';

	let id: string = '';
	let character: Character | null = null;
	let loading = true;
	let error: string | null = null;
	let saving = false;
	let saveError: string | null = null;

	let character_name = '';
	let character_avatar = '';
	let character_type: 'OC' | 'SONA' | 'FROM-MEDIA' | undefined = 'OC';
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

	let avatarUploadError: string | null = null;
	let avatarUploading = false;
	let avatarFileInput: HTMLInputElement | null = null;

	onMount(async () => {
		id = $page.params.id;
		try {
			character = await fetchCharacterById(id);
			if (!character) {
				error = 'Character not found.';
				loading = false;
				return;
			}
			character_name = character.character_name ?? '';
			character_avatar = character.character_avatar ?? '';
			character_type =
				(character.character_type as 'OC' | 'SONA' | 'FROM-MEDIA' | undefined) ?? 'OC';
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
		} catch (err) {
			error = (err as Error).message;
		}
		loading = false;
	});

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

	function handleArtInsert(
		event: CustomEvent<{ before: string; after: string; placeholder: string }>
	) {
		const { placeholder } = event.detail;
		art_links = art_links ? `${art_links}\n${placeholder}` : placeholder;
	}

	async function handleAvatarUpload(event: Event) {
		const files = (event.target as HTMLInputElement).files;
		if (!files || files.length === 0) return;
		const file = files[0];
		avatarUploadError = null;
		avatarUploading = true;
		try {
			const fileExt = file.name.split('.').pop();
			const fileName = `${id}-avatar-${Date.now()}.${fileExt}`;
			const { data, error } = await supabase.storage.from('avatars').upload(fileName, file, {
				cacheControl: '3600',
				upsert: true
			});
			if (error) throw error;
			const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
			if (publicUrlData?.publicUrl) {
				character_avatar = publicUrlData.publicUrl;
			} else {
				avatarUploadError = 'Failed to get public URL.';
			}
		} catch (err) {
			avatarUploadError = (err as Error).message;
		}
		avatarUploading = false;
		if (avatarFileInput) avatarFileInput.value = '';
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
		try {
			await updateCharacter(id, {
				character_name,
				character_avatar,
				character_type,
				character_desc,
				date_of_birth,
				gender: gender || undefined,
				pronouns,
				art_links: art_links
					.split('\n')
					.map((s) => s.trim())
					.filter(Boolean),
				relations: relationships ? JSON.stringify(relationships) : null,
				tags
			});
			goto(`/characters/${id}`);
		} catch (err) {
			saveError = (err as Error).message;
		}
		saving = false;
	}

	async function deleteCharacterHandler() {
		if (!confirm('Are you sure you want to delete this character? This cannot be undone.')) return;
		saving = true;
		saveError = null;
		const currentUser = get(user);
		if (!currentUser || character?.creator !== currentUser.usr?.id) {
			saveError = 'You are not allowed to delete this character.';
			saving = false;
			return;
		}
		try {
			await deleteCharacter(id);
			goto('/characters');
		} catch (err) {
			saveError = (err as Error).message;
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
					Avatar:
					<div style="display: flex; align-items: center; gap: 1rem;">
						<input
							type="url"
							bind:value={character_avatar}
							maxlength="400"
							placeholder="Paste image URL..."
							style="flex:1 1 0;"
						/>
						<ArtUploadButton on:insert={(e) => (character_avatar = e.detail.placeholder)} />
					</div>
					{#if character_avatar}
						<img
							src={character_avatar}
							alt="Avatar preview"
							style="margin-top:0.5rem;max-width:96px;max-height:96px;border-radius:8px;border:1px solid var(--color-border);"
						/>
					{/if}
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
					<DatePicker bind:value={date_of_birth} />
				</label>
				<label>
					Description:
					<ZenMarkdownEditor
						maxLength={12480}
						showPreview={false}
						bind:value={character_desc}
						placeholder="Write your character's description here..."
					/>
				</label>
				<label>
					Art Links (one per line):
					<div class="art-upload-section">
						<div class="art-upload-header">
							<ArtUploadButton on:insert={handleArtInsert} />
							<span class="art-upload-hint"
								>- Upload or select already uploaded images on this account</span
							>
						</div>
						<textarea
							bind:value={art_links}
							rows="3"
							placeholder="Or paste image URLs here, one per line"
						></textarea>
					</div>
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
						on:click={deleteCharacterHandler}
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
	</div>
	<div class="preview-section">
		<h2>Preview</h2>
		{#if character}
			<CharacterProfile
				character={{
					...character,
					character_name,
					character_avatar,
					character_type: character_type as 'OC' | 'SONA' | 'FROM-MEDIA',
					character_desc,
					date_of_birth,
					gender: gender || 'NB',
					pronouns,
					art_links: art_links
						.split('\n')
						.map((s) => s.trim())
						.filter(Boolean),
					tags,
					created_at: character.created_at,
					creator: character.creator,
					id: character.id,
					relations: character.relations
				}}
				previewMode={true}
				showReactions={false}
				showRelationships={false}
				showTags={true}
			/>
		{/if}
	</div>
{/if}

<style>
	.edit-character-main {
		width: 100%;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 0 1rem;
		padding-bottom: 20px;
	}
	.edit-character-container {
		background: var(--color-card-bg);
		border-radius: 12px;
		box-shadow: 0 2px 12px var(--color-card-shadow);
		padding: 2rem;
		width: 100%;
		margin: 0 auto;
	}
	.preview-section {
		background: var(--color-card-bg);
		border-radius: 12px;
		box-shadow: 0 2px 12px var(--color-card-shadow);
		padding: 2rem;
		width: 100%;
	}
	.preview-section h2 {
		font-size: 1.4rem;
		margin-bottom: 1.2rem;
		color: var(--color-link);
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
		color: var(--color-text);
		gap: 0.3rem;
	}
	.edit-character-form input[type='text'],
	.edit-character-form input[type='url'],
	.edit-character-form input[type='date'],
	.edit-character-form select,
	.edit-character-form textarea {
		padding: 0.5rem 0.9rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 1rem;
		background: var(--color-bg-alt);
		color: var(--color-text);
		transition: border 0.2s;
		width: 100%;
	}
	.edit-character-form input:focus,
	.edit-character-form select:focus,
	.edit-character-form textarea:focus {
		border-color: var(--color-accent);
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
		background: var(--color-primary);
		color: var(--color-primary-alt);
		padding: 0.5rem 1.2rem;
		border-radius: 6px;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
	}
	.edit-character-form .btn-primary:disabled {
		background: var(--color-secondary);
		cursor: not-allowed;
	}
	.edit-character-form .btn-primary:hover:enabled {
		background: var(--color-accent);
	}
	.edit-character-form .btn-secondary {
		background: var(--color-bg-alt);
		color: var(--color-link);
		padding: 0.5rem 1.2rem;
		border-radius: 6px;
		font-weight: 500;
		text-decoration: none;
		border: none;
		transition: background 0.2s;
	}
	.edit-character-form .btn-secondary:hover {
		background: var(--color-link-hover);
	}
	.edit-character-form .btn-danger {
		background: var(--color-danger);
		color: var(--color-primary-alt);
		padding: 0.5rem 1.2rem;
		border-radius: 6px;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
		margin-left: auto;
	}
	.edit-character-form .btn-danger:disabled {
		background: var(--color-danger-hover);
		cursor: not-allowed;
	}
	.edit-character-form .btn-danger:hover:enabled {
		background: var(--color-danger-hover);
	}
	.error {
		color: var(--color-error);
		font-weight: 500;
		margin: 0.5rem 0 0 0;
		text-align: center;
	}
	.muted {
		color: var(--color-muted);
		font-size: 1rem;
		margin: 2rem 0;
		text-align: center;
	}
	.tag-input-container {
		display: flex;
		gap: 0.5em;
		margin-bottom: 0.4em;
		width: 100%;
	}
	.tag-input-container input[type='text'] {
		flex: 1;
		padding: 0.4em 0.7em;
		border-radius: 5px;
		border: 1px solid var(--color-border);
		font-size: 1em;
		background: var(--color-bg-alt);
		transition: border-color 0.15s;
	}
	.tag-input-container input[type='text']:focus {
		border-color: var(--color-link);
		outline: none;
	}
	.add-tag-btn {
		background: var(--color-accent);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 5px;
		padding: 0.35em 1em;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
		white-space: nowrap;
	}
	.add-tag-btn:disabled {
		background: var(--color-secondary);
		color: var(--color-link);
		cursor: not-allowed;
	}
	.add-tag-btn:hover:not(:disabled) {
		background: var(--color-primary);
	}
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
		margin-top: 0.2em;
		width: 100%;
	}
	.tag {
		background: var(--color-bg-hover);
		color: var(--color-accent);
		font-size: 0.97em;
		padding: 0.18em 0.7em;
		border-radius: 999px;
		font-weight: 500;
		letter-spacing: 0.01em;
		border: 1px solid var(--color-border);
		display: flex;
		align-items: center;
	}
	.remove-tag-btn {
		background: none;
		border: none;
		color: var(--color-accent);
		font-size: 1.1em;
		margin-left: 0.3em;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}
	.remove-tag-btn:hover {
		color: var(--color-character-remove-tag-hover, var(--color-danger));
	}
	.tag-warning {
		color: var(--color-character-tag-warning, var(--color-warning, #bfa007));
		margin-top: 0.3em;
		font-size: 0.98em;
	}
	.art-upload-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 0.5rem;
	}
	.art-upload-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.art-upload-hint {
		color: var(--color-character-art-hint, var(--color-secondary));
		font-size: 0.9rem;
	}
	.art-upload-section textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 0.9rem;
		background: var(--color-bg-alt);
		resize: vertical;
	}
	.art-upload-section textarea:focus {
		border-color: var(--color-accent);
		outline: none;
	}
	@media (max-width: 1200px) {
		.edit-character-main {
			padding: 0 0.5rem;
		}
		.edit-character-container,
		.preview-section {
			padding: 1.5rem;
		}
	}
	@media (max-width: 768px) {
		.edit-character-main {
			gap: 1rem;
			padding: 0 0.25rem;
		}
		.edit-character-container,
		.preview-section {
			padding: 1rem;
		}
		.edit-character-form {
			gap: 0.8rem;
		}
		.edit-character-form .actions {
			flex-direction: column;
			gap: 0.8rem;
		}
		.edit-character-form .btn-primary,
		.edit-character-form .btn-secondary,
		.edit-character-form .btn-danger {
			width: 100%;
			text-align: center;
			margin-left: 0 !important;
		}
	}
	@media (max-width: 480px) {
		.edit-character-main {
			gap: 0.8rem;
			padding: 0;
		}
		.edit-character-container,
		.preview-section {
			padding: 0.8rem;
			border-radius: 8px;
		}
		.edit-character-form {
			gap: 0.6rem;
		}
		.edit-character-form label {
			font-size: 0.9rem;
		}
		.edit-character-form input,
		.edit-character-form select,
		.edit-character-form textarea {
			padding: 0.3rem 0.6rem;
			font-size: 0.85rem;
		}
		.edit-character-form .btn-primary,
		.edit-character-form .btn-secondary,
		.edit-character-form .btn-danger {
			padding: 0.4rem 0.8rem;
			font-size: 0.9rem;
		}
	}
</style>
