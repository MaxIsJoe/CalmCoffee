<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { Database } from '../../../../../database.types';
	import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';

	let story: Database['public']['Tables']['stories']['Row'] | null = null;
	let chapters: Database['public']['Tables']['chapters']['Row'][] = [];
	let error = '';
	let loading = true;
	let newChapterTitle = '';

	let storyId = '';
	$: storyId = $page.params.id;

	let loadingStep = 0;
	let showDeleteConfirm = false;

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
	let editingTitle = false;
	let editedTitle = '';
	let editingShortDescription = false;
	let editedShortDescription = '';

	function startEditDescription() {
		editedDescription = story?.description || '';
		editingDescription = true;
	}

	function startEditTitle() {
		editedTitle = story?.title || '';
		editingTitle = true;
	}

	function startEditShortDescription() {
		editedShortDescription = story?.short_description || '';
		editingShortDescription = true;
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

	async function saveShortDescription() {
		if (!story) return;
		const { error: updateError } = await supabase
			.from('stories')
			.update({ short_description: editedShortDescription })
			.eq('id', story.id);
		if (updateError) {
			error = updateError.message;
			return;
		}
		story = { ...story, short_description: editedShortDescription };
		editingShortDescription = false;
	}

	async function saveTitle() {
		if (!story || !editedTitle.trim()) return;
		const { error: updateError } = await supabase
			.from('stories')
			.update({ title: editedTitle })
			.eq('id', story.id);
		if (updateError) {
			error = updateError.message;
			return;
		}
		story = { ...story, title: editedTitle };
		editingTitle = false;
	}

	async function togglePublishStatus() {
		if (!story) return;
		loading = true; // Show loading spinner
		loadingStep = 4; // Indicate publishing/unpublishing step
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;

		if (!user) {
			error = 'You must be logged in to change publish status.';
			loading = false;
			return;
		}

		// Verify user owns the story
		if (story.user_id !== user.id) {
			error = 'You do not have permission to modify this story.';
			loading = false;
			return;
		}

		const newPublishStatus = !story.is_published;
		const { error: updateError } = await supabase
			.from('stories')
			.update({ is_published: newPublishStatus })
			.eq('id', story.id)
			.eq('user_id', user.id); // Double-check ownership on update for security

		if (updateError) {
			error = updateError.message;
		} else {
			story = { ...story, is_published: newPublishStatus };
			error = ''; // Clear any previous error
		}
		loading = false;
	}

	async function deleteStory() {
		if (!story) return;
		loading = true;
		loadingStep = 5; // Indicate deletion step
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;

		if (!user) {
			error = 'You must be logged in to delete a story.';
			loading = false;
			return;
		}

		// Verify user owns the story
		if (story.user_id !== user.id) {
			error = 'You do not have permission to delete this story.';
			loading = false;
			return;
		}

		const { error: deleteError } = await supabase
			.from('stories')
			.delete()
			.eq('id', story.id)
			.eq('user_id', user.id); // Double-check ownership on delete for security

		if (deleteError) {
			error = deleteError.message;
			loading = false;
			return;
		}

		// Redirect to create page after successful deletion
		goto('/create');
	}
</script>

{#if loading}
	<div class="loading-container">
		<div class="loader"></div>
		<div class="loading-steps">
			<p class:active={loadingStep >= 1}>1. Authenticating user...</p>
			<p class:active={loadingStep >= 2}>2. Fetching project...</p>
			<p class:active={loadingStep >= 3}>3. Fetching chapters...</p>
			{#if loadingStep === 4}
				<p class:active={loadingStep === 4}>4. Updating publish status...</p>
			{/if}
			{#if loadingStep === 5}
				<p class:active={loadingStep === 5}>5. Deleting story...</p>
			{/if}
		</div>
	</div>
{:else if error}
	<p style="color:red">{error}</p>
{:else if !story}
	<p class="error-message">Story not found.</p>
{:else}
	<div class="main-content-wrapper">
		<div class="left-panel">
			<div class="panel-section">
				<div class="project-header">
					{#if editingTitle}
						<div class="edit-title-box">
							<input type="text" bind:value={editedTitle} class="edit-title-input" />
							<div class="edit-title-actions">
								<button on:click={saveTitle}>Save</button>
								<button on:click={() => (editingTitle = false)}>Cancel</button>
							</div>
						</div>
					{:else}
						<h2>{story.title}</h2>
					{/if}
					<div class="action-buttons">
						<button class="edit-title-btn" on:click={startEditTitle}>Edit Title</button>
						<button on:click={togglePublishStatus} class="publish-toggle-btn">
							{story.is_published ? 'Unpublish' : 'Publish'}
						</button>
						<button on:click={() => (showDeleteConfirm = true)} class="delete-btn">Delete Story</button>
					</div>
				</div>
			</div>

			<div class="panel-section">
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
					<p class="story-description">
						{@html coffeeMarkdown(story.description || '', defaultStyles)}
						<button class="edit-desc-btn" on:click={startEditDescription}>Edit Description</button>
					</p>
				{/if}
			</div>

			<div class="panel-section">
				{#if editingShortDescription}
					<div class="edit-description-box">
						<textarea 
							bind:value={editedShortDescription} 
							rows="2" 
							class="edit-description-textarea"
							placeholder="Enter a short description (will be shown in story listings)"
							maxlength="300"
						></textarea>
						<div class="edit-description-actions">
							<button on:click={saveShortDescription}>Save</button>
							<button on:click={() => (editingShortDescription = false)}>Cancel</button>
						</div>
					</div>
				{:else}
					<p class="story-description">
						<strong>Short Description:</strong><br>
						{@html coffeeMarkdown(story.short_description || '', defaultStyles)}
						<button class="edit-desc-btn" on:click={startEditShortDescription}>Edit Short Description</button>
					</p>
				{/if}
			</div>
		</div>

		<div class="right-panel">
			<div class="panel-section">
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
			</div>
		</div>
	</div>
{/if}

{#if showDeleteConfirm}
	<div class="modal-overlay" on:click={() => (showDeleteConfirm = false)}>
		<div class="modal-content" on:click|stopPropagation>
			<h3>Delete Story</h3>
			<p>Are you sure you want to delete "{story?.title}"? This action cannot be undone.</p>
			<div class="modal-actions">
				<button class="cancel-btn" on:click={() => (showDeleteConfirm = false)}>Cancel</button>
				<button class="confirm-delete-btn" on:click={deleteStory}>Delete Story</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.main-content-wrapper {
		max-width: 1200px; /* Increased max-width for two columns */
		margin: 2rem auto;
		padding: 1.5rem;
		background-color: #fff;
		border-radius: 12px;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

		display: grid;
		grid-template-columns: 1fr 1.5fr; /* Left panel smaller, right panel larger */
		gap: 2rem; /* Space between the two columns */
	}

	.left-panel,
	.right-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem; /* Space between sections within each panel */
	}

	.panel-section {
		background-color: #fcfcfc; /* Slightly different background for sections */
		padding: 1.5rem;
		border-radius: 10px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	/* Headings */
	h2 {
		font-size: 2.2rem;
		color: #4b2e19;
		margin-top: 0; /* Reset margins for flex/grid context */
		margin-bottom: 0;
		font-weight: 700;
		text-align: left; /* Align to the left of its panel */
	}

	h3 {
		font-size: 1.6rem;
		color: #6d4c41;
		margin-top: 0; /* Reset margins for flex/grid context */
		margin-bottom: 1rem;
		font-weight: 600;
		text-align: left; /* Align to the left of its panel */
	}

	/* Buttons */
	button {
		padding: 0.6rem 1.4rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
		transition: background-color 0.2s ease, transform 0.1s ease;
		white-space: nowrap; /* Prevent button text from wrapping */
	}

	button:hover {
		transform: translateY(-1px);
	}

	/* Specific Button Styles */
	.publish-toggle-btn {
		background-color: #a1887f;
		color: #fff;
	}

	.publish-toggle-btn:hover {
		background-color: #6d4c41;
	}

	.edit-desc-btn {
		background-color: #bca18c;
		color: #fff;
		padding: 0.4rem 1rem;
		font-size: 0.9rem;
		margin-left: 1rem;
	}

	.edit-desc-btn:hover {
		background-color: #a1887f;
	}

	.edit-description-actions button {
		background-color: #4b2e19;
		color: #fff;
	}

	.edit-description-actions button:hover {
		background-color: #3e2723;
	}

	.add-chapter button {
		background-color: #8d6e63; /* Same as chapter list button */
		color: #fff;
	}

	.add-chapter button:hover {
		background-color: #6d4c41;
	}


	/* Input Fields */
	input[type='text'],
	textarea {
		width: calc(100% - 2rem); /* Account for padding */
		padding: 0.8rem 1rem;
		border-radius: 8px;
		border: 1px solid #d4c2b8;
		background-color: #fcf8f5;
		font-size: 1rem;
		color: #3e2723;
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	input[type='text']:focus,
	textarea:focus {
		border-color: #a1887f;
		box-shadow: 0 0 0 3px rgba(161, 136, 127, 0.2);
		outline: none;
	}

	textarea {
		resize: vertical;
		min-height: 80px;
	}

	/* Text Elements */
	.error-message {
		color: #dc2626;
		text-align: center;
		font-weight: 600;
		margin-top: 1rem;
	}

	.story-description {
		color: #5d4037;
		font-size: 1.05rem;
		line-height: 1.6;
		text-align: left; /* Align to the left of its panel */
		padding: 0 0.5rem; /* Small internal padding */
	}

	/* Layout Sections */
	.project-header {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.edit-title-btn {
		background-color: #bca18c;
		color: #fff;
		padding: 0.6rem 1.4rem;
		font-size: 1rem;
	}

	.edit-title-btn:hover {
		background-color: #a1887f;
	}

	.edit-description-box {
		display: flex;
		flex-direction: column;
		align-items: flex-start; /* Align contents to the left */
		gap: 0.8rem;
	}

	.edit-description-actions {
		display: flex;
		gap: 1rem;
	}

	.add-chapter {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
		flex-wrap: wrap; /* Allow wrapping on small screens */
	}

	.add-chapter input {
		flex-grow: 1; /* Allow input to take available space */
	}

	/* Chapters List */
	ul {
		list-style: none;
		padding: 0;
		margin: 1.5rem 0; /* Adjust margin for panel context */
	}

	li {
		background-color: #fefcfb;
		border-radius: 10px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		padding: 1rem 1.5rem;
		margin-bottom: 0.8rem; /* Slightly less space between list items */
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	li:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	}

	strong {
		font-size: 1.15rem;
		color: #3e2723;
		font-weight: 600;
	}

	li button {
		background-color: #8d6e63;
		color: #fff;
	}

	li button:hover {
		background-color: #6d4c41;
	}


	/* Loading Screen - unchanged for the most part */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		background: none;
		box-shadow: none;
		padding: 0;
	}

	.loader {
		border: 6px solid #d4c2b8;
		border-top: 6px solid #a1887f;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		animation: spin 1s linear infinite;
		margin-bottom: 1.8rem;
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
		background-color: #fff;
		border-radius: 10px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
		padding: 1.5rem 2.5rem;
		text-align: left;
		min-width: 250px;
	}

	.loading-steps p {
		color: #bca18c;
		margin: 0.5rem 0;
		font-weight: 500;
		transition: color 0.3s ease;
		font-size: 1.05rem;
	}

	.loading-steps p.active {
		color: #4b2e19;
		font-weight: bold;
	}

	/* Responsive Adjustments */
	@media (max-width: 992px) {
		.main-content-wrapper {
			grid-template-columns: 1fr; /* Stack columns on smaller screens */
			gap: 1.5rem;
			padding: 1rem;
		}

		.left-panel,
		.right-panel {
			width: 100%;
			max-width: 600px; /* Constrain stacked panels */
			margin: 0 auto;
		}

		.project-header,
		.edit-description-box,
		.story-description,
		h2, h3 {
			align-items: center; /* Center align in stacked layout */
			text-align: center;
		}

		.story-description {
			padding: 0;
		}

		.add-chapter {
			justify-content: center; /* Center input/button */
		}
	}

	@media (max-width: 768px) {
		.main-content-wrapper {
			margin: 1rem auto;
			padding: 0.8rem;
		}

		h2 {
			font-size: 1.8rem;
		}

		h3 {
			font-size: 1.4rem;
		}

		li {
			flex-direction: column; /* Stack chapter title and button */
			align-items: flex-start;
			gap: 0.7rem;
			padding: 1rem;
		}

		li button {
			margin-left: 0;
			width: 100%; /* Full width buttons in list */
		}

		.action-buttons {
			flex-direction: column;
			width: 100%;
		}

		.action-buttons button {
			width: 100%;
		}
	}

	@media (max-width: 480px) {
		h2 {
			font-size: 1.6rem;
		}

		h3 {
			font-size: 1.2rem;
		}

		input[type='text'],
		textarea {
			padding: 0.6rem 0.8rem;
			font-size: 0.95rem;
		}

		button {
			padding: 0.5rem 1rem;
			font-size: 0.9rem;
		}

		.loading-steps {
			padding: 1rem 1.5rem;
			min-width: unset;
		}
	}

	.edit-title-box {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.8rem;
		width: 100%;
	}

	.edit-title-input {
		width: 100%;
		font-size: 2.2rem;
		font-weight: 700;
		color: #4b2e19;
		padding: 0.5rem;
		border: 2px solid #d4c2b8;
		border-radius: 8px;
		background-color: #fcf8f5;
	}

	.edit-title-actions {
		display: flex;
		gap: 1rem;
	}

	.delete-btn {
		background-color: #dc2626;
		color: #fff;
	}

	.delete-btn:hover {
		background-color: #b91c1c;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background-color: #fff;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
		max-width: 500px;
		width: 90%;
	}

	.modal-content h3 {
		color: #dc2626;
		margin-top: 0;
		margin-bottom: 1rem;
	}

	.modal-content p {
		color: #4b2e19;
		margin-bottom: 1.5rem;
		line-height: 1.5;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
	}

	.cancel-btn {
		background-color: #e0d7ce;
		color: #4b2e19;
	}

	.cancel-btn:hover {
		background-color: #d4c2b8;
	}

	.confirm-delete-btn {
		background-color: #dc2626;
		color: #fff;
	}

	.confirm-delete-btn:hover {
		background-color: #b91c1c;
	}
</style>
