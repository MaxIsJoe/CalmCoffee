<script lang="ts">
import { onMount } from 'svelte';
import { fetchStoreContent, StoreContentType, type StoreContent } from '$lib/db/content-shop';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';

let templates: StoreContent[] = [];
let loading = true;
let error: string | null = null;
let page = 1;
let pageSize = 10;
let total = 0;
let openTemplateId: number | null = null;

async function loadTemplates() {
    loading = true;
    error = null;
    try {
        const { data, count } = await fetchStoreContent({
            limit: pageSize,
            offset: (page - 1) * pageSize
        });
        templates = (data || []).filter(t => t.type === StoreContentType.TEMPLATE);
        total = count || 0;
    } catch (e) {
        if (e instanceof Error) {
            error = e.message;
        } else {
            error = 'Failed to load templates.';
        }
    } finally {
        loading = false;
    }
}

onMount(loadTemplates);

function nextPage() {
    if (page * pageSize < total) {
        page++;
        loadTemplates();
    }
}

function prevPage() {
    if (page > 1) {
        page--;
        loadTemplates();
    }
}

function copyTemplate(content: string) {
    navigator.clipboard.writeText(content);
    alert('Template copied to clipboard!');
}
</script>

<style>
.experimental-tag {
  background: var(--color-block-wait-info-bg, #fffbe6);
  color: var(--color-block-error, #b91c1c);
  padding: 0.5em 1em;
  border-radius: 4px;
  margin-bottom: 1em;
  font-weight: bold;
  border: 1px solid var(--color-block-wait-info-border, #ffe066);
}

.templates-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--color-text, #3e2723);
}

.templates-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.template-item {
  border-bottom: 1px solid var(--color-border, #e0d7ce);
  padding-bottom: 1.5em;
  margin-bottom: 1.5em;
}

.template-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-primary, #4b2e19);
}

.template-description {
  font-size: 0.95rem;
  color: var(--color-muted, #888);
  margin-bottom: 0.5em;
}

.template-content {
  background: var(--color-block-bg, #fff);
  padding: 1em;
  border-radius: 4px;
  font-size: 0.95rem;
  overflow-x: auto;
  margin-bottom: 0.5em;
  box-shadow: 0 1px 2px var(--color-block-shadow, rgba(0,0,0,0.03));
}

.template-actions {
  display: flex;
  gap: 0.5em;
}

.button-copy {
  background: var(--color-btn-primary, #4f46e5);
  color: var(--color-btn-primary-text, #fff);
  border: none;
  border-radius: 4px;
  padding: 0.4em 1.2em;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.button-copy:hover {
  background: var(--color-btn-primary-hover, #3730a3);
}

.button-disabled {
  background: var(--color-block-btn-bg, #e0e7ff);
  color: var(--color-muted, #888);
  border: none;
  border-radius: 4px;
  padding: 0.4em 1.2em;
  cursor: not-allowed;
}

.pagination {
  margin-top: 2em;
  display: flex;
  align-items: center;
  gap: 1em;
}
.pagination-btn {
  background: var(--color-block-btn-bg, #e0e7ff);
  color: var(--color-block-btn-text, #3730a3);
  border: none;
  border-radius: 4px;
  padding: 0.4em 1.2em;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.status-message {
  color: var(--color-muted, #888);
}
.error-message {
  color: var(--color-error, #c00);
}
.template-nav {
  display: flex;
  gap: 1em;
  margin-bottom: 1.5em;
}
.template-nav-link {
  color: var(--color-link, #4f46e5);
  text-decoration: none;
  font-weight: 500;
  padding: 0.3em 1em;
  border-radius: 4px;
  background: var(--color-block-btn-bg, #e0e7ff);
  transition: background 0.2s;
}
.template-nav-link:hover {
  background: var(--color-block-btn-hover, #c7d2fe);
  color: var(--color-link-hover, #3730a3);
}
.template-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.5em 0;
  user-select: none;
}
.template-toggle {
  margin-left: 1em;
  font-size: 1.2em;
  color: var(--color-link, #4f46e5);
}
</style>

<div class="experimental-tag">
  this is experimental and may get changed in the future
</div>

<nav class="template-nav">
  <a class="template-nav-link" href="/templates/submit">Submit New Template</a>
</nav>

<h1 class="templates-title">Browse Templates</h1>

{#if loading}
  <p class="status-message">Loading templates...</p>
{:else if error}
  <p class="error-message">{error}</p>
{:else if templates.length === 0}
  <p class="status-message">No templates found.</p>
{:else}
  <ul class="templates-list">
    {#each templates as template}
      <li class="template-item">
        <div class="template-header" on:click={() => openTemplateId = openTemplateId === template.id ? null : template.id}>
          <span class="template-name">{template.name}</span>
          <span class="template-description">{template.description}</span>
          <span class="template-toggle">{openTemplateId === template.id ? '▲' : '▼'}</span>
        </div>
        {#if openTemplateId === template.id}
          <pre class="template-content">{template.content}</pre>
          <div class="template-actions">
            <button class="button-copy" on:click={() => copyTemplate(template.content)}>Copy</button>
            {#if $user && $user.profile && template.created_by === $user.profile.account_id}
              <a class="button-copy" href={`/templates/edit/${template.id}`}>Edit</a>
              <a class="button-copy" href={`/templates/remove/${template.id}`}>Remove</a>
            {/if}
          </div>
        {/if}
      </li>
    {/each}
  </ul>
  <div class="pagination">
    <button class="pagination-btn" on:click={prevPage} disabled={page === 1}>Previous</button>
    <span>Page {page} of {Math.ceil(total / pageSize) || 1}</span>
    <button class="pagination-btn" on:click={nextPage} disabled={page * pageSize >= total}>Next</button>
  </div>
{/if} 