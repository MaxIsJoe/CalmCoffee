<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let word: string;
  export let definition: string;
  export let synonyms: string[] = [];
  export let x: number = 0;
  export let y: number = 0;
  const dispatch = createEventDispatcher();
  function close() { dispatch('close'); }
</script>

<div class="word-popup" style="top: {y}px; left: {x}px; position: fixed;">
  <button class="close-btn" on:click={close} aria-label="Close">×</button>
  <h4>{word}</h4>
  <div class="definition">{definition}</div>
  {#if synonyms.length}
    <div class="synonyms">
      <strong>Synonyms:</strong> {synonyms.join(', ')}
    </div>
  {/if}
</div>

<style>
.word-popup {
  position: fixed;
  z-index: 9999;
  background: var(--color-bg, #fff);
  color: var(--color-text, #222);
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  padding: 1rem 1.2rem 0.8rem 1.2rem;
  min-width: 220px;
  max-width: 320px;
  max-height: 300px;
  overflow-y: auto;
  font-size: 1rem;
  transition: opacity 0.15s;
}
.close-btn {
  position: absolute;
  top: 0.4rem;
  right: 0.7rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #888;
  cursor: pointer;
}
.close-btn:hover {
  color: #c00;
}
h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}
.definition {
  margin-bottom: 0.5rem;
}
.synonyms {
  font-size: 0.95em;
  color: #555;
}
</style> 