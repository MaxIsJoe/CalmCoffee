<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Database } from '$lib/types/database.types';

	let projects: Database['public']['Tables']['stories']['Row'][] = [];
	let loading = true;
	let error = '';

	onMount(async () => {
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			error = 'You must be logged in.';
			loading = false;
			return;
		}
		const { data, error: fetchError } = await supabase
			.from('stories')
			.select('*')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false });
		if (fetchError) {
			error = fetchError.message;
		} else {
			projects = data || [];
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
		color: #4b2e19;
	}
	ul {
		list-style: none;
		padding: 0;
		max-width: 600px;
		margin: 2rem auto;
	}
	li {
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		padding: 1.2rem 1.5rem;
		margin-bottom: 1.2rem;
	}
	strong {
		font-size: 1.1rem;
		color: #3e2723;
	}
	small {
		color: #6d4c41;
	}
	button {
		background: #a1887f;
		color: #fff;
		border: none;
		border-radius: 4px;
		padding: 0.5rem 1.2rem;
		margin-top: 0.7rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	button:hover {
		background: #6d4c41;
	}
	p[style*='color:red'] {
		text-align: center;
		font-weight: bold;
	}
	p {
		text-align: center;
	}
	a {
		color: #795548;
		text-decoration: underline;
	}
	a:hover {
		color: #3e2723;
	}
</style>
