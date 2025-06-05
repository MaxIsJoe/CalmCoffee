<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { Database } from '$lib/types/database.types';
	import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';

	let story: Database['public']['Tables']['stories']['Row'] | null = null;
	let chapters: Database['public']['Tables']['chapters']['Row'][] = [];
	let error = '';
	let loading = true;
	let newChapterTitle = '';

	let storyId = '';
	$: storyId = $page.params.id;

	let loadingStep = 0;

	onMount(async () => {
		loadingStep = 1; // Authenticating user
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			error = 'You must be logged in.';
			loading = false;
			return;
		}
		loadingStep = 2; // Fetching story
		const { data: storyData, error: storyError } = await supabase
			.from('stories')
			.select('*')
			.eq('id', storyId)
			.eq('user_id', user.id)
			.single();
		if (storyError || !storyData) {
			error = 'Story not found.';
			loading = false;
			return;
		}
		story = storyData;
		loadingStep = 3; // Fetching chapters
		const { data: chapterData, error: chapterError } = await supabase
			.from('chapters')
			.select('*')
			.eq('story_id', storyId)
			.order('created_at', { ascending: true });
		if (chapterError) {
			error = chapterError.message;
		} else {
			chapters = chapterData || [];
		}
		loading = false;
	});

	async function addChapter() {
		if (!newChapterTitle.trim()) return;
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			error = 'You must be logged in.';
			return;
		}
		// Double check story ownership before insert
		const { data: storyData, error: storyError } = await supabase
			.from('stories')
			.select('id')
			.eq('id', storyId)
			.eq('user_id', user.id)
			.single();
		if (storyError || !storyData) {
			error = 'You do not own this story.';
			return;
		}
		const { data, error: insertError } = await supabase
			.from('chapters')
			.insert({ title: newChapterTitle, story_id: storyId, user_id: user.id })
			.select()
			.single();
		if (insertError) {
			error = insertError.message;
			return;
		}
		chapters = [...chapters, data];
		newChapterTitle = '';
	}

	function editChapter(chapterId: string) {
		goto(`/create/edit/${storyId}/chapter/${chapterId}`);
	}

	let editingDescription = false;
	let editedDescription = '';

	function startEditDescription() {
		editedDescription = story?.description || '';
		editingDescription = true;
	}

	async function saveDescription() {
		if (!story) return;
		const { error: updateError } = await supabase
			.from('stories')
			.update({ description: editedDescription })
			.eq('id', story.id);
		if (updateError) {
			error = updateError.message;
			return;
		}
		story = { ...story, description: editedDescription };
		editingDescription = false;
	}
</script>

{#if loading}
	<div class="loading-container">
		<div class="loader"></div>
		<div class="loading-steps">
			<p class:active={loadingStep >= 1}>1. Authenticating user...</p>
			<p class:active={loadingStep >= 2}>2. Fetching project...</p>
			<p class:active={loadingStep >= 3}>3. Fetching chapters...</p>
		</div>
	</div>
{:else if error}
	<p style="color:red">{error}</p>
{:else if !story}
	<p>Story not found.</p>
{:else}
	<h2>Edit Project: {story.title}</h2>
	{#if editingDescription}
		<div class="edit-description-box">
			<textarea bind:value={editedDescription} rows="4" class="edit-description-textarea"
			></textarea>
			<div class="edit-description-actions">
				<button on:click={saveDescription}>Save</button>
				<button on:click={() => (editingDescription = false)}>Cancel</button>
			</div>
		</div>
	{:else}
		<p>
			{@html coffeeMarkdown(story.description, defaultStyles)}
			<button class="edit-desc-btn" on:click={startEditDescription}>Edit Description</button>
		</p>
	{/if}
	<h3>Chapters</h3>
	<ul>
		{#each chapters as chapter}
			<li>
				<strong>{chapter.title}</strong>
				<button on:click={() => editChapter(chapter.id)}>Edit Blocks</button>
			</li>
		{/each}
	</ul>
	<div class="add-chapter">
		<input type="text" bind:value={newChapterTitle} placeholder="New chapter title" />
		<button on:click={addChapter}>Add Chapter</button>
	</div>
{/if}

<style>
	/* filepath: f:\projects\websites\CalmCaf\calm-coffee\src\routes\create\edit\[id]\+page.svelte */
	h2 {
		text-align: center;
		margin-top: 2rem;
		color: #4b2e19;
	}
	h3 {
		color: #6d4c41;
		margin-top: 2rem;
		margin-bottom: 1rem;
		text-align: center;
	}
	ul {
		list-style: none;
		padding: 0;
		max-width: 600px;
		margin: 2rem auto 1rem auto;
	}
	li {
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		padding: 1.2rem 1.5rem;
		margin-bottom: 1.2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	strong {
		font-size: 1.1rem;
		color: #3e2723;
	}
	button {
		background: #a1887f;
		color: #fff;
		border: none;
		border-radius: 4px;
		padding: 0.5rem 1.2rem;
		margin-left: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	button:hover {
		background: #6d4c41;
	}
	.add-chapter {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 2rem 0;
		gap: 1rem;
	}
	input[type='text'] {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		border: 1px solid #bca18c;
		background: #f5f5f5;
		font-size: 1rem;
	}
	p[style*='color:red'] {
		text-align: center;
		font-weight: bold;
	}
	p {
		text-align: center;
	}
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
	}
	.loader {
		border: 6px solid #f3e5e1;
		border-top: 6px solid #a1887f;
		border-radius: 50%;
		width: 48px;
		height: 48px;
		animation: spin 1s linear infinite;
		margin-bottom: 1.5rem;
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	.loading-steps {
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		padding: 1.2rem 2rem;
	}
	.loading-steps p {
		color: #bca18c;
		margin: 0.3rem 0;
		font-weight: 500;
		transition: color 0.2s;
	}
	.loading-steps p.active {
		color: #4b2e19;
		font-weight: bold;
	}
	.edit-description-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 1.2rem;
	}
	.edit-description-textarea {
		width: 100%;
		max-width: 600px;
		min-width: 200px;
		padding: 0.7rem 1rem;
		border-radius: 6px;
		border: 1px solid #bca18c;
		background: #f5f5f5;
		font-size: 1rem;
		margin-bottom: 0.7rem;
	}
	.edit-description-actions {
		display: flex;
		gap: 1rem;
	}
	.edit-desc-btn {
		background: #a1887f;
		color: #fff;
		border: none;
		border-radius: 4px;
		padding: 0.3rem 0.9rem;
		margin-left: 1rem;
		cursor: pointer;
		transition: background 0.2s;
		font-size: 0.97em;
	}
	.edit-desc-btn:hover {
		background: #6d4c41;
	}
</style>
