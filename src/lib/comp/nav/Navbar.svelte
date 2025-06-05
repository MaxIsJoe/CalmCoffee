<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user as userStore } from '$lib/stores/user';

	let username: string | null = null;
	let avatarUrl: string | null = null;
	let dropdownOpen = false;
	let navSearchTerm = '';

	/*
	account_id: string
    avatar_url: string | null
    bd: string | null
    bio: string | null
    created_at: string
    email: string
    id: number
    is_active: boolean
    username: string
    works: string[] | null
	*/

	async function GetUserProfile(account_id: string) {
		return await supabase
			.from('profiles')
			.select(
				'username, avatar_url, account_id, email, bd, bio, created_at, email, id, is_active, works'
			)
			.eq('account_id', account_id)
			.single();
	}

	async function RefreshStore() {
		const { data } = await supabase.auth.getUser();
		const supaUser = data.user;
		if (supaUser) {
			const { data: profile } = await GetUserProfile(supaUser.id);
			if (profile) {
				userStore.set({ usr: supaUser, profile: profile });
			}
		} else {
			userStore.set(null);
		}
	}

	// Sync user store with supabase session
	onMount(async () => {
		await RefreshStore();
		// Listen for auth changes
		supabase.auth.onAuthStateChange(async (_event, session) => {
			const supaUser = session?.user ?? null;
			if (supaUser) {
				RefreshStore();
			} else {
				userStore.set(null);
			}
		});
	});

	$userStore; // subscribe for reactivity

	$: username = $userStore?.profile?.username ?? null;
	$: avatarUrl = $userStore?.profile?.avatar_url ?? null;

	async function logout() {
		await supabase.auth.signOut();
		userStore.set(null);
		goto('/account/login');
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}
	function closeDropdown() {
		dropdownOpen = false;
	}

	function navSearch() {
		if (navSearchTerm.trim()) {
			goto(`/search?tag=${encodeURIComponent(navSearchTerm.trim())}`);
			navSearchTerm = '';
		}
	}
</script>

