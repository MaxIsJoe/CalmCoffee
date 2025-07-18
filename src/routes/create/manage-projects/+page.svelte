<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';
	import type { Story } from '$lib/db/story';
	import { fetchStories } from '$lib/db/story';

	let projects: Story[] = [];
	let loading = true;
	let error = '';

	onMount(async () => {
		let userId: string | undefined;
		if ($user?.usr?.id) {
			userId = $user.usr.id;
		} else {
			const { data: userData } = await import('$lib/supabaseClient').then(m => m.supabase.auth.getUser());
			userId = userData.user?.id;
		}
		if (!userId) {
			error = 'You must be logged in.';
			loading = false;
			return;
		}
		try {
			const { stories } = await fetchStories({ currentPage: 1, itemsPerPage: 1000, is_published: false, creator: userId });
			projects = stories;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			projects = [];
		}
		loading = false;
	});

	function editProject(id: string) {
		goto(`/create/edit/${id}`);
	}
</script>

<h2>Manage Your Projects</h2>
<button
	on:click={() => goto('/create/new-project')}
	style="display:block;margin:1rem auto 2rem auto;">+ New Project</button
>
{#if loading}
	<p>Loading...</p>
{:else if error}
	<p style="color:red">{error}</p>
{:else if projects.length === 0}
	<p>No projects found. <a href="/create/new-project">Create one</a>.</p>
{:else}
	<ul>
		{#each projects as project}
			<li>
				<strong>{project.title}</strong> ({project.age_rating})<br />
				<small>{project.description}</small><br />
				<button on:click={() => editProject(project.id)}>Edit</button>
			</li>
		{/each}
	</ul>
{/if}

<style>
	/* filepath: f:\projects\websites\CalmCaf\calm-coffee\src\routes\create\manage-projects\+page.svelte */
	h2 {
		text-align: center;
		margin-top: 2rem;
		color: var(--color-primary);
	}
	ul {
		list-style: none;
		padding: 0;
		max-width: 600px;
		margin: 2rem auto;
	}
	li {
		background: var(--color-card-bg);
		border-radius: 8px;
		box-shadow: 0 2px 8px var(--color-card-shadow);
		padding: 1.2rem 1.5rem;
		margin-bottom: 1.2rem;
	}
	strong {
		font-size: 1.1rem;
		color: var(--color-text);
	}
	small {
		color: var(--color-primary);
	}
	button {
		background: var(--color-accent);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 4px;
		padding: 0.5rem 1.2rem;
		margin-top: 0.7rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	button:hover {
		background: var(--color-primary);
	}
	p[style*='color:red'] {
		text-align: center;
		font-weight: bold;
	}
	p {
		text-align: center;
	}
	a {
		color: var(--color-link);
		text-decoration: underline;
	}
	a:hover {
		color: var(--color-primary);
	}
</style>
