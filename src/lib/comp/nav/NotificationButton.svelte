<script lang="ts">
import { supabase } from '$lib/supabaseClient';
import { onMount } from 'svelte';
import { createEventDispatcher } from 'svelte';
import type { Database } from '../../../../database.types';

export let userId: string | null = null;

let notifications: Database['public']['Tables']['notifications']['Row'][] = [];
let unreadCount = 0;
let notificationDropdownOpen = false;
let loading = false;
const dispatch = createEventDispatcher();

async function fetchNotifications() {
	if (!userId) return;
	loading = true;
	const { data, error } = await supabase
		.from('notifications')
		.select('*')
		.eq('user_id', userId)
		.eq('read', false)
		.order('created_at', { ascending: false })
		.limit(20);
	loading = false;
	if (error) {
		console.error('Error fetching notifications:', error);
		return;
	}
	notifications = data;
	unreadCount = data.filter(n => !n.read).length;
	dispatch('unread', { unreadCount });
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

$: if (userId) {
	fetchNotifications();
}
</script>

<!-- Notification Button UI -->
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
			{#if loading}
				<div class="empty-notifications">Loading...</div>
			{:else if notifications.length === 0}
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

<style>
.notification-dropdown {
	position: relative;
	margin-right: 1rem;
}
.notification-btn {
	background: var(--color-notification-btn-bg);
	border: none;
	cursor: pointer;
	padding: 0.5rem;
	border-radius: 6px;
	position: relative;
	transition: background 0.15s;
}
.notification-btn:hover {
	background: var(--color-notification-btn-bg-hover, var(--color-navbar-bg, #c7d2fe));
}
.notification-badge {
	position: absolute;
	top: 0;
	right: 0;
	background: var(--color-danger, #ef4444);
	color: var(--color-btn-primary-text, white);
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
	background: var(--color-card-bg, white);
	border-radius: 12px;
	box-shadow: 0 8px 32px var(--color-card-shadow, rgba(99, 102, 241, 0.18)), 0 1.5px 8px var(--color-card-shadow, rgba(0, 0, 0, 0.07));
	width: 320px;
	z-index: 100;
	animation: dropdown-fade-in 0.18s cubic-bezier(0.4, 1.4, 0.6, 1) both;
}
.notification-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem;
	border-bottom: 1px solid var(--color-border, #e0e7ff);
}
.notification-header h3 {
	margin: 0;
	font-size: 1.1rem;
	color: var(--color-navbar-link, #3730a3);
}
.view-all {
	color: var(--color-link, #4f46e5);
	text-decoration: none;
	font-size: 0.9rem;
}
.view-all:hover {
	text-decoration: underline;
}
.empty-notifications {
	padding: 2rem;
	text-align: center;
	color: var(--color-muted, #666);
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
	border-bottom: 1px solid var(--color-border, #f1f5f9);
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
	background: var(--color-bg-alt, #eef2ff);
	border-radius: 8px;
	padding: 6px;
}
.notification-icon.unread {
	background: var(--color-bg-hover, #e0e7ff);
}
.notification-content {
	flex-grow: 1;
}
.notification-message {
	margin: 0 0 0.5rem 0;
	color: var(--color-text, #333);
	font-size: 0.95rem;
	line-height: 1.4;
}
.notification-time {
	color: var(--color-muted, #666);
	font-size: 0.8rem;
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
</style> 