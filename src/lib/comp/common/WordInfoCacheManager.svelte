<script lang="ts">
	import { wordInfoCache, type WordInfo } from './wordInfoCache';
	import { get } from 'svelte/store';

	let cacheEntries: [string, WordInfo][] = [];

	wordInfoCache.subscribe((map) => {
		cacheEntries = Array.from(map.entries());
	});

	function clearCache() {
		wordInfoCache.set(new Map());
	}
</script>

<div class="word-info-cache-manager">
	<h3>Word Definition Cache</h3>
	{#if cacheEntries.length === 0}
		<p class="empty">No cached definitions.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Word</th>
					<th>Definition</th>
					<th>Synonyms</th>
				</tr>
			</thead>
			<tbody>
				{#each cacheEntries as [word, info]}
					<tr>
						<td><strong>{word}</strong></td>
						<td>{info.definition}</td>
						<td>{info.synonyms.join(', ')}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<button class="clear-btn" on:click={clearCache}>Clear Cache</button>
	{/if}
</div>

<style>
	.word-info-cache-manager {
		margin: 2rem 0;
		padding: 1.5rem;
		background: var(--color-card-bg, #f8f8f8);
		border-radius: 10px;
		box-shadow: 0 2px 8px var(--color-card-shadow, #e0e0e0);
	}
	.word-info-cache-manager h3 {
		margin-top: 0;
		color: var(--color-text, #222);
	}
	.word-info-cache-manager table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}
	.word-info-cache-manager th,
	.word-info-cache-manager td {
		border: 1px solid var(--color-border, #ccc);
		padding: 0.5rem 0.7rem;
		text-align: left;
		font-size: 1em;
	}
	.word-info-cache-manager th {
		background: var(--color-bg-alt, #f0f0f0);
		color: var(--color-text, #222);
	}
	.word-info-cache-manager td {
		background: var(--color-bg, #fff);
		color: var(--color-text, #222);
	}
	.word-info-cache-manager .clear-btn {
		padding: 0.5em 1.2em;
		background: var(--color-danger, #c00);
		color: #fff;
		border: none;
		border-radius: 6px;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
	}
	.word-info-cache-manager .clear-btn:hover {
		background: var(--color-danger-hover, #a00);
	}
	.word-info-cache-manager .empty {
		color: var(--color-muted, #888);
		font-style: italic;
	}
</style>
