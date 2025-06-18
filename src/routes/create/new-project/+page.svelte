<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import type { Database } from '../../../../database.types';

	let title = '';
	let description = '';
	let short_description = '';
	let age_rating: Database['public']['Enums']['AgeRating'] = 'Everyone';
	let error = '';
	let loading = false;
	let loadingMessage = 'Creating your story...';
	let tags: string[] = [];
	let tagInput = '';
	const maxTags = 6;
	let tagWarning = '';

	// Onboarding state
	let currentStep = 1;
	const totalSteps = 3;
	let stepTransitioning = false;

	function nextStep() {
		if (currentStep < totalSteps) {
			stepTransitioning = true;
			setTimeout(() => {
				currentStep++;
				stepTransitioning = false;
			}, 300);
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			stepTransitioning = true;
			setTimeout(() => {
				currentStep--;
				stepTransitioning = false;
			}, 300);
		}
	}

	async function createProject() {
		error = '';
		loading = true;
		loadingMessage = 'Creating your story...';
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			error = 'You must be logged in to create a project.';
			loading = false;
			return;
		}
		loadingMessage = 'Setting up your story...';
		const { data, error: insertError } = await supabase
			.from('stories')
			.insert({
				title,
				description,
				short_description,
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
		loadingMessage = 'Redirecting to editor...';
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
{#if loading}
	<div class="loading-screen">
		<div class="loader"></div>
		<p>{loadingMessage}</p>
	</div>
{:else}
	<div class="onboarding-container">
		<div class="progress-bar">
			{#each Array(totalSteps) as _, i}
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<div class="progress-step {i + 1 <= currentStep ? 'active' : ''}" />
			{/each}
		</div>

		<form on:submit|preventDefault={createProject} class:transitioning={stepTransitioning}>
			{#if currentStep === 1}
				<div class="step-content">
					<h3>Let's start with the basics</h3>
					<p class="step-description">Give your story a title and choose an appropriate age rating. This helps readers find your work.</p>
					
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label>Title</label>
					<input type="text" bind:value={title} required maxlength="100" placeholder="Enter your story's title" />
					
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label>Age Rating</label>
					<select bind:value={age_rating}>
						<option value="Everyone">Everyone</option>
						<option value="Teens">Teens</option>
						<option value="Mature">Mature</option>
						<option value="Adult">Adult</option>
					</select>
					
					<div class="step-actions">
						<button type="button" class="next-btn" on:click={nextStep} disabled={!title.trim()}>
							Next Step
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M5 12h14M12 5l7 7-7 7"/>
							</svg>
						</button>
					</div>
				</div>
			{:else if currentStep === 2}
				<div class="step-content">
					<h3>Tell us about your story</h3>
					<p class="step-description">Write a brief summary and a more detailed description to help readers understand what your story is about.</p>
					
					<label>Short Description</label>
					<textarea 
						bind:value={short_description} 
						maxlength="300" 
						placeholder="A brief summary of your story that will appear on story listings (max 300 characters)"
						rows="2"
					></textarea>
					
					<label>Full Description</label>
					<textarea 
						bind:value={description} 
						maxlength="2500"
						placeholder="A more detailed description/synopsis of your story (markdown supported)"
					></textarea>
					
					<div class="step-actions">
						<button type="button" class="back-btn" on:click={prevStep}>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M19 12H5M12 19l-7-7 7-7"/>
							</svg>
							Previous
						</button>
						<button type="button" class="next-btn" on:click={nextStep} disabled={!short_description.trim()}>
							Next Step
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M5 12h14M12 5l7 7-7 7"/>
							</svg>
						</button>
					</div>
				</div>
			{:else if currentStep === 3}
				<div class="step-content">
					<h3>Add some tags</h3>
					<p class="step-description">Tags help readers discover your story. Add up to 6 tags that best describe your story's themes, genres, or content.</p>
					
					<div class="tags-input">
						<input
							type="text"
							bind:value={tagInput}
							placeholder="Add a tag and press Enter (max 6)"
							maxlength="30"
							on:keydown={handleTagInputKeydown}
							disabled={tags.length >= maxTags}
						/>
						<button type="button" on:click={addTag} disabled={tags.length >= maxTags || !tagInput.trim()}>Add</button>
						<div class="tag-list">
							{#each tags as tag, i}
								<span class="tag">
									{tag}
									<button type="button" on:click={() => removeTag(i)} aria-label="Remove tag">&times;</button>
								</span>
							{/each}
						</div>
						{#if tagWarning}
							<p class="tag-warning">{tagWarning}</p>
						{/if}
					</div>
					
					<div class="step-actions">
						<button type="button" class="back-btn" on:click={prevStep}>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M19 12H5M12 19l-7-7 7-7"/>
							</svg>
							Previous
						</button>
						<button type="submit" class="create-btn" disabled={loading}>
							{loading ? 'Creating...' : 'Create Project'}
						</button>
					</div>
				</div>
			{/if}
			{#if error}<p class="error-message">{error}</p>{/if}
		</form>
	</div>
{/if}

<style>
	h2 {
		text-align: center;
		margin-top: 2rem;
		color: #4b2e19;
	}

	.onboarding-container {
		max-width: 600px;
		margin: 2rem auto;
	}

	.progress-bar {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.progress-step {
		width: 40px;
		height: 4px;
		background: #e0d7ce;
		border-radius: 2px;
		transition: background-color 0.3s;
	}

	.progress-step.active {
		background: #a1887f;
	}

	form {
		background: #fff;
		border-radius: 16px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		padding: 2.5rem;
		transition: opacity 0.3s, transform 0.3s;
	}

	form.transitioning {
		opacity: 0;
		transform: translateX(20px);
	}

	.step-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	h3 {
		margin: 0;
		color: #4b2e19;
		font-size: 1.5rem;
	}

	.step-description {
		color: #6d4c41;
		margin: 0;
		line-height: 1.5;
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
		border-radius: 8px;
		padding: 0.8rem 1rem;
		font-size: 1rem;
		background: #f9f6f3;
		color: #3e2723;
		transition: all 0.2s;
	}

	input[type='text']:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: #a1887f;
		background: #fff;
		box-shadow: 0 0 0 3px rgba(161, 136, 127, 0.1);
	}

	textarea {
		min-height: 80px;
		resize: vertical;
	}

	.step-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
	}

	.next-btn,
	.back-btn,
	.create-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.8rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.next-btn,
	.create-btn {
		background: #a1887f;
		color: #fff;
		border: none;
	}

	.next-btn:hover:not(:disabled),
	.create-btn:hover:not(:disabled) {
		background: #6d4c41;
	}

	.back-btn {
		background: #f3f4f6;
		color: #6d4c41;
		border: 1px solid #bca18c;
	}

	.back-btn:hover {
		background: #e0d7ce;
	}

	.next-btn:disabled,
	.create-btn:disabled {
		background: #e0d7ce;
		color: #bfa07a;
		cursor: not-allowed;
	}

	.error-message {
		color: #dc2626;
		text-align: center;
		margin-top: 1rem;
		font-weight: 500;
	}

	.tags-input {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.tags-input input[type='text'] {
		width: 100%;
	}

	.tags-input button[type='button'] {
		background: #a1887f;
		color: #fff;
		border: none;
		border-radius: 8px;
		padding: 0.5em 1em;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
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
		padding: 0.4rem 0.9rem 0.4rem 0.8rem;
		display: flex;
		align-items: center;
		font-size: 0.98rem;
		animation: tagAppear 0.3s ease-out;
	}

	@keyframes tagAppear {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
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
		transition: color 0.2s;
	}

	.tag button:hover {
		color: #6d4c41;
	}

	.tag-warning {
		color: #bfa007;
		font-size: 0.98em;
		margin-top: 0.2em;
	}

	@media (max-width: 640px) {
		.onboarding-container {
			margin: 1rem;
		}

		form {
			padding: 1.5rem;
		}

		.step-actions {
			flex-direction: column;
			gap: 1rem;
		}

		.next-btn,
		.back-btn,
		.create-btn {
			width: 100%;
			justify-content: center;
		}
	}

	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
	}

	.loader {
		border: 4px solid #e0e7ff;
		border-top: 4px solid #6366f1;
		border-radius: 50%;
		width: 38px;
		height: 38px;
		animation: spin 1s linear infinite;
		margin-bottom: 1.2rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
