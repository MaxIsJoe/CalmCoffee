<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ImageUploader from '../images/ImageUploader.svelte';
	import { browser } from '$app/environment';

	const dispatch = createEventDispatcher();

	export let useMarkdown: boolean = false;

	let showImageUploader = false;

	function insert(before: string, after: string = '', placeholder: string = '') {
		if (useMarkdown) {
			dispatch('insert', { before: '![](', after: ')', placeholder });
		} else {
			dispatch('insert', { before: '', after: '', placeholder });
		}
	}

	function handleImageUpload(event: CustomEvent<{ url: string }>) {
		const imageUrl = event.detail.url;
		insert('', '', imageUrl);
		showImageUploader = false;
	}

	function handleImageError(event: CustomEvent<{ message: string }>) {
		console.error('Image upload error:', event.detail.message);
		showImageUploader = false;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.image-uploader-container') && !target.closest('.image-btn')) {
			showImageUploader = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<button 
	type="button" 
	class="image-btn" 
	on:click={() => showImageUploader = !showImageUploader}
	title="Upload or select image"
>
	🖼️ Image
</button>

{#if showImageUploader && browser}
	<div class="modal-backdrop">
		<div class="image-uploader-container">
			<div class="uploader-header">
				<h3>Add Image</h3>
				<button type="button" class="close-btn" on:click={() => showImageUploader = false}>×</button>
			</div>
			<div class="uploader-content">
				<div class="upload-options">
					<div class="option">
						<h4>Upload New Image</h4>
						<ImageUploader 
							on:upload={handleImageUpload}
							on:error={handleImageError}
							on:select={handleImageUpload}
						/>
					</div>
					<div class="option">
						<h4>Or Add Image URL</h4>
						<button 
							type="button" 
							class="url-btn"
							on:click={() => {
								insert('', '', 'image url');
								showImageUploader = false;
							}}
						>
							Add Image URL
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.image-btn {
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 0.2rem 0.5rem;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.image-btn:hover {
		background: var(--color-link-hover);
		border-color: var(--color-link);
		transform: translateY(-1px);
	}

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.image-uploader-container {
		background: var(--color-card-bg);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.uploader-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.uploader-header h3 {
		margin: 0;
		font-size: 1.1rem;
		color: var(--color-primary);
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--color-secondary);
		cursor: pointer;
		padding: 0.2rem 0.5rem;
		line-height: 1;
	}

	.close-btn:hover {
		color: var(--color-primary);
	}

	.uploader-content {
		padding: 1rem;
	}

	.upload-options {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.option h4 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		color: var(--color-primary);
	}

	.url-btn {
		background: var(--color-link);
		color: var(--color-primary-alt);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
		width: 100%;
	}

	.url-btn:hover {
		background: var(--color-link-hover);
	}
</style> 