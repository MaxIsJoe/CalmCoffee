<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { user as userStore } from '$lib/stores/user';
	import type { Database } from '../../../database.types';

	type Notification = Database['public']['Tables']['notifications']['Row'];

	let notifications: Notification[] = [];
	let loading = true;

	async function fetchNotifications() {
		if (!$userStore?.usr) return;

		const { data, error } = await supabase
			.from('notifications')
			.select('*')
			.eq('user_id', $userStore.usr.id)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching notifications:', error);
			return;
		}

		notifications = data;
		loading = false;
	}

	onMount(() => {
		fetchNotifications();
	});

	function getNotificationIcon(type: string) {
		switch (type) {
			case 'comment':
				return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path d="M10 2C5.58172 2 2 5.58172 2 10C2 11.8728 2.64175 13.6052 3.75736 14.9645L2.5 17.5L5.03553 16.2426C6.39484 17.3582 8.12721 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>`;
			case 'reaction':
				return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 11.8728 2.64175 13.6052 3.75736 14.9645L2.5 17.5L5.03553 16.2426C6.39484 17.3582 8.12721 18 10 18Z" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M7 8C7 8 7.5 7 10 7C12.5 7 13 8 13 8" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
					<path d="M7 11H13" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
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
</script>

<div class="notifications-page">
	<h1>Notifications</h1>

	{#if loading}
		<div class="loading">Loading notifications...</div>
	{:else if notifications.length === 0}
		<div class="empty-state">No notifications yet</div>
	{:else}
		<div class="notifications-list">
			{#each notifications as notification}
				<div class="notification-item">
					<div class="notification-icon" class:unread={!notification.read}>
						{@html getNotificationIcon(notification.type)}
					</div>
					<div class="notification-content">
						<p class="message">{notification.message}</p>
						<time class="timestamp" datetime={notification.created_at}>
							{new Date(notification.created_at).toLocaleDateString()}
						</time>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.notifications-page {
		max-width: 800px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	h1 {
		font-size: 2rem;
		color: #333;
		margin-bottom: 2rem;
	}

	.loading {
		text-align: center;
		color: #666;
		padding: 2rem;
	}

	.empty-state {
		text-align: center;
		color: #666;
		padding: 3rem;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.notifications-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.notification-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background: white;
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
	}

	.notification-item:hover {
		transform: translateY(-2px);
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

	.message {
		margin: 0;
		color: #333;
		font-size: 1rem;
		line-height: 1.5;
	}

	.timestamp {
		color: #666;
		font-size: 0.875rem;
	}
</style> 