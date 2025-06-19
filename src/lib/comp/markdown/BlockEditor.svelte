<script lang="ts">
  import ZenMarkdownEditor from './ZenMarkdownEditor.svelte';
  import { defaultStyles } from '$lib/md/coffeeMarkdown';
  import { createEventDispatcher } from 'svelte';

  export let value: string = '';
  export let styles: string = JSON.stringify(defaultStyles, null, 2);
  export let maxLength: number = 1000;
  export let isEditing: boolean = false;
  export let loading: boolean = false;
  export let error: string = '';

  const dispatch = createEventDispatcher();

  let showStyles = false;

  function handleSave() {
    dispatch('save', { value, styles });
  }
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="block-editor">
  <ZenMarkdownEditor
    bind:value
    maxLength={maxLength}
    placeholder={isEditing ? 'Edit your block content...' : 'Write your next 1000 characters (markdown supported)'}
    customStyles={(() => { try { return JSON.parse(styles); } catch { return defaultStyles; } })()}
  />
  <button class="toggle-styles-btn" type="button" on:click={() => showStyles = !showStyles}>
    {showStyles ? 'Hide Styles ▲' : 'Advanced Styles ▼'}
  </button>
  {#if showStyles}
    <textarea
      class="block-editor-styles"
      bind:value={styles}
      placeholder="Block styles (JSON)"
      style="margin-bottom:0.5rem;height:70px;font-size:0.95rem;"
    ></textarea>
  {/if}
  <div class="block-editor-actions">
    <button class="save-btn" on:click={handleSave} disabled={loading}>
      {loading ? 'Saving...' : 'Save'}
    </button>
    <button class="cancel-btn" on:click={handleCancel} type="button">Cancel</button>
  </div>
  {#if error}
    <div class="block-editor-error">{error}</div>
  {/if}
</div>

<style>
  .block-editor {
    background: var(--color-block-editor-bg);
    border-radius: 12px;
    box-shadow: 0 2px 12px var(--color-block-editor-shadow);
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    margin-bottom: 1.5rem;
    width: 100%;
  }
  .toggle-styles-btn {
    background: var(--color-block-toggle-bg);
    color: var(--color-block-toggle-text);
    border: 1px solid var(--color-block-toggle-border);
    border-radius: 5px;
    padding: 0.25rem 0.9rem;
    font-size: 0.98rem;
    cursor: pointer;
    margin: 0.5rem 0;
    transition: background 0.2s, border 0.2s;
  }
  .toggle-styles-btn:hover {
    background: var(--color-block-toggle-hover);
    border-color: var(--color-block-toggle-hover-border);
  }
  .block-editor-styles {
    width: 100%;
    padding: 0.7rem;
    border-radius: 8px;
    border: 1.5px solid var(--color-block-textarea-border);
    background: var(--color-block-textarea-bg);
    box-shadow: 0 1px 4px var(--color-block-textarea-shadow);
    resize: vertical;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }
  .block-editor-actions {
    display: flex;
    gap: 0.7rem;
    margin-top: 0.5rem;
  }
  .save-btn {
    background: var(--color-block-add-btn-bg);
    color: var(--color-block-add-btn-text);
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 8px;
    font-size: 1.05rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  .save-btn:hover {
    background: var(--color-block-add-btn-hover);
  }
  .cancel-btn {
    background: var(--color-block-btn-bg);
    color: var(--color-block-btn-text);
    border: none;
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    font-size: 1.05rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .cancel-btn:hover {
    background: var(--color-block-btn-hover);
  }
  .block-editor-error {
    color: var(--color-block-error);
    margin-top: 0.7rem;
    font-size: 1.01rem;
  }
</style> 