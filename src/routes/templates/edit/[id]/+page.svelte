<script lang="ts">
import { onMount } from 'svelte';
import { fetchStoreContent, updateStoreContent, StoreContentType, type StoreContent } from '$lib/db/content-shop';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';

let id: number = parseInt(get(page).params.id);
let name = '';
let description = '';
let content = '';
let loading = true;
let error: string | null = null;
let success = false;

onMount(async () => {
  try {
    const { data } = await fetchStoreContent({ limit: 1, offset: id - 1 });
    const template = (data || []).find((t: StoreContent) => t.id === id);
    if (!template) {
      error = 'Template not found.';
      return;
    }
    name = template.name;
    description = template.description;
    content = template.content;
  } catch (e) {
    error = e.message || 'Failed to load template.';
  } finally {
    loading = false;
  }
});

async function handleUpdate() {
  error = null;
  success = false;
  loading = true;
  try {
    await updateStoreContent(id, { name, description, content });
    success = true;
    setTimeout(() => goto('/templates'), 1200);
  } catch (e) {
    error = e.message || 'Failed to update template.';
  } finally {
    loading = false;
  }
}
</script>

<style>
/* Reuse styles from submit page */
.form-section { max-width: 600px; margin: 2em auto; background: var(--color-block-bg, #fff); border-radius: 8px; box-shadow: 0 2px 8px var(--color-block-shadow, rgba(0,0,0,0.08)); padding: 2em; }
.form-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 1em; color: var(--color-text, #3e2723); }
.form-label { display: block; font-weight: 500; margin-bottom: 0.3em; color: var(--color-primary, #4b2e19); }
.form-input, .form-textarea { width: 100%; padding: 0.6em; border: 1px solid var(--color-border, #e0d7ce); border-radius: 4px; margin-bottom: 1em; font-size: 1rem; background: var(--color-block-bg, #fff); color: var(--color-text, #3e2723); }
.form-textarea { min-height: 120px; resize: vertical; }
.form-actions { display: flex; gap: 1em; align-items: center; }
.button-submit { background: var(--color-btn-primary, #4f46e5); color: var(--color-btn-primary-text, #fff); border: none; border-radius: 4px; padding: 0.5em 1.5em; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.button-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.status-message { color: var(--color-muted, #888); }
.error-message { color: var(--color-error, #c00); }
.success-message { color: var(--color-success, #059669); }
</style>

<div class="form-section">
  <div class="form-title">Edit Template</div>
  {#if loading}
    <p class="status-message">Loading...</p>
  {:else if error}
    <p class="error-message">{error}</p>
  {:else}
    <form on:submit|preventDefault={handleUpdate}>
      <label class="form-label" for="name">Name</label>
      <input class="form-input" id="name" bind:value={name} required maxlength={64} />

      <label class="form-label" for="description">Description</label>
      <input class="form-input" id="description" bind:value={description} required maxlength={128} />

      <label class="form-label" for="content">Content</label>
      <textarea class="form-textarea" id="content" bind:value={content} required maxlength={4096} />

      <div class="form-actions">
        <button class="button-submit" type="submit" disabled={loading}>Update</button>
        {#if loading}
          <span class="status-message">Updating...</span>
        {/if}
        {#if error}
          <span class="error-message">{error}</span>
        {/if}
        {#if success}
          <span class="success-message">Updated! Redirecting...</span>
        {/if}
      </div>
    </form>
  {/if}
</div> 