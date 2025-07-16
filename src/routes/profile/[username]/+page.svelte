<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { usernameCache } from '$lib/stores/username_cache';
	import { slide } from 'svelte/transition';
	import ProfileOverview from './ProfileOverview.svelte';
	import ProfileStories from './ProfileStories.svelte';
	import ProfileComments from './ProfileComments.svelte';
	import ProfileBlog from './ProfileBlog.svelte';
	import ProfileCharacters from './ProfileCharacters.svelte';
	import ProfileLikes from './ProfileLikes.svelte';
	import { fetchProfileByUsername, fetchProfileById, fetchStoriesByUserId, fetchRecentCommentsByAccountId, updateProfileByUsername, updateProfileInterests } from '$lib/db/profile';
	import type { Profile, Story, ProfileComment } from '$lib/db/profile';
	import { user } from '$lib/stores/user';
	import type { UserStoreType } from '$lib/stores/user';
	import type { ProfileType } from '$lib/types/profile';

	let userComments: ProfileComment[] = [];
	let loadingComments: boolean = false;
	let profile: Profile | null = null;
	let editing: boolean = false;
	let bio: string = '';
	let age: number | null = null;
	let birthdate: string = '';
	let newUsername: string = '';
	let newAvatarUrl: string = '';
	let error: string = '';
	let stories: Story[] = [];
	let username: string = '';
	$: username = $page.params.username as string;
	const tabs: { key: string; label: string; component: any }[] = [
		{ key: 'overview', label: 'Overview', component: ProfileOverview },
		{ key: 'stories', label: 'Stories', component: ProfileStories },
		{ key: 'characters', label: 'Characters', component: ProfileCharacters },
		{ key: 'blog', label: 'Blog', component: ProfileBlog },
		{ key: 'comments', label: 'Comments', component: ProfileComments },
		{ key: 'likes', label: 'Likes', component: ProfileLikes }
	];
	let selectedTab: string = 'overview';
	function isNumeric(str: string): boolean {
		return /^\d+$/.test(str);
	}
	let loadingStep: string | null = null;
	let newInterest: string = '';
	onMount(async () => {
		error = '';
		profile = null;
		loadingStep = 'Fetching profile...';
		try {
			let userData: Profile | null = null;
			if (!isNumeric(username ?? '')) {
				userData = await fetchProfileByUsername(username ?? '');
			} else {
				const id = Number(username ?? '0');
				userData = await fetchProfileById(id);
			}
			if (userData) {
				profile = userData;
				bio = profile.bio || '';
				newUsername = profile.username;
				birthdate = profile.bd ? profile.bd.slice(0, 10) : '';
				age = calculateAge(profile.bd || '');
				newAvatarUrl = profile.avatar_url || '';
				loadingStep = 'Fetching stories...';
				stories = await fetchStoriesByUserId(profile.account_id ?? '');
				loadingStep = 'Fetching recent comments...';
				loadingComments = true;
				userComments = await fetchRecentCommentsByAccountId(profile.account_id ?? '', 6);
				loadingComments = false;
			} else {
				error = `Profile "${username}" not found`;
			}
		} catch (e) {
			error = (e as Error).message;
		}
		loadingStep = null;
	});
	async function saveProfile() {
		if (!newUsername.trim()) {
			error = 'Username cannot be empty.';
			return;
		}
		if (newUsername.trim().length < 3) {
			error = 'Username must be at least 3 characters long.';
			return;
		}
		let updateFields: Partial<Profile> = { bio: bio, username: newUsername.trim() };
		if (typeof newAvatarUrl === 'string') {
			updateFields.avatar_url = newAvatarUrl.trim();
		}
		try {
			const updated = await updateProfileByUsername(username, updateFields);
			if (!updated) {
				error = 'Update failed. Please try again.';
				return;
			}
			editing = false;
			profile = updated;
			bio = profile?.bio || '';
			newUsername = profile?.username || '';
			newAvatarUrl = profile?.avatar_url || '';
			if (profile?.account_id) {
				usernameCache.clearExpired();
				usernameCache.getUsername(profile.account_id).then(() => {});
			}
			if (username !== newUsername) {
				window.location.href = `/profile/${newUsername}`;
			}
		} catch (e) {
			if ((e as Error).message.includes('23505')) {
				error = 'That username is already taken.';
			} else {
				error = (e as Error).message;
			}
		}
	}
	function calculateAge(bd: string | null): number | null {
		if (!bd) return null;
		const birth = new Date(bd);
		const today = new Date();
		let years = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
			years--;
		}
		return years;
	}
	// Add a helper function for user id equality
	function isCurrentUserProfile(user: UserStoreType | null, profile: Profile | null): boolean {
		return !!user?.usr?.id && !!profile?.account_id && user.usr.id === profile.account_id;
	}
