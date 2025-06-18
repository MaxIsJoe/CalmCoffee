<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/stores/user';
	import { get } from 'svelte/store';

	const dispatch = createEventDispatcher<{
		upload: { url: string };
		error: { message: string };
		select: { url: string };
	}>();

	export let bucket = 'images';
	export let folder = 'user-uploads';
	export let maxFileSize = 2 * 1024 * 1024; // 5MB
	export let allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
	export let maxFiles = 150;

	let files: File[] = [];
	let uploadedImages: { name: string; url: string }[] = [];
	let uploading = false;
	let error: string | null = null;
	let dragOver = false;

	// Load existing images on mount
	$: if (get(user)?.usr?.id) {
		loadUserImages();
	}

	async function loadUserImages() {
		const userId = get(user)?.usr?.id;
		if (!userId) return;

		try {
			const { data, error: listError } = await supabase.storage
				.from(bucket)
				.list(`${folder}/${userId}`);

			if (listError) throw listError;

			uploadedImages = await Promise.all(
				data.map(async (file) => {
					const { data: urlData } = await supabase.storage
						.from(bucket)
						.getPublicUrl(`${folder}/${userId}/${file.name}`);
					return { name: file.name, url: urlData.publicUrl };
				})
			);
		} catch (err) {
			console.error('Error loading images:', err);
			error = 'Failed to load images';
		}
	}

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;

		const newFiles = Array.from(input.files);
		if (newFiles.length + files.length > maxFiles) {
			error = `You can only upload up to ${maxFiles} files at once`;
			return;
		}

		for (const file of newFiles) {
			if (!allowedTypes.includes(file.type)) {
				error = 'Only JPEG, PNG, GIF, and WebP images are allowed';
				return;
			}
			if (file.size > maxFileSize) {
				error = 'File size must be less than 5MB';
				return;
			}
		}

		files = [...files, ...newFiles];
		error = null;
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;

		const droppedFiles = Array.from(event.dataTransfer?.files || []);
		if (!droppedFiles.length) return;

		if (droppedFiles.length + files.length > maxFiles) {
			error = `You can only upload up to ${maxFiles} files at once`;
			return;
		}

		for (const file of droppedFiles) {
			if (!allowedTypes.includes(file.type)) {
				error = 'Only JPEG, PNG, GIF, and WebP images are allowed';
				return;
			}
			if (file.size > maxFileSize) {
				error = 'File size must be less than 5MB';
				return;
			}
		}

		files = [...files, ...droppedFiles];
		error = null;
	}

	async function uploadFiles() {
		const userId = get(user)?.usr?.id;
		if (!userId) {
			error = 'You must be logged in to upload images';
			return;
		}

		uploading = true;
		error = null;

		try {
			for (const file of files) {
				const fileExt = file.name.split('.').pop();
				const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
				const filePath = `${folder}/${userId}/${fileName}`;

				const { error: uploadError } = await supabase.storage
					.from(bucket)
					.upload(filePath, file);

				if (uploadError) throw uploadError;

				const { data: urlData } = await supabase.storage
					.from(bucket)
					.getPublicUrl(filePath);

				uploadedImages = [...uploadedImages, { name: fileName, url: urlData.publicUrl }];
				dispatch('upload', { url: urlData.publicUrl });
			}

			files = [];
		} catch (err) {
			console.error('Error uploading files:', err);
			error = 'Failed to upload images';
			dispatch('error', { message: 'Failed to upload images' });
		} finally {
			uploading = false;
		}
	}

	async function deleteImage(imageName: string) {
		const userId = get(user)?.usr?.id;
		if (!userId) return;

		try {
			const { error: deleteError } = await supabase.storage
				.from(bucket)
				.remove([`${folder}/${userId}/${imageName}`]);

			if (deleteError) throw deleteError;

			uploadedImages = uploadedImages.filter((img) => img.name !== imageName);
		} catch (err) {
			console.error('Error deleting image:', err);
			error = 'Failed to delete image';
		}
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
	}
</script>

