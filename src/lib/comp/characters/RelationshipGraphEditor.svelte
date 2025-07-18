<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Database } from '../../../../database.types';
	import { fetchCharacters } from '$lib/db/characters';
	import AvatarPlaceholder from '$lib/comp/common/AvatarPlaceholder.svelte';

	// Import itself for recursive use
	import RelationshipGraphEditor from './RelationshipGraphEditor.svelte';

	const self = this;
	export let graph: any = { nodes: [], edges: [] };
	export let character: Database['public']['Tables']['characters']['Row'] | null = null;
	export let owner: boolean = false;
	export let minimal: boolean = false;

	const dispatch = createEventDispatcher();

	let searchInputEl: HTMLInputElement;
	let allCharacters: { id: string; name: string; avatar: string }[] = [];
	let showSearch = false;
	let search = '';
	let searchResults: { id: string; name: string; avatar: string }[] = [];
	let draggingNodeId: string | null = null;
	let dragOffset = { x: 0, y: 0 };
	let edgeStart: string | null = null;
	let edgeEnd: string | null = null;
	let newEdgeLabel = '';

	let connectingFrom: string | null = null;
	let pendingEdgeTo: string | null = null;
	let pendingEdgeLabel = '';
	let showEdgeLabelModal = false;

	let zoom = 1;
	let minZoom = 0.4;
	let maxZoom = 2.5;
	let showFullGraphModal = false;

	let pan = { x: 0, y: 0 };
	let isPanning = false;
	let panStart = { x: 0, y: 0 };
	let panOrigin = { x: 0, y: 0 };

	let graphViewVersion = 0;

	let searchLoading = false;

	function zoomIn() {
		zoom = Math.min(maxZoom, zoom * 1.2);
		graphViewVersion++;
	}

	function zoomOut() {
		zoom = Math.max(minZoom, zoom * 0.8);
		graphViewVersion++;
	}

	function resetZoom() {
		zoom = 1;
		graphViewVersion++;
	}

	// Only load graph state from character.relations if available
	onMount(() => {
		if (character?.relations) {
			try {
				const parsed =
					typeof character.relations === 'string'
						? JSON.parse(character.relations)
						: character.relations;
				if (parsed && typeof parsed === 'object') {
					graph.nodes = parsed.nodes ?? [];
					graph.edges = parsed.edges ?? [];
				}
			} catch (e) {
				console.warn('Failed to parse character.relations JSON', e);
			}
		}
		console.log('mainCharacter:', character);
	});

	// Ensure main node is present and updated with correct info
	$: {
		const idx = graph.nodes.findIndex((n: any) => n.id === character?.id);
		if (character?.id) {
			const main = allCharacters.find((c) => String(c.id) === String(character?.id));
			const mainNode = {
				id: character?.id,
				label: character?.character_name,
				avatar: character?.character_avatar || '',
				x: 250,
				y: 200,
				isMain: true
			};
			if (idx === -1) {
				graph.nodes = [mainNode, ...graph.nodes];
			} else {
				graph.nodes[idx] = { ...graph.nodes[idx], ...mainNode };
			}
		}
	}

	function openSearch() {
		showSearch = true;
		search = '';
		searchResults = [];
		// Focus input after DOM update
		setTimeout(() => {
			searchInputEl?.focus();
		}, 0);
	}

	async function handleSearchInput(e: Event) {
		search = (e.target as HTMLInputElement).value;
		if (search.length > 1) {
			searchLoading = true;
			try {
				const { characters } = await fetchCharacters({ search, itemsPerPage: 20 });
				console.log(characters);
				searchResults = (characters ?? []).map((c: any) => ({
					id: c.id,
					name: c.character_name,
					avatar: c.character_avatar
				}));
			} catch (error) {
				searchResults = [];
			}
			searchLoading = false;
		} else {
			searchResults = [];
		}
	}

	function selectCharacter(char: { id: string; name: string; avatar: string }) {
		const node = {
			id: char.id,
			label: char.name,
			avatar: char.avatar,
			x: Math.random() * 400 + 50,
			y: Math.random() * 300 + 50,
			edges: []
		};
		graph.nodes.push(node);
		showSearch = false;
		search = '';
		searchResults = [];
		dispatch('change', graph);
	}

	function startDrag(nodeId: string, event: MouseEvent) {
		draggingNodeId = nodeId;
		const node = graph.nodes.find((n: any) => n.id === nodeId);
		if (node) {
			dragOffset.x = event.clientX - node.x;
			dragOffset.y = event.clientY - node.y;
		}
	}

	function onMouseMove(event: MouseEvent) {
		if (draggingNodeId) {
			const node = graph.nodes.find((n: any) => n.id === draggingNodeId);
			if (node) {
				node.x = event.clientX - dragOffset.x;
				node.y = event.clientY - dragOffset.y;
				dispatch('change', graph);
			}
		}
	}

	function onMouseUp() {
		draggingNodeId = null;
	}

	function startEdge(nodeId: string) {
		edgeStart = nodeId;
	}

	function endEdge(nodeId: string) {
		if (edgeStart && edgeStart !== nodeId) {
			graph.edges = graph.edges || [];
			graph.edges.push({ from: edgeStart, to: nodeId, label: newEdgeLabel });
			dispatch('change', graph);
			newEdgeLabel = '';
		}
		edgeStart = null;
	}

	function removeNode(nodeId: string) {
		graph.nodes = graph.nodes.filter((n: any) => n.id !== nodeId);
		graph.edges = (graph.edges ?? []).filter((e: any) => e.from !== nodeId && e.to !== nodeId);
		dispatch('change', graph);
	}

	function removeEdge(from: string, to: string) {
		graph.edges = (graph.edges ?? []).filter((e: any) => !(e.from === from && e.to === to));
		dispatch('change', graph);
	}

	// Relationship panel logic
	$: relationshipTypes = Array.from(
		new Set(
			(graph.edges ?? [])
				.filter((e: any) => e.from === character?.id)
				.map((e: any) => e.label)
				.filter(Boolean)
		)
	);

	$: relationshipsByType = {};
	if (relationshipTypes && graph.edges && graph.nodes && character?.id) {
		for (const type of relationshipTypes) {
			relationshipsByType[type] = graph.edges
				.filter((e: any) => e.label === type && e.from === character.id)
				.map((e: any) => graph.nodes.find((n: any) => n.id === e.to))
				.filter(Boolean);
		}
	}

	function startConnect(nodeId: string) {
		connectingFrom = nodeId;
	}

	function finishConnect(nodeId: string) {
		if (connectingFrom && connectingFrom !== nodeId) {
			pendingEdgeTo = nodeId;
			pendingEdgeLabel = '';
			showEdgeLabelModal = true;
		}
	}

	function confirmEdgeLabel() {
		if (connectingFrom && pendingEdgeTo) {
			graph.edges = graph.edges || [];
			graph.edges.push({ from: connectingFrom, to: pendingEdgeTo, label: pendingEdgeLabel });
			dispatch('change', graph);
		}
		connectingFrom = null;
		pendingEdgeTo = null;
		pendingEdgeLabel = '';
		showEdgeLabelModal = false;
	}

	function cancelEdgeLabel() {
		connectingFrom = null;
		pendingEdgeTo = null;
		pendingEdgeLabel = '';
		showEdgeLabelModal = false;
	}

	function onPanMouseDown(event: MouseEvent) {
		// Only start panning if not dragging a node
		if (!draggingNodeId && event.button === 0) {
			isPanning = true;
			panStart = { x: event.clientX, y: event.clientY };
			panOrigin = { ...pan };
			event.preventDefault();
		}
	}

	function onPanMouseMove(event: MouseEvent) {
		if (isPanning) {
			pan.x = panOrigin.x + (event.clientX - panStart.x);
			pan.y = panOrigin.y + (event.clientY - panStart.y);
			graphViewVersion++;
		}
	}

	function onPanMouseUp() {
		isPanning = false;
	}

	// Attach global mousemove/mouseup for dragging
	onMount(() => {
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
		// Add pan listeners
		window.addEventListener('mousemove', onPanMouseMove);
		window.addEventListener('mouseup', onPanMouseUp);
	});
