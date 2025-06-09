<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user as userStore } from '$lib/stores/user';
	import type { Database } from '../../../../database.types';

	type Notification = Database['public']['Tables']['notifications']['Row'];

	let username: string | null = null;
	let avatarUrl: string | null = null;
	let dropdownOpen = false;
	let navSearchTerm = '';
	let notificationDropdownOpen = false;
	let notifications: Notification[] = [];
	let unreadCount = 0;
	let mobileMenuOpen = false;

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
				'username, avatar_url, account_id, email, bd, bio, created_at, email, id, is_active, works, interests'
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

	async function fetchNotifications() {
		if (!$userStore?.usr) return;

		const { data, error } = await supabase
			.from('notifications')
			.select('*')
			.eq('user_id', $userStore.usr.id)
			.eq('read', false)
			.order('created_at', { ascending: false })
			.limit(20);

		if (error) {
			console.error('Error fetching notifications:', error);
			return;
		}

		notifications = data;
		unreadCount = data.filter(n => !n.read).length;
	}

	function toggleNotificationDropdown() {
		notificationDropdownOpen = !notificationDropdownOpen;
		if (notificationDropdownOpen) {
			fetchNotifications();
		}
	}

	function closeNotificationDropdown() {
		notificationDropdownOpen = false;
	}

	// Subscribe to real-time notifications
	onMount(() => {
		let channel: any;

		async function setup() {
			await RefreshStore();
			await fetchNotifications();

			// Listen for auth changes
			supabase.auth.onAuthStateChange(async (_event, session) => {
				const supaUser = session?.user ?? null;
				if (supaUser) {
					RefreshStore();
					fetchNotifications();
				} else {
					userStore.set(null);
					notifications = [];
					unreadCount = 0;
				}
			});

			// Subscribe to notifications
			channel = supabase
				.channel('notifications')
				.on(
					'postgres_changes',
					{
						event: 'INSERT',
						schema: 'public',
						table: 'notifications',
						filter: `user_id=eq.${$userStore?.usr?.id}`
					},
					() => {
						fetchNotifications();
					}
				)
				.subscribe();
		}

		setup();

		return () => {
			if (channel) {
				channel.unsubscribe();
			}
		};
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

	function getNotificationIcon(type: string) {
		switch (type) {
			case 'comment':
				return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path d="M10 2C5.58172 2 2 5.58172 2 10C2 11.8728 2.64175 13.6052 3.75736 14.9645L2.5 17.5L5.03553 16.2426C6.39484 17.3582 8.12721 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>`;
			case 'watch_inform':
				return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M10 6V10L13 12" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>`;
			case 'like':
				return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path d="M10 17.5C10 17.5 17.5 12.5 17.5 7.5C17.5 4.5 15 2 12 2C10.5 2 9.5 2.5 8.5 3.5C7.5 2.5 6.5 2 5 2C2 2 0 4.5 0 7.5C0 12.5 7.5 17.5 10 17.5Z" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>`;
			default:
				return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path d="M10 17.5C10 17.5 17.5 12.5 17.5 7.5C17.5 4.5 15 2 12 2C10.5 2 9.5 2.5 8.5 3.5C7.5 2.5 6.5 2 5 2C2 2 0 4.5 0 7.5C0 12.5 7.5 17.5 10 17.5Z" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>`;
		}
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<nav>
	<div class="nav-left">
		<button class="mobile-menu-btn" on:click={toggleMobileMenu} aria-label="Toggle menu">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M3 12H21" stroke="#3730a3" stroke-width="2" stroke-linecap="round"/>
				<path d="M3 6H21" stroke="#3730a3" stroke-width="2" stroke-linecap="round"/>
				<path d="M3 18H21" stroke="#3730a3" stroke-width="2" stroke-linecap="round"/>
			</svg>
		</button>
		<a href="/" class="logo" data-sveltekit-reload>CalmCoffee</a>
		<div class="desktop-nav">
			<a href="/read" data-sveltekit-reload>Stories</a>
			<a href="/blog" data-sveltekit-reload>Microblogs</a>
			<a href="/characters" data-sveltekit-reload>Characters</a>
		</div>
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
			<div class="notification-dropdown" tabindex="0" on:blur={closeNotificationDropdown}>
				<button class="notification-btn" on:click={toggleNotificationDropdown} aria-label="Notifications">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path
							d="M10 2C7.23858 2 5 4.23858 5 7V10.5858L3.29289 12.2929C3.10536 12.4804 3 12.7348 3 13V14C3 14.5523 3.44772 15 4 15H16C16.5523 15 17 14.5523 17 14V13C17 12.7348 16.8946 12.4804 16.7071 12.2929L15 10.5858V7C15 4.23858 12.7614 2 10 2Z"
							stroke="#3730a3"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M7 15V16C7 17.1046 7.89543 18 9 18H11C12.1046 18 13 17.1046 13 16V15"
							stroke="#3730a3"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					{#if unreadCount > 0}
						<span class="notification-badge">{unreadCount}</span>
					{/if}
				</button>
				{#if notificationDropdownOpen}
					<div class="notification-menu">
						<div class="notification-header">
							<h3>Notifications</h3>
							<a href="/notifications" class="view-all">View all</a>
						</div>
						{#if notifications.length === 0}
							<div class="empty-notifications">No notifications</div>
						{:else}
							<div class="notification-list">
								{#each notifications as notification}
									<div class="notification-item">
										<div class="notification-icon" class:unread={!notification.read}>
											{@html getNotificationIcon(notification.type)}
										</div>
										<div class="notification-content">
											<p class="notification-message">{notification.message}</p>
											<time class="notification-time" datetime={notification.created_at}>
												{new Date(notification.created_at).toLocaleDateString()}
											</time>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
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
			<a href="/account/login" class="login-btn" data-sveltekit-reload>Login</a>
		{/if}
	</div>
</nav>

{#if mobileMenuOpen}
	<div class="mobile-menu" transition:slide={{ duration: 200 }}>
		<div class="mobile-menu-content">
			<a href="/read" on:click={closeMobileMenu} data-sveltekit-reload>Stories</a>
			<a href="/blog" on:click={closeMobileMenu} data-sveltekit-reload>Microblogs</a>
			<a href="/characters" on:click={closeMobileMenu} data-sveltekit-reload>Characters</a>
			{#if $userStore}
				<a href={`/profile/${username}`} on:click={closeMobileMenu}>Profile</a>
				<a href="/settings" on:click={closeMobileMenu}>Settings</a>
				<button class="mobile-logout" on:click={() => { closeMobileMenu(); logout(); }}>Logout</button>
			{:else}
				<a href="/account/login" on:click={closeMobileMenu} data-sveltekit-reload>Login</a>
			{/if}
		</div>
	</div>
{/if}

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
	.notification-dropdown {
		position: relative;
		margin-right: 1rem;
	}
	.notification-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 6px;
		position: relative;
		transition: background 0.15s;
	}
	.notification-btn:hover {
		background: #e0e7ff;
	}
	.notification-badge {
		position: absolute;
		top: 0;
		right: 0;
		background: #ef4444;
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.15rem 0.35rem;
		border-radius: 999px;
		transform: translate(50%, -50%);
	}
	.notification-menu {
		position: absolute;
		right: 0;
		top: 110%;
		background: white;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(99, 102, 241, 0.18), 0 1.5px 8px rgba(0, 0, 0, 0.07);
		width: 320px;
		z-index: 100;
		animation: dropdown-fade-in 0.18s cubic-bezier(0.4, 1.4, 0.6, 1) both;
	}
	.notification-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #e0e7ff;
	}
	.notification-header h3 {
		margin: 0;
		font-size: 1.1rem;
		color: #3730a3;
	}
	.view-all {
		color: #4f46e5;
		text-decoration: none;
		font-size: 0.9rem;
	}
	.view-all:hover {
		text-decoration: underline;
	}
	.empty-notifications {
		padding: 2rem;
		text-align: center;
		color: #666;
	}
	.notification-list {
		max-height: 400px;
		overflow-y: auto;
	}
	.notification-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid #f1f5f9;
	}
	.notification-item:last-child {
		border-bottom: none;
	}
	.notification-icon {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #eef2ff;
		border-radius: 8px;
		padding: 6px;
	}
	.notification-icon.unread {
		background: #e0e7ff;
	}
	.notification-content {
		flex-grow: 1;
	}
	.notification-message {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 0.95rem;
		line-height: 1.4;
	}
	.notification-time {
		color: #666;
		font-size: 0.8rem;
	}
	.mobile-menu-btn {
		display: none;
		background: none;
		border: none;
		padding: 0.5rem;
		cursor: pointer;
		margin-right: 1rem;
	}
	.desktop-nav {
		display: flex;
		gap: 1rem;
	}
	.mobile-menu {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
	}
	.mobile-menu-content {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 80%;
		max-width: 300px;
		background: white;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
	}
	.mobile-menu-content a {
		color: #3730a3;
		text-decoration: none;
		font-size: 1.1rem;
		padding: 0.5rem 0;
	}
	.mobile-logout {
		background: none;
		border: none;
		color: #b91c1c;
		text-align: left;
		font-size: 1.1rem;
		padding: 0.5rem 0;
		cursor: pointer;
	}
	.login-btn {
		padding: 0.5rem 1rem;
		background: #f0d4a1;
		color: #fff;
		border-radius: 4px;
		text-decoration: none;
	}
	@media (max-width: 768px) {
		nav {
			padding: 0.8rem 1rem;
		}
		.mobile-menu-btn {
			display: block;
		}
		.desktop-nav {
			display: none;
		}
		.nav-search-bar {
			display: none;
		}
		.nav-right {
			gap: 0.8em;
		}
		.notification-dropdown {
			margin-right: 0.5rem;
		}
		.user-btn {
			padding: 0.2rem 0.4rem 0.2rem 0.2rem;
		}
		.username {
			display: none;
		}
		.dropdown-menu {
			right: -1rem;
		}
	}
	@media (max-width: 480px) {
		.logo {
			font-size: 1.1rem;
		}
		.notification-menu {
			width: 280px;
			right: -1rem;
		}
	}
</style>
