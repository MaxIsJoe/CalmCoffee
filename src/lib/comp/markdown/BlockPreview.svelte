<script lang="ts">
  import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';
  export let content: string = '';
  export let styles: any = defaultStyles;
  export let createdAt: string | null = null;
  export let onEdit: (() => void) | null = null;
</script>

<div class="block-preview">
  <div class="block-preview-content">
    {@html coffeeMarkdown(content, styles)}
  </div>
  {#if createdAt}
    <div class="block-preview-date">{new Date(createdAt).toLocaleString()}</div>
  {/if}
  {#if onEdit}
    <button class="block-preview-edit-btn" on:click={onEdit}>Edit</button>
  {/if}
</div>

<style>
  .block-preview {
    background: var(--color-bg-alt);
    border-radius: 8px;
    box-shadow: 0 1px 4px var(--color-card-shadow);
    padding: 1.5rem 1.2rem 1rem 1.2rem;
    margin-bottom: 1.2rem;
    position: relative;
  }
  .block-preview-content {
    font-size: 1.08rem;
    color: var(--color-text);
    word-break: break-word;
  }
  .block-preview-date {
    color: var(--color-block-date);
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }
  .block-preview-edit-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: var(--color-block-btn-bg);
    color: var(--color-block-btn-text);
    border: none;
    border-radius: 6px;
    padding: 0.3rem 1rem;
    font-size: 0.97rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .block-preview-edit-btn:hover {
    background: var(--color-block-btn-hover);
  }
</style> 