</script>

{#if minimal}
	<!-- Minimal mode: Only show relationship types and members, with a button to open full graph -->
	<div class="relationship-types-panel minimal">
		<div style="display:flex;align-items:center;justify-content:space-between;">
			<h3 style="margin-bottom:0;">Relationships</h3>
			<!-- Use a wrapper to avoid Svelte recursive component issues -->
			<button
				class="open-graph-btn"
				on:click={() => {
					showFullGraphModal = true;
				}}
			>
				Open Graph
			</button>
		</div>
		{#if relationshipTypes.length === 0}
			<div class="empty-types">No relationships yet.</div>
		{:else}
			{#each relationshipTypes as type}
				<div class="relationship-type-group">
					<div class="type-label">{type}</div>
					<ul>
						{#each graph.edges.filter((e) => e.label === type) as edge}
							{#if graph.nodes.find((n) => n.id === edge.to)}
								{@const rel = graph.nodes.find((n) => n.id === edge.to)}
								<li class="type-character">
									<!-- svelte-ignore a11y_missing_attribute -->
									{#if rel.avatar}
										<img src={rel.avatar} class="type-avatar" />
									{:else}
										<div class="type-avatar">
											<AvatarPlaceholder minSize="4px" />
										</div>
									{/if}
									<span>{rel.label}</span>
								</li>
							{/if}
						{/each}
					</ul>
				</div>
			{/each}
		{/if}
	</div>
	{#if showFullGraphModal}
		<svelte:component this={self} {graph} {character} {owner} minimal={false} />
		<div class="full-graph-modal">
			<div class="full-graph-modal-content">
				<button class="close-modal-btn" on:click={() => (showFullGraphModal = false)}>✕</button>
				<!-- Render full graph in modal, pass minimal={false} -->
				<RelationshipGraphEditor {graph} {character} {owner} minimal={false} />
			</div>
		</div>
	{/if}
{:else}
	<!-- ...existing full graph editor code... -->
	<div class="relationship-graph-editor">
		<h2>Relationships</h2>
		{#if owner}
			<div style="margin-bottom:1rem;">
				<button type="button" on:click={openSearch}>Add Character</button>
			</div>
		{/if}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="graph-layout">
			<div class="graph-area" style="position:relative;width:100%;height:500px;">
				<!-- Zoom controls -->
				<div class="zoom-controls">
					<button on:click={zoomOut} aria-label="Zoom out">-</button>
					<span>{Math.round(zoom * 100)}%</span>
					<button on:click={zoomIn} aria-label="Zoom in">+</button>
					<button
						on:click={resetZoom}
						aria-label="Reset zoom"
						title="Reset zoom"
						style="margin-left:0.5rem;">⟳</button
					>
				</div>
				<div
					class="graph-zoom-container"
					style="width:100%;height:500px;overflow:visible;position:relative;touch-action:none;transform:translate({pan.x}px, {pan.y}px) scale({zoom});transform-origin:0 0;"
					on:mousedown={onPanMouseDown}
				>
					{#key graphViewVersion}
						<svg width="100%" height="500" style="position:absolute;top:0;left:0;z-index:1;">
							{#each graph.edges as edge}
								{#if graph.nodes.find((n) => n.id === edge.from) && graph.nodes.find((n) => n.id === edge.to)}
									<line
										x1={graph.nodes.find((n) => n.id === edge.from).x + 60}
										y1={graph.nodes.find((n) => n.id === edge.from).y + 30}
										x2={graph.nodes.find((n) => n.id === edge.to).x + 60}
										y2={graph.nodes.find((n) => n.id === edge.to).y + 30}
										stroke="#888"
										stroke-width="2"
									/>
									<text
										x={(graph.nodes.find((n) => n.id === edge.from).x +
											graph.nodes.find((n) => n.id === edge.to).x) /
											2 +
											60}
										y={(graph.nodes.find((n) => n.id === edge.from).y +
											graph.nodes.find((n) => n.id === edge.to).y) /
											2 +
											30 -
											5}
										font-size="12"
										fill="#444"
										text-anchor="middle"
									>
										{edge.label}
									</text>
								{/if}
							{/each}
						</svg>
					{/key}
					{#key graphViewVersion}
						{#each graph.nodes as node}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="node {node.id === character?.id ? 'main-node' : ''} {connectingFrom ===
								node.id
									? 'connecting'
									: ''}"
								style="left:{node.x}px;top:{node.y}px;"
								on:mousedown={owner ? (e) => startDrag(node.id, e) : undefined}
								on:dblclick={owner ? () => startEdge(node.id) : undefined}
								on:mouseup={owner && connectingFrom && connectingFrom !== node.id
									? () => finishConnect(node.id)
									: undefined}
							>
								{#if node.id === character?.id}
									{#if character?.character_avatar}
										<img
											src={character?.character_avatar}
											alt={character?.character_avatar}
											class="node-avatar"
										/>
									{:else}
										<AvatarPlaceholder class="node-avatar" />
									{/if}
									<div class="node-label main-label">{character?.character_name}</div>
								{:else}
									{#if node.avatar}
										<img src={node.avatar} alt={node.label} class="node-avatar" />
									{:else}
										<AvatarPlaceholder class="node-avatar" />
									{/if}
									<div class="node-label">{node.label}</div>
								{/if}
								{#if owner && node.id !== character?.id}
									<button class="remove-node" type="button" on:click={() => removeNode(node.id)}
										>✕</button
									>
								{/if}
								{#if owner && node.id === character?.id}
									<button
										class="connect-btn"
										type="button"
										disabled={!!connectingFrom}
										on:click={() => startConnect(node.id)}
										style="margin-top:0.3rem;"
									>
										{connectingFrom === node.id ? 'Click target...' : 'Connect'}
									</button>
								{/if}
							</div>
						{/each}
					{/key}
					{#if showEdgeLabelModal}
						<div class="edge-label-modal">
							<div>
								<label>Relationship label:</label>
								<input
									type="text"
									bind:value={pendingEdgeLabel}
									placeholder="e.g. friend, sibling..."
									autofocus
								/>
							</div>
							<div style="margin-top:0.7rem;">
								<button on:click={confirmEdgeLabel}>OK</button>
								<button on:click={cancelEdgeLabel} style="margin-left:0.5rem;">Cancel</button>
							</div>
						</div>
					{/if}
				</div>
				<!-- Place search modal here, outside of pan/zoom container -->
				{#if showSearch}
					<div class="search-modal">
						<input
							type="text"
							bind:this={searchInputEl}
							bind:value={search}
							on:input={handleSearchInput}
							placeholder="Search character..."
							autocomplete="off"
						/>
						{#if searchLoading}
							<div class="search-loading">Searching...</div>
						{:else}
							<ul>
								{#each searchResults as char}
									<li>
										<button on:click={() => selectCharacter(char)}>
											{#if char.avatar}
												<img
													src={char.avatar}
													class="type-avatar"
													style="margin-right:0.5em;vertical-align:middle;"
												/>
											{:else}
												<AvatarPlaceholder
													class="type-avatar"
													style="margin-right:0.5em;vertical-align:middle;"
												/>
											{/if}
											{char.name}
										</button>
									</li>
								{/each}
							</ul>
						{/if}
						<button type="button" on:click={() => (showSearch = false)}>Cancel</button>
					</div>
				{/if}
			</div>
			<!-- Relationship types panel -->
			<div class="relationship-types-panel">
				<h3>Relationship Types</h3>
				{#if relationshipTypes.length === 0}
					<div class="empty-types">No relationships yet.</div>
				{:else}
					{#each relationshipTypes as type}
						<div class="relationship-type-group">
							<div class="type-label">{type}</div>
							<ul>
								{#each graph.edges.filter((e) => e.label === type) as edge}
									{#if graph.nodes.find((n) => n.id === edge.to)}
										{@const rel = graph.nodes.find((n) => n.id === edge.to)}
										<li class="type-character">
											<!-- svelte-ignore a11y_missing_attribute -->
											{#if rel.avatar}
												<img src={rel.avatar} class="type-avatar" />
											{:else}
												<AvatarPlaceholder class="type-avatar" />
											{/if}
											<span>{rel.label}</span>
											{#if owner}
												<button
													class="remove-rel-btn"
													title="Remove relationship"
													on:click={() => removeEdge(edge.from, edge.to)}>✕</button
												>
											{/if}
										</li>
									{/if}
								{/each}
							</ul>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.relationship-graph-editor {
		margin-top: 2.5rem;
		background: var(--color-card-bg);
		border-radius: 12px;
		padding: 1.5rem 1.2rem;
		box-shadow: 0 2px 8px var(--color-card-shadow);
	}
	.relationship-graph-editor h2 {
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--color-link);
		margin-bottom: 1rem;
	}
	.graph-layout {
		display: flex;
		gap: 2.5rem;
	}
	.graph-area {
		background: var(--color-bg-alt);
		border-radius: 8px;
		box-shadow: 0 1px 4px var(--color-card-shadow);
		overflow: hidden;
		flex: 1 1 0%;
		min-width: 0;
	}
	.node {
		cursor: grab;
		user-select: none;
		position: absolute;
		padding: 8px 16px;
		background: var(--color-bg-alt);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		box-shadow: 2px 2px 6px var(--color-card-shadow);
		z-index: 2;
		min-width: 120px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.node.main-node {
		border: 2.5px solid var(--color-link);
		background: var(--color-bg-hover);
	}
	.node.connecting {
		box-shadow: 0 0 0 3px var(--color-accent);
	}
	.node-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
		margin-bottom: 0.4rem;
	}
	.node-avatar-placeholder {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--color-bg-hover);
		margin-bottom: 0.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.node-label {
		font-weight: 500;
		font-size: 1rem;
		margin-bottom: 0.3rem;
	}
	.node-label.main-label {
		font-weight: 600;
		font-size: 1.08rem;
	}
	.remove-node {
		position: absolute;
		top: 2px;
		right: 2px;
		background: var(--color-danger);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 50%;
		width: 22px;
		height: 22px;
		cursor: pointer;
		font-size: 1rem;
	}
	.connect-btn {
		padding: 0.2rem 0.7rem;
		border-radius: 6px;
		border: none;
		background: var(--color-accent);
		color: var(--color-primary-alt);
		cursor: pointer;
		font-size: 0.95rem;
	}
	.connect-btn[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.edge-label-input {
		margin-top: 0.3rem;
	}
	.edges-list {
		margin-top: 0.4rem;
		font-size: 0.95rem;
	}
	.edge-item {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.search-modal {
		position: absolute;
		top: 40px;
		left: 20px;
		background: var(--color-card-bg);
		border: 1px solid var(--color-border);
		padding: 16px;
		z-index: 1001; /* ensure above graph */
		box-shadow: 0 2px 12px var(--color-card-shadow);
		border-radius: 8px;
		min-width: 220px;
	}
	.search-modal input[type='text'] {
		width: 100%;
		padding: 0.4rem 0.6rem;
		margin-bottom: 0.7rem;
		border-radius: 5px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		color: var(--color-text);
		font-size: 1rem;
	}
	.search-modal ul {
		list-style: none;
		padding: 0;
		margin: 0 0 0.7rem 0;
		max-height: 180px;
		overflow-y: auto;
	}
	.search-modal li {
		margin-bottom: 0.3rem;
	}
	.search-modal button[type='button'] {
		background: var(--color-secondary);
		color: var(--color-primary);
		border: none;
		border-radius: 5px;
		padding: 0.3rem 0.9rem;
		font-size: 1rem;
		cursor: pointer;
	}
	.search-modal button[type='button']:hover {
		background: var(--color-accent);
		color: var(--color-primary-alt);
	}
	.search-modal ul button {
		background: var(--color-link);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 5px;
		padding: 0.3rem 0.9rem;
		font-size: 1rem;
		cursor: pointer;
		width: 100%;
		text-align: left;
	}
	.search-modal ul button:hover {
		background: var(--color-link-hover);
	}
	.edge-label-modal {
		position: absolute;
		top: 120px;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-card-bg);
		border: 1px solid var(--color-border);
		padding: 22px 28px;
		z-index: 20;
		border-radius: 10px;
		box-shadow: 0 2px 12px var(--color-card-shadow);
	}
	.relationship-types-panel {
		width: 260px;
		background: var(--color-bg-hover);
		border-radius: 8px;
		box-shadow: 0 1px 4px var(--color-card-shadow);
		padding: 1.1rem 1.2rem;
		overflow-y: auto;
		max-height: 500px;
	}
	.relationship-types-panel.minimal {
		width: 100%;
		max-width: 420px;
		background: var(--color-bg-hover);
		border-radius: 8px;
		box-shadow: 0 1px 4px var(--color-card-shadow);
		padding: 1.1rem 1.2rem;
		overflow-y: auto;
		max-height: 500px;
	}
	.relationship-types-panel h3 {
		font-size: 1.08rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--color-link);
	}
	.relationship-type-group {
		margin-bottom: 1.1rem;
	}
	.type-label {
		font-weight: 500;
		color: var(--color-link);
		margin-bottom: 0.4rem;
	}
	.type-character {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.2rem;
	}
	.type-avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		object-fit: cover;
	}
	.empty-types {
		color: var(--color-secondary);
		font-size: 0.98rem;
	}
	.remove-rel-btn {
		margin-left: 0.5rem;
		background: var(--color-danger);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		cursor: pointer;
		font-size: 1rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.remove-rel-btn:hover {
		background: var(--color-danger-hover);
	}
	.zoom-controls {
		position: absolute;
		top: 10px;
		left: 10px;
		z-index: 10;
		background: var(--color-bg-hover);
		border-radius: 6px;
		box-shadow: 0 1px 4px var(--color-card-shadow);
		padding: 0.3rem 0.7rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.zoom-controls button {
		background: var(--color-link);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 4px;
		width: 28px;
		height: 28px;
		font-size: 1.2rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.zoom-controls button:hover {
		background: var(--color-link-hover);
	}
	.zoom-controls span {
		font-size: 1rem;
		color: var(--color-text);
		width: 48px;
		text-align: center;
	}
	.graph-zoom-container {
		width: 100%;
		height: 500px;
		position: relative;
		overflow: visible;
		touch-action: none;
		/* Remove transform here, now set inline */
	}
	/* Optionally, show a "grabbing" cursor when panning */
	.graph-zoom-container:active {
		cursor: grabbing;
	}
	.open-graph-btn {
		background: var(--color-link);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 6px;
		padding: 0.3rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.15s;
		margin-left: 1rem;
	}
	.open-graph-btn:hover {
		background: var(--color-link-hover);
	}
	.full-graph-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(30, 34, 54, 0.18);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.full-graph-modal-content {
		background: var(--color-card-bg);
		border-radius: 12px;
		box-shadow: 0 2px 24px var(--color-card-shadow);
		padding: 2.2rem 2.2rem 1.2rem 2.2rem;
		position: relative;
		max-width: 1280px;
		width: 95vw;
		max-height: 90vh;
		overflow: auto;
	}
	.close-modal-btn {
		position: absolute;
		top: 14px;
		right: 18px;
		background: var(--color-danger);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 50%;
		width: 32px;
		height: 32px;
		font-size: 1.3rem;
		cursor: pointer;
	}
	.close-modal-btn:hover {
		background: var(--color-danger-hover);
	}
	.search-loading {
		color: var(--color-secondary);
		font-size: 1rem;
		margin-bottom: 0.5rem;
		text-align: center;
	}
</style>
