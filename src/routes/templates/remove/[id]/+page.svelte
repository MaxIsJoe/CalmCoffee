<script lang="ts">
import { onMount } from 'svelte';
import { fetchStoreContent, deleteStoreContent, type StoreContent } from '$lib/db/content-shop';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';

let id: number = parseInt(get(page).params.id);
let template: StoreContent | null = null;
let loading = true;
let error: string | null = null;
let success = false;
let confirm = false;

onMount(async () => {
  try {
    const { data } = await fetchStoreContent({ limit: 1, offset: id - 1 });
    template = (data || []).find((t: StoreContent) => t.id === id) || null;
    if (!template) {
      error = 'Template not found.';
      return;
    }
  } catch (e) {
    error = e.message || 'Failed to load template.';
  } finally {
    loading = false;
  }
});

async function handleDelete() {
  error = null;
  success = false;
  loading = true;
  try {
    await deleteStoreContent(id);
    success = true;
    setTimeout(() => goto('/templates'), 1200);
  } catch (e) {
    error = e.message || 'Failed to delete template.';
  } finally {
    loading = false;
  }
}
</script>

<style>
.form-section { max-width: 600px; margin: 2em auto; background: var(--color-block-bg, #fff); border-radius: 8px; box-shadow: 0 2px 8px var(--color-block-shadow, rgba(0,0,0,0.08)); padding: 2em; }
.form-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 1em; color: var(--color-text, #3e2723); }
.form-label { display: block; font-weight: 500; margin-bottom: 0.3em; color: var(--color-primary, #4b2e19); }
.form-actions { display: flex; gap: 1em; align-items: center; }
.button-delete { background: var(--color-danger, #dc2626); color: #fff; border: none; border-radius: 4px; padding: 0.5em 1.5em; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.button-delete:disabled { opacity: 0.6; cursor: not-allowed; }
.status-message { color: var(--color-muted, #888); }
.error-message { color: var(--color-error, #c00); }
.success-message { color: var(--color-success, #059669); }
</style>

<div class="form-section">
  <div class="form-title">Remove Template</div>
  {#if loading}
    <p class="status-message">Loading...</p>
  {:else if error}
    <p class="error-message">{error}</p>
  {:else if template}
    <p>Are you sure you want to remove the template <b>{template.name}</b>?</p>
    {#if !confirm}
      <div class="form-actions">
        <button class="button-delete" on:click={() => confirm = true}>Yes, remove</button>
        <button class="button-delete" style="background: var(--color-muted, #888);" on:click={() => goto('/templates')}>Cancel</button>
      </div>
    {:else}
      <div class="form-actions">
        <button class="button-delete" on:click={handleDelete} disabled={loading}>Confirm Delete</button>
        {#if loading}
          <span class="status-message">Deleting...</span>
        {/if}
        {#if error}
          <span class="error-message">{error}</span>
        {/if}
        {#if success}
          <span class="success-message">Deleted! Redirecting...</span>
        {/if}
      </div>
    {/if}
  {/if}
</div> 