<nav>
	<div class="nav-left">
		<a href="/" class="logo" data-sveltekit-reload>CalmCoffee</a>
		<a href="/read" data-sveltekit-reload>Stories</a>
		<a href="/blog" data-sveltekit-reload>Microblogs</a>
		<a href="/characters" data-sveltekit-reload>Characters</a>
	</div>
	<div class="nav-right">
		<div class="nav-search-bar">
			<input
				type="text"
				placeholder="Search tags..."
				bind:value={navSearchTerm}
				on:keydown={(e) => {
					if (e.key === 'Enter') navSearch();
				}}
			/>
			<button on:click={navSearch} aria-label="Search">
				<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
					<circle cx="9" cy="9" r="7" stroke="#7c5e48" stroke-width="2" />
					<path d="M15 15L18 18" stroke="#7c5e48" stroke-width="2" stroke-linecap="round" />
				</svg>
			</button>
		</div>
		{#if $userStore}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div class="user-dropdown" tabindex="0" on:blur={closeDropdown}>
				<button class="user-btn" on:click={toggleDropdown} aria-label="User menu">
					{#if avatarUrl}
						<img class="avatar" src={avatarUrl} alt="avatar" />
					{:else}
						<div class="avatar avatar-fallback">
							{username ? username.charAt(0).toUpperCase() : '?'}
						</div>
					{/if}
					<span class="username">{username}</span>
					<svg class="chevron" width="18" height="18" viewBox="0 0 20 20" fill="none">
						<path
							d="M6 8l4 4 4-4"
							stroke="#3730a3"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				{#if dropdownOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="dropdown-menu" on:mousedown|preventDefault>
						<div class="dropdown-header">
							{#if avatarUrl}
								<img class="avatar" src={avatarUrl} alt="avatar" />
							{:else}
								<div class="avatar avatar-fallback">
									{username ? username.charAt(0).toUpperCase() : '?'}
								</div>
							{/if}
							<div>
								<div class="dropdown-username">{username}</div>
								<div class="dropdown-email">{$userStore.usr?.email}</div>
							</div>
						</div>
						<a href={`/profile/${username}`} class="dropdown-link" on:click={closeDropdown}
							>Profile</a
						>
						<a href="/settings" class="dropdown-link" on:click={closeDropdown}>Settings</a>
						<button class="dropdown-link logout" on:click={logout}>Logout</button>
					</div>
				{/if}
			</div>
		{:else}
			<a href="/account/login" data-sveltekit-reload>Login</a>
		{/if}
	</div>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background: #f5f5f5;
		border-bottom: 1px solid #ddd;
	}
	.nav-left a.logo {
		font-weight: bold;
		margin-right: 1.5rem;
		text-decoration: none;
		color: #333;
	}
	.nav-left a,
	.nav-right a {
		margin-right: 1rem;
		text-decoration: none;
		color: #333;
	}
	.user-dropdown {
		position: relative;
		display: inline-block;
	}
	.user-btn {
		display: flex;
		align-items: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.2rem 0.7rem 0.2rem 0.2rem;
		border-radius: 6px;
		transition:
			background 0.15s,
			box-shadow 0.15s;
		box-shadow: none;
		outline: none;
	}
	.user-btn:hover,
	.user-btn:focus {
		background: #e0e7ff;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.09);
	}
	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
		margin-right: 0.7em;
		background: #e0e0e0;
		display: inline-block;
		box-shadow: 0 1px 4px rgba(99, 102, 241, 0.08);
	}
	.avatar-fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #e0e0e0;
		color: #3730a3;
		font-weight: bold;
		font-size: 1.1rem;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		margin-right: 0.7em;
		box-shadow: 0 1px 4px rgba(99, 102, 241, 0.08);
	}
	.username {
		font-weight: 500;
		color: #3730a3;
		margin-right: 0.4em;
	}
	.chevron {
		transition: transform 0.15s;
	}
	.user-btn[aria-expanded='true'] .chevron,
	.user-dropdown:focus .chevron,
	.user-btn:focus .chevron {
		transform: rotate(180deg);
	}
	.dropdown-menu {
		position: absolute;
		right: 0;
		top: 110%;
		background: #fff;
		border-radius: 12px;
		box-shadow:
			0 8px 32px rgba(99, 102, 241, 0.18),
			0 1.5px 8px rgba(0, 0, 0, 0.07);
		min-width: 260px;
		padding: 0.7em 0;
		z-index: 100;
		display: flex;
		flex-direction: column;
		animation: dropdown-fade-in 0.18s cubic-bezier(0.4, 1.4, 0.6, 1) both;
	}
	@keyframes dropdown-fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	.dropdown-header {
		display: flex;
		align-items: center;
		gap: 0.7em;
		padding: 0.7em 1.2em 0.5em 1.2em;
		border-bottom: 1px solid #e0e7ff;
		margin-bottom: 0.3em;
		background: #f8fafc;
		border-radius: 12px 12px 0 0;
	}
	.dropdown-username {
		font-weight: 600;
		color: #3730a3;
		font-size: 1.08em;
	}
	.dropdown-email {
		font-size: 0.92em;
		color: #888;
		word-break: keep-all;
	}
	.dropdown-link {
		background: none;
		border: none;
		color: #3730a3;
		text-align: left;
		padding: 0.7em 1.2em;
		font-size: 1.05em;
		cursor: pointer;
		text-decoration: none;
		transition:
			background 0.13s,
			color 0.13s;
		border-radius: 0;
	}
	.dropdown-link:hover,
	.dropdown-link:focus {
		background: #e0e7ff;
		color: #4f46e5;
	}
	.dropdown-link.logout {
		color: #b91c1c;
		font-weight: 500;
	}
	.dropdown-link.logout:hover,
	.dropdown-link.logout:focus {
		background: #fee2e2;
		color: #b91c1c;
	}
	@media (max-width: 600px) {
		.dropdown-menu {
			min-width: 170px;
			right: 0;
			left: auto;
		}
		.nav-search-bar input[type='text'] {
			width: 80px;
			font-size: 0.95em;
		}
	}
	.nav-right {
		display: flex;
		align-items: center;
		gap: 1.2em;
	}
	.nav-search-bar {
		display: flex;
		align-items: center;
		gap: 0.3em;
		margin-right: 0.7em;
	}
	.nav-search-bar input[type='text'] {
		padding: 0.35em 0.8em;
		border-radius: 5px;
		border: 1px solid #e0d7ce;
		font-size: 1em;
		background: #fffdfa;
		width: 140px;
		transition: border 0.15s;
	}
	.nav-search-bar input[type='text']:focus {
		border: 1.5px solid #a67c52;
		outline: none;
	}
	.nav-search-bar button {
		background: #ede9e3;
		border: none;
		border-radius: 5px;
		padding: 0.3em 0.6em;
		cursor: pointer;
		display: flex;
		align-items: center;
		transition: background 0.15s;
	}
	.nav-search-bar button:hover {
		background: #e0d7ce;
	}
	.nav-search-bar svg {
		display: block;
	}
	.nav-right button {
		background: #f0d4a1;
		color: #fff;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}
	.nav-right button:hover {
		background: #bb9a7a;
	}
</style>
