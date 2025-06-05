<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	type Profile = {
		id: number;
		username: string;
		email: string;
		bio?: string;
		avatar_url?: string;
	};

	let profiles: Profile[] = [];
	let error = '';
	let loading = true;
	let search = '';

	let filteredProfiles: Profile[] = [];

	onMount(async () => {
		const { data, error: fetchError } = await supabase
			.from('profiles')
			.select('*')
			.order('username', { ascending: true });

		if (fetchError) {
			error = fetchError.message;
		} else if (data) {
			profiles = data;
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
		color: #4f46e5;
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
		background: #f8fafc;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
	}
	.profiles-list {
		list-style: none;
		padding: 0;
		max-width: 500px;
		margin: 2rem auto;
	}
	.profiles-list li {
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.06);
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
		background: #e0e0e0;
		display: inline-block;
		box-shadow: 0 1px 4px rgba(99, 102, 241, 0.08);
	}
	.profile-avatar.fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #e0e0e0;
		color: #3730a3;
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
		color: #4f46e5;
		font-weight: 500;
		text-decoration: none;
		font-size: 1.13rem;
	}
	.profiles-list a:hover {
		text-decoration: underline;
	}
	.profiles-list small {
		color: #888;
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
