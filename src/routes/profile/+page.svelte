<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchAllProfiles } from '$lib/db/profile';
	import type { Profile } from '$lib/db/profile';

	let profiles: Profile[] = [];
	let error: string = '';
	let loading: boolean = true;
	let search: string = '';

	let filteredProfiles: Profile[] = [];

	onMount(async () => {
		try {
			profiles = await fetchAllProfiles();
		} catch (e) {
			error = (e as Error).message;
		}
		loading = false;
	});

	$: filteredProfiles =
		search.trim().length === 0
			? profiles
			: profiles.filter((p) => p.username.toLowerCase().includes(search.trim().toLowerCase()));
</script>

<h2>All Profiles</h2>
<div class="profile-search-bar">
	<input type="text" placeholder="Search users..." bind:value={search} autocomplete="off" />
</div>
{#if loading}
	<p>Loading...</p>
{:else if error}
	<p style="color:red">{error}</p>
{:else if filteredProfiles.length === 0}
	<p>No profiles found.</p>
{:else}
	<ul class="profiles-list">
		{#each filteredProfiles as profile}
			<li>
				{#if profile.avatar_url}
					<img class="profile-avatar" src={profile.avatar_url} alt="avatar" />
				{:else}
					<div class="profile-avatar fallback">{profile.username.charAt(0).toUpperCase()}</div>
				{/if}
				<div class="profile-list-info">
					<a href={`/profile/${profile.username}`}>{profile.username}</a>
					{#if profile.bio}
						<br /><small>{profile.bio}</small>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	h2 {
		text-align: center;
		margin-top: 2rem;
		color: var(--color-link);
	}
	.profile-search-bar {
		max-width: 500px;
		margin: 1.2rem auto 0 auto;
		text-align: center;
	}
	.profile-search-bar input[type='text'] {
		width: 100%;
		max-width: 340px;
		padding: 0.6rem 1rem;
		border-radius: 8px;
		border: 1.5px solid #cbd5e1;
		font-size: 1.07rem;
		background: var(--color-bg-alt);
		box-shadow: 0 1px 4px var(--color-card-shadow);
	}
	.profiles-list {
		list-style: none;
		padding: 0;
		max-width: 500px;
		margin: 2rem auto;
	}
	.profiles-list li {
		background: var(--color-card-bg);
		border-radius: 8px;
		box-shadow: 0 2px 8px var(--color-card-shadow);
		padding: 1.1rem 1.5rem;
		margin-bottom: 1.1rem;
		font-size: 1.08rem;
		display: flex;
		align-items: center;
		gap: 1.1rem;
	}
	.profile-avatar {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		object-fit: cover;
		background: var(--color-secondary);
		display: inline-block;
		box-shadow: 0 1px 4px var(--color-card-shadow);
	}
	.profile-avatar.fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-secondary);
		color: var(--color-link);
		font-weight: bold;
		font-size: 1.25rem;
		width: 44px;
		height: 44px;
		border-radius: 50%;
	}
	.profile-list-info {
		flex: 1;
		min-width: 0;
	}
	.profiles-list a {
		color: var(--color-link);
		font-weight: 500;
		text-decoration: none;
		font-size: 1.13rem;
	}
	.profiles-list a:hover {
		text-decoration: underline;
	}
	.profiles-list small,
	.muted {
		color: var(--color-secondary);
		font-size: 0.97em;
	}
	p[style*='color:red'] {
		text-align: center;
		font-weight: bold;
	}
	p {
		text-align: center;
	}
</style>