<div class="image-uploader">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="drop-zone"
		class:drag-over={dragOver}
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		on:drop={handleDrop}
	>
		<input
			type="file"
			accept="image/jpeg,image/png,image/gif,image/webp"
			multiple
			on:change={handleFileSelect}
			id="file-input"
		/>
		<label for="file-input" class="drop-zone-label">
			<div class="upload-icon">📁</div>
			<p>Drag and drop images here or click to select</p>
			<p class="upload-hint">Max file size: {maxFileSize / 1048576}MB. Supported formats: JPEG, PNG, GIF, WebP</p>
		</label>
	</div>

	{#if error}
		<p class="error">{error}</p>
	{/if}

	{#if files.length > 0}
		<div class="selected-files">
			<h3>Selected Files ({files.length})</h3>
			<div class="file-list">
				{#each files as file, i}
					<div class="file-item">
						<span class="file-name">{file.name}</span>
						<button type="button" class="remove-btn" on:click={() => removeFile(i)}>×</button>
					</div>
				{/each}
			</div>
			<button
				type="button"
				class="upload-btn"
				on:click={uploadFiles}
				disabled={uploading || !files.length}
			>
				{uploading ? 'Uploading...' : 'Upload Files'}
			</button>
		</div>
	{/if}

	{#if uploadedImages.length > 0}
		<div class="uploaded-images">
			<h3>Choose one of your already uploaded Images ({uploadedImages.length}/{maxFiles})</h3>
			<div class="image-grid">
				{#each uploadedImages as image}
					<div class="image-item" on:click={() => dispatch('select', { url: image.url })}>
						<img src={image.url} alt={image.name} loading="lazy" />
						<div class="image-actions">
							<button
								type="button"
								class="copy-btn"
								on:click|stopPropagation={() => navigator.clipboard.writeText(image.url)}
								title="Copy URL"
							>
								📋
							</button>
							<button
								type="button"
								class="delete-btn"
								on:click|stopPropagation={() => deleteImage(image.name)}
								title="Delete image"
							>
								🗑️
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.image-uploader {
		width: 100%;
	}

	.drop-zone {
		border: 2px dashed var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		background: var(--color-bg-alt);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.drop-zone.drag-over {
		border-color: var(--color-link);
		background: var(--color-link-hover);
	}

	.drop-zone input[type='file'] {
		display: none;
	}

	.drop-zone-label {
		cursor: pointer;
	}

	.upload-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.upload-hint {
		font-size: 0.9rem;
		color: var(--color-secondary);
		margin-top: 0.5rem;
	}

	.error {
		color: var(--color-danger);
		margin: 1rem 0;
		text-align: center;
	}

	.selected-files {
		margin-top: 1.5rem;
	}

	.file-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 1rem 0;
	}

	.file-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: var(--color-bg-alt);
		padding: 0.5rem 1rem;
		border-radius: 6px;
	}

	.file-name {
		font-size: 0.9rem;
		color: var(--color-secondary);
	}

	.remove-btn {
		background: none;
		border: none;
		color: #64748b;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0 0.5rem;
	}

	.remove-btn:hover {
		color: var(--color-danger);
	}

	.upload-btn {
		background: var(--color-link);
		color: var(--color-primary-alt);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.upload-btn:disabled {
		background: var(--color-secondary);
		cursor: not-allowed;
	}

	.upload-btn:hover:not(:disabled) {
		background: var(--color-link-hover);
	}

	.uploaded-images {
		margin-top: 2rem;
	}

	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.image-item {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		aspect-ratio: 1;
	}

	.image-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.image-actions {
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.5);
		border-bottom-left-radius: 8px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.image-item:hover .image-actions {
		opacity: 1;
	}

	.copy-btn,
	.delete-btn {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		padding: 0.25rem;
		font-size: 1.1rem;
		transition: transform 0.2s;
	}

	.copy-btn:hover,
	.delete-btn:hover {
		transform: scale(1.1);
	}

	.delete-btn:hover {
		color: var(--color-danger);
	}

	h3 {
		font-size: 1.1rem;
		color: var(--color-primary);
		margin: 0;
	}

	@media (max-width: 640px) {
		.drop-zone {
			padding: 1rem;
		}

		.image-grid {
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
			gap: 0.75rem;
		}

		.image-actions {
			opacity: 1;
			background: rgba(0, 0, 0, 0.7);
		}
	}
</style> 