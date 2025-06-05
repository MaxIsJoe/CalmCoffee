<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import type { Database } from '$lib/types/database.types';

	let title = '';
	let description = '';
	let age_rating: Database['public']['Enums']['AgeRating'] = 'Everyone';
	let error = '';
	let loading = false;
	let tags: string[] = [];
	let tagInput = '';
	const maxTags = 6;
	let tagWarning = '';

	async function createProject() {
		error = '';
		loading = true;
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			error = 'You must be logged in to create a project.';
			loading = false;
			return;
		}
		const { data, error: insertError } = await supabase
			.from('stories')
			.insert({
				title,
				description,
				age_rating,
				user_id: user.id,
				tags
			})
			.select()
			.single();
		if (insertError) {
			error = insertError.message;
			loading = false;
			return;
		}
		goto(`/create/edit/${data.id}`);
		loading = false;
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

	function removeTag(idx: number) {
		tags = tags.filter((_, i) => i !== idx);
		tagWarning = '';
	}

	function handleTagInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addTag();
		}
	}
</script>

<h2>Create New Project</h2>
<form on:submit|preventDefault={createProject}>
	<label>Title</label>
	<input type="text" bind:value={title} required maxlength="100" />
	<label>Description</label>
	<textarea bind:value={description} maxlength="500"></textarea>
	<label>Age Rating</label>
	<select bind:value={age_rating}>
		<option value="Everyone">Everyone</option>
		<option value="Teens">Teens</option>
		<option value="Mature">Mature</option>
		<option value="Adult">Adult</option>
	</select>
	<label>Tags</label>
	<div class="tags-input">
		<input
			type="text"
			bind:value={tagInput}
			placeholder="Add a tag and press Enter (max 6)"
			maxlength="30"
			on:keydown={handleTagInputKeydown}
			disabled={tags.length >= maxTags}
		/>
		<button type="button" on:click={addTag} disabled={tags.length >= maxTags || !tagInput.trim()}
			>Add</button
		>
		<div class="tag-list">
			{#each tags as tag, i}
				<span class="tag"
					>{tag}
					<button type="button" on:click={() => removeTag(i)} aria-label="Remove tag"
						>&times;</button
					>
				</span>
			{/each}
		</div>
		{#if tagWarning}
			<p class="tag-warning">{tagWarning}</p>
		{/if}
	</div>
	<button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</button>
	{#if error}<p style="color:red">{error}</p>{/if}
</form>

<style>
	h2 {
		text-align: center;
		margin-top: 2rem;
		color: #4b2e19;
	}
	form {
		background: #fff;
		border-radius: 10px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		max-width: 500px;
		margin: 2.5rem auto;
		padding: 2rem 2.5rem 1.5rem 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}
	label {
		font-weight: 600;
		color: #6d4c41;
		margin-bottom: 0.2rem;
	}
	input[type='text'],
	textarea,
	select {
		border: 1px solid #bca18c;
		border-radius: 5px;
		padding: 0.7rem 1rem;
		font-size: 1rem;
		background: #f9f6f3;
		color: #3e2723;
		margin-bottom: 0.2rem;
	}
	input[type='text']:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: #a1887f;
		background: #fff;
	}
	textarea {
		min-height: 80px;
		resize: vertical;
	}
	button[type='submit'] {
		background: #a1887f;
		color: #fff;
		border: none;
		border-radius: 5px;
		padding: 0.7rem 1.5rem;
		font-size: 1.1rem;
		font-weight: 600;
		margin-top: 0.7rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	button[type='submit']:hover:not(:disabled) {
		background: #6d4c41;
	}
	p[style*='color:red'] {
		text-align: center;
		font-weight: bold;
		margin-top: 1rem;
	}
	.tags-input {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.tags-input input[type='text'] {
		width: 100%;
	}
	.tags-input button[type='button'] {
		background: #a1887f;
		color: #fff;
		border: none;
		border-radius: 5px;
		padding: 0.35em 1em;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
		margin-top: 0.2em;
		align-self: flex-start;
	}
	.tags-input button[type='button']:disabled {
		background: #e0d7ce;
		color: #bfa07a;
		cursor: not-allowed;
	}
	.tags-input button[type='button']:hover:not(:disabled) {
		background: #6d4c41;
	}
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.tag {
		background: #e0cfc2;
		color: #4b2e19;
		border-radius: 16px;
		padding: 0.3rem 0.9rem 0.3rem 0.8rem;
		display: flex;
		align-items: center;
		font-size: 0.98rem;
	}
	.tag button {
		background: none;
		border: none;
		color: #a1887f;
		font-size: 1.1rem;
		margin-left: 0.3rem;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}
	.tag button:hover {
		color: #6d4c41;
	}
	.tag-warning {
		color: #bfa007;
		font-size: 0.98em;
		margin-top: 0.2em;
	}
</style>
