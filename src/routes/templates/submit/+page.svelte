<script lang="ts">
import { createStoreContent, StoreContentType } from '$lib/db/content-shop';
import { goto } from '$app/navigation';
import { defaultStyles, coffeeMarkdown } from '$lib/md/coffeeMarkdown';
import { onMount } from 'svelte';
	import { user } from '$lib/stores/user';

let name = '';
let description = '';
let content = '';
let type: StoreContentType = StoreContentType.TEMPLATE;
let loading = false;
let error: string | null = null;
let success = false;

// Prefill content with defaultStyles if STYLE is selected and content is empty
function handleTypeChange(e: Event) {
  type = Number((e.target as HTMLSelectElement).value);
  if (type === StoreContentType.STYLE && !content) {
    content = JSON.stringify(defaultStyles, null, 2);
  }
}

async function handleSubmit() {
    if ($user === null || $user.usr === null)
    {
        error = "User not logged in";
        return
    }
    error = null;
    success = false;
    loading = true;
    try {
        await createStoreContent({
        name,
        description,
        content,
        type,
        created_by: $user.usr.id // TODO: Replace with actual user info
        });
        success = true;
        setTimeout(() => goto('/templates'), 1200);
    } catch (e) {
        console.log(e)
        error = e instanceof Error ? e.message : 'Failed to submit template.';
    } finally {
        loading = false;
    }
}
</script>

<style>
.form-section {
  max-width: 600px;
  margin: 2em auto;
  background: var(--color-block-bg, #fff);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--color-block-shadow, rgba(0,0,0,0.08));
  padding: 2em;
}
.form-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1em;
  color: var(--color-text, #3e2723);
}
.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.3em;
  color: var(--color-primary, #4b2e19);
}
.form-input, .form-textarea {
  width: 100%;
  padding: 0.6em;
  border: 1px solid var(--color-border, #e0d7ce);
  border-radius: 4px;
  margin-bottom: 1em;
  font-size: 1rem;
  background: var(--color-block-bg, #fff);
  color: var(--color-text, #3e2723);
}
.form-textarea {
  min-height: 120px;
  resize: vertical;
}
.form-actions {
  display: flex;
  gap: 1em;
  align-items: center;
}
.button-submit {
  background: var(--color-btn-primary, #4f46e5);
  color: var(--color-btn-primary-text, #fff);
  border: none;
  border-radius: 4px;
  padding: 0.5em 1.5em;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.button-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.status-message {
  color: var(--color-muted, #888);
}
.error-message {
  color: var(--color-error, #c00);
}
.success-message {
  color: var(--color-success, #059669);
}
.preview-section {
  margin-top: 2em;
  background: var(--color-block-bg, #fff);
  border-radius: 8px;
  box-shadow: 0 1px 4px var(--color-block-shadow, rgba(0,0,0,0.08));
  padding: 1.5em;
}
.preview-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.7em;
  color: var(--color-primary, #4b2e19);
}
</style>

<div class="form-section">
  <div class="form-title">Submit a New Template or Style</div>
  <form on:submit|preventDefault={handleSubmit}>
    <label class="form-label" for="type">Content Type</label>
    <select class="form-input" id="type" bind:value={type} on:change={handleTypeChange}>
      <option value={StoreContentType.TEMPLATE}>Template (Markdown)</option>
      <option value={StoreContentType.STYLE}>Style (JSON)</option>
    </select>

    <label class="form-label" for="name">Name</label>
    <input class="form-input" id="name" bind:value={name} required maxlength={64} />

    <label class="form-label" for="description">Description</label>
    <input class="form-input" id="description" bind:value={description} required maxlength={128} />

    <label class="form-label" for="content">Content</label>
    <textarea class="form-textarea" id="content" bind:value={content} required maxlength={4096} />

    <div class="form-actions">
      <button class="button-submit" type="submit" disabled={loading}>Submit</button>
      {#if loading}
        <span class="status-message">Submitting...</span>
      {/if}
      {#if error}
        <span class="error-message">{error}</span>
      {/if}
      {#if success}
        <span class="success-message">Submitted! Redirecting...</span>
      {/if}
    </div>
  </form>

  {#if type === StoreContentType.TEMPLATE}
    <div class="preview-section">
      <div class="preview-title">Markdown Preview</div>
      <div>{@html coffeeMarkdown(content)}</div>
    </div>
  {/if}
</div> 