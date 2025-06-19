<script lang="ts">
  import BlockPreview from './BlockPreview.svelte';
  export let blocks: { id: string, content: string, styles: any, created_at?: string }[] = [];
  export let onEdit: (blockId: string) => void = () => {};
</script>

<div class="block-list">
  {#each blocks as block (block.id)}
    <BlockPreview
      content={block.content}
      styles={block.styles}
      createdAt={block.created_at}
      onEdit={() => onEdit(block.id)}
    />
  {/each}
</div>

<style>
  .block-list {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    width: 100%;
  }
</style> 