</script>

{#if error}
	<div class="profile-container">
		<div class="profile-card error">
			<p>{error}</p>
		</div>
	</div>
{:else if !profile || loadingStep}
	<div class="profile-container">
		<div class="profile-card loading loading-steps">
			<div class="profile-spinner"></div>
			<p>
				{#if loadingStep}
					{loadingStep}
				{:else}
					Loading profile...
				{/if}
			</p>
		</div>
	</div>
{:else}
	<div class="profile-main-container">
		<!-- Left: Profile Info & Interests -->
		<div class="profile-left">
			<div class="profile-card">
				<div class="profile-avatar">
					{#if editing}
						{#if newAvatarUrl}
							<!-- svelte-ignore a11y_img_redundant_alt -->
							<img src={newAvatarUrl} alt="Profile picture" class="avatar-img" />
						{:else}
							<span>{profile!.username.charAt(0).toUpperCase()}</span>
						{/if}
					{:else if profile!.avatar_url}
						<!-- svelte-ignore a11y_img_redundant_alt -->
						<img src={profile!.avatar_url} alt="Profile picture" class="avatar-img" />
					{:else}
						<span>{profile!.username.charAt(0).toUpperCase()}</span>
					{/if}
				</div>
				<div class="profile-info">
					{#if editing}
						<label>
							<strong>Username:</strong>
							<input type="text" bind:value={newUsername} maxlength="32" />
						</label>
						<label>
							<strong>Profile Picture URL:</strong>
							<input
								type="url"
								bind:value={newAvatarUrl}
								maxlength="400"
								placeholder="https://..."
							/>
						</label>
					{:else}
						<h2>{profile!.username}</h2>
					{/if}
					<div class="profile-age">
						<strong>Age:</strong>
						{#if editing}
							<input
								type="date"
								bind:value={birthdate}
								max={new Date().toISOString().slice(0, 10)}
							/>
						{:else if age !== null}
							<span>{age} years old</span>
						{:else}
							<span>Not set</span>
						{/if}
					</div>
					<div class="profile-bio">
						<strong>Bio:</strong>
						{#if editing}
							<textarea bind:value={bio}></textarea>
							<div class="profile-actions">
								<button on:click={saveProfile}>Save</button>
								<button
									on:click={() => {
										editing = false;
										bio = profile?.bio || '';
										newUsername = profile?.username || '';
										newAvatarUrl = profile?.avatar_url || '';
									}}>Cancel</button
								>
							</div>
						{:else}
							<span>{profile!.bio || 'No bio yet.'}</span>
						{/if}
					</div>
					{#if !editing && isCurrentUserProfile($user, profile)}
						<button class="edit-btn" on:click={() => (editing = true)}>Edit</button>
					{/if}
				</div>
			</div>

			<!-- Interests Panel -->
			<div class="profile-interests-panel">
				<h3>Interests</h3>
				{#if profile && profile.interests && profile.interests.length > 0}
					<div class="interests-list">
						{#each profile.interests as interest, i}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<span
								class="interest-chip"
								on:click={() =>
									(window.location.href = `/search?tag=${encodeURIComponent(interest)}`)}
								style="cursor:pointer;"
							>
								{interest}
								{#if $user && profile && isCurrentUserProfile($user, profile)}
									<button
										class="remove-interest-btn"
										on:click|stopPropagation={async () => {
											if (!profile?.account_id || !profile?.interests) return;
											const updated = profile.interests.filter((_, idx) => idx !== i);
											try {
												profile.interests = await updateProfileInterests(profile.account_id, updated);
											} catch (e) {
												error = (e as Error).message;
											}
										}}
										title="Remove">&times;</button
									>
								{/if}
							</span>
						{/each}
					</div>
				{:else}
					<p class="no-interests">No interests listed.</p>
				{/if}
				{#if $user && profile && isCurrentUserProfile($user, profile)}
					<form
						class="add-interest-form"
						on:submit|preventDefault={async () => {
							if (!profile?.account_id) return;
							if (!newInterest.trim()) return;
							const updated = [...(profile.interests || []), newInterest.trim()];
							try {
								profile.interests = await updateProfileInterests(profile.account_id, updated);
								newInterest = '';
							} catch (e) {
								error = (e as Error).message;
							}
						}}
					>
						<input type="text" placeholder="Add interest" bind:value={newInterest} maxlength="32" />
						<button type="submit">Add</button>
					</form>
				{/if}
			</div>
		</div>
		<!-- Right: Tabbed Section -->
		<div class="profile-right">
			<div class="profile-tabs">
				{#each tabs as tab}
					<button
						class="tab-button {selectedTab === tab.key ? 'active' : ''}"
						on:click={() => (selectedTab = tab.key)}
					>
						{tab.label}
					</button>
				{/each}
			</div>
			<div class="profile-tab-content">
				{#key selectedTab}
					<div transition:slide>
						<svelte:component
							this={tabs.find((t) => t.key === selectedTab)?.component}
							profile={profile!}
							user={$user!}
							{stories}
							{username}
							{userComments}
							{loadingComments}
						/>
					</div>
				{/key}
			</div>
		</div>
	</div>
{/if}

<style>
	.profile-container {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 2rem 0;
	}
	.profile-main-container {
		display: flex;
		gap: 2.5rem;
		max-width: 85%;
		margin: 2rem auto 0 auto;
		align-items: flex-start;
	}
	.profile-left {
		flex: 0 0 340px;
		max-width: 340px;
	}
	.profile-right {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.profile-card {
		background: var(--color-card-bg);
		border-radius: 16px;
		box-shadow: 0 4px 24px var(--color-card-shadow);
		padding: 2rem 2.5rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.profile-card.error,
	.profile-card.loading {
		background: var(--color-danger-bg, #ffeaea);
		color: var(--color-danger);
	}
	.profile-card.loading.loading-steps {
		background: var(--color-bg-hover);
		color: var(--color-text);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 220px;
	}
	.profile-avatar {
		min-width: 128px;
		min-height: 128px;
		border-radius: 50%;
		background: var(--color-bg-hover);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		font-weight: bold;
		color: var(--color-secondary);
		margin-bottom: 1.5rem;
		overflow: hidden;
	}
	.avatar-img {
		min-width: 128px;
		min-height: 128px;
		object-fit: cover;
		border-radius: 50%;
		display: block;
	}
	.profile-info {
		width: 100%;
		text-align: center;
		position: relative;
	}
	.edit-btn {
		margin: 1.1rem auto 0 auto;
		display: block;
		padding: 0.3rem 0.9rem;
		font-size: 0.95rem;
		background: var(--color-link);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.2s;
	}
	.edit-btn:hover {
		background: var(--color-link-hover);
	}
	.profile-bio {
		margin-top: 1rem;
		text-align: left;
	}
	.profile-bio textarea {
		width: 100%;
		height: 80px;
		resize: vertical;
		font-size: 1rem;
		margin-top: 0.5rem;
		border-radius: 8px;
		border: 1px solid var(--color-border);
		padding: 0.5rem;
		background: var(--color-bg-alt);
		color: var(--color-text);
	}
	.profile-actions {
		margin-top: 0.5rem;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
	input[type='text'] {
		width: 100%;
		padding: 0.5rem;
		margin-top: 0.5rem;
		border-radius: 8px;
		border: 1px solid var(--color-border);
		font-size: 1rem;
		background: var(--color-bg-alt);
		color: var(--color-text);
	}
	button {
		background: var(--color-link);
		color: var(--color-primary-alt);
		border: none;
		padding: 0.5rem 1.2rem;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	button:hover {
		background: var(--color-link-hover);
	}
	.edit-btn {
		background: var(--color-link);
		color: var(--color-primary-alt);
		margin-left: 1rem;
		padding: 0.3rem 0.9rem;
		font-size: 0.95rem;
	}
	.edit-btn:hover {
		background: var(--color-link-hover);
	}
	@media (max-width: 900px) {
		.profile-main-container {
			flex-direction: column;
			gap: 1.5rem;
		}
		.profile-left {
			max-width: 100vw;
			width: 100%;
		}
		.profile-right {
			width: 100%;
		}
	}
	h2 {
		font-size: 1.5rem;
		color: var(--color-link);
		margin-bottom: 0.8rem;
	}
	.profile-tabs {
		display: flex;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1.5rem;
		padding-bottom: 0.2rem;
		max-width: 100%;
		scrollbar-width: none;
	}

	.profile-tabs::-webkit-scrollbar {
		display: none;
	}

	.tab-button {
		background: var(--color-bg-alt);
		color: var(--color-link);
		border: none;
		border-radius: 7px 7px 0 0;
		padding: 0.7em 1.5em;
		font-size: 1.05rem;
		cursor: pointer;
		transition: background 0.16s, color 0.16s;
		font-weight: 500;
		white-space: nowrap;
		flex-shrink: 0;
		min-width: fit-content;
	}

	.tab-button.active,
	.tab-button:hover {
		background: var(--color-secondary);
		color: var(--color-link);
	}

	@media (max-width: 768px) {
		.profile-tabs {
			padding-bottom: 0.1rem;
			margin-bottom: 1rem;
		}

		.tab-button {
			padding: 0.6rem 0.9rem;
			font-size: 0.9em;
		}
	}

	@media (max-width: 480px) {
		.tab-button {
			padding: 0.5rem 0.7rem;
			font-size: 0.85em;
		}
	}
	.profile-tab-content {
		background: var(--color-bg-alt);
		border-radius: 0 0 12px 12px;
		box-shadow: 0 2px 12px var(--color-card-shadow);
		padding: 1.5rem 2rem;
		min-height: 220px;
	}
	.profile-spinner {
		width: 38px;
		height: 38px;
		border: 5px solid var(--color-secondary);
		border-top: 5px solid var(--color-link);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1.2rem;
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	.profile-interests-panel {
		background: var(--color-bg-alt);
		border-radius: 10px;
		box-shadow: 0 1px 6px var(--color-card-shadow);
		padding: 1em 1.2em 0.8em 1.2em;
		margin: 1.5em 0 0 0;
		text-align: center;
	}
	.profile-interests-panel h3 {
		margin-top: 0;
		margin-bottom: 0.7em;
		font-size: 1.13em;
		color: var(--color-link);
		font-weight: 600;
	}
	.interests-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6em;
		justify-content: center;
		margin-bottom: 0.7em;
	}
	.interest-chip {
		background: var(--color-border);
		color: var(--color-accent);
		font-size: 0.97em;
		padding: 0.18em 0.7em;
		border-radius: 999px;
		font-weight: 500;
		border: 1px solid var(--color-border);
		display: flex;
		align-items: center;
		gap: 0.2em;
	}
	.remove-interest-btn {
		background: none;
		border: none;
		color: var(--color-accent);
		font-size: 1.1em;
		margin-left: 0.2em;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}
	.remove-interest-btn:hover {
		color: var(--color-danger);
	}
	.add-interest-form {
		display: flex;
		gap: 0.5em;
		justify-content: center;
		margin-top: 0.5em;
	}
	.add-interest-form input[type='text'] {
		padding: 0.4em 0.7em;
		border-radius: 5px;
		border: 1px solid var(--color-border);
		font-size: 1em;
		background: var(--color-card-bg);
		color: var(--color-text);
		transition: border-color 0.15s;
	}
	.add-interest-form input[type='text']:focus {
		border-color: var(--color-link);
		outline: none;
	}
	.add-interest-form button {
		background: var(--color-accent);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 5px;
		padding: 0.35em 1em;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
	}
	.add-interest-form button:hover {
		background: var(--color-primary);
	}
	.no-interests {
		color: var(--color-secondary);
		font-size: 0.97em;
		margin-bottom: 0.7em;
	}
</style>
