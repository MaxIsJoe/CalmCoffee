<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { User } from '@supabase/supabase-js';
	import type { Story } from '$lib/types/story';
	import { usernameCache } from '$lib/stores/username_cache';

	// Tab components
	import ProfileOverview from './ProfileOverview.svelte';
	import ProfileStories from './ProfileStories.svelte';
	import ProfileComments from './ProfileComments.svelte';
	import ProfileBlog from './ProfileBlog.svelte';
	import type { ProfileType } from '$lib/types/profile';
	import ProfileCharacters from './ProfileCharacters.svelte';

	let userComments: {
		comment: string;
		created_at: string;
		block_id: string;
		story_id: string;
		story_title: string;
	}[] = [];

	let loadingComments = false;
	let profile: ProfileType | null = null;
	let user: User | null = null;
	let editing = false;
	let bio = '';
	let age: number | null = null;
	let birthdate: string = '';
	let newUsername = '';
	let newAvatarUrl = '';
	let error = '';

	let stories: Story[] = [];

	let username: string;
	$: username = $page.params.username;

	// Tabs
	const tabs = [
		{ key: 'overview', label: 'Overview', component: ProfileOverview },
		{ key: 'stories', label: 'Stories', component: ProfileStories },
		{ key: 'characters', label: 'Characters', component: ProfileCharacters },
		{ key: 'blog', label: 'Blog', component: ProfileBlog },
		{ key: 'comments', label: 'Comments', component: ProfileComments }
	];
	let selectedTab = 'overview';

	function isNumeric(str: string) {
		return /^\d+$/.test(str);
	}

	let loadingStep: string | null = null;

	onMount(async () => {
		error = '';
		profile = null;
		loadingStep = 'Fetching profile...';

		// Try fetching by username first (case-insensitive)
		const { data: userData, error: userError } = await supabase
			.from('profiles')
			.select('*')
			.ilike('username', username.trim())
			.maybeSingle<ProfileType>();

		if (userError) {
			error = userError.message;
		} else if (userData) {
			profile = userData;
			bio = profile.bio || '';
			newUsername = profile.username;
			birthdate = profile.bd ? profile.bd.slice(0, 10) : '';
			age = calculateAge(profile.bd || '');
			newAvatarUrl = profile.avatar_url || '';
		} else if (isNumeric(username)) {
			loadingStep = 'Fetching profile by ID...';
			const id = Number(username);
			const { data: idData, error: idError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', id)
				.maybeSingle<ProfileType>();
			if (idError) {
				error = idError.message;
			} else if (idData) {
				profile = idData;
				bio = profile.bio || '';
				newUsername = profile.username;
				birthdate = profile.bd ? profile.bd.slice(0, 10) : '';
				age = calculateAge(profile.bd || '');
				newAvatarUrl = profile.avatar_url || '';
			} else {
				error = `Profile "${username}" not found`;
			}
		} else {
			error = `Profile "${username}" not found`;
		}

		// Fetch stories by user id if profile found
		if (profile) {
			loadingStep = 'Fetching stories...';
			const { data: storiesData, error: storiesError } = await supabase
				.from('stories')
				.select('*')
				.eq('user_id', profile.account_id);

			if (!storiesError && storiesData) {
				stories = storiesData;
			}
		}

		loadingStep = 'Checking authentication...';
		const { data: authData } = await supabase.auth.getUser();
		user = authData.user;

		// Fetch comments left by this user (by account_id)
		if (profile) {
			loadingStep = 'Fetching recent comments...';
			loadingComments = true;
			const { data: commentData, error: commentError } = await supabase
				.from('story_block_comments')
				.select(
					`
					id,
					comment,
					created_at,
					blocks(
						id,
						chapter_id,
						chapters(
							id,
							story_id,
							stories(
								id,
								title
							)
						)
					)
				`
				)
				.eq('commenter_id', profile.account_id)
				.order('created_at', { ascending: false })
				.limit(6);

			if (commentError) {
				console.error('Error fetching comments:', commentError);
			}
			if (!commentError && commentData) {
				userComments = commentData.map((c: any) => ({
					comment: c.comment,
					created_at: c.created_at,
					block_id: c.blocks?.id || '',
					story_id: c.blocks?.chapters?.stories?.id || '',
					story_title: c.blocks?.chapters?.stories?.title || ''
				}));
			}
			loadingComments = false;
		}

		if (profile) {
			loadingStep = 'Fetching latest blog...';
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

		let updateFields: any = { bio: bio, username: newUsername.trim() };
		if (typeof newAvatarUrl === 'string') {
			updateFields.avatar_url = newAvatarUrl.trim();
		}

		let updateQuery = supabase.from('profiles').update(updateFields);
		updateQuery = updateQuery.eq('username', username);

		const { data, error: updateError } = await updateQuery.select(); // select() returns updated rows

		if (updateError) {
			if (updateError.code === '23505') {
				error = 'That username is already taken.';
			} else {
				error = updateError.message;
			}
			return;
		}

		console.log('Profile updated:', data);

		if (!data || !data[0]) {
			error = 'Update failed. Please try again.';
			return;
		}

		editing = false;
		profile = data[0];
		bio = profile.bio || '';
		newUsername = profile.username;
		newAvatarUrl = profile.avatar_url || '';

		// Invalidate username cache for this account_id (if username changed)
		if (profile?.account_id) {
			usernameCache.clearExpired(); // Optionally clear expired first
			// Remove the cached username for this account_id so it will be refreshed
			usernameCache.getUsername(profile.account_id).then(() => {});
		}

		// If the username changed, update the URL
		if (username !== newUsername) {
			window.location.href = `/profile/${newUsername}`;
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

	let newInterest = '';
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
							<span>{profile.username.charAt(0).toUpperCase()}</span>
						{/if}
					{:else if profile.avatar_url}
						<!-- svelte-ignore a11y_img_redundant_alt -->
						<img src={profile.avatar_url} alt="Profile picture" class="avatar-img" />
					{:else}
						<span>{profile.username.charAt(0).toUpperCase()}</span>
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
						<h2>{profile.username}</h2>
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
							<span>{profile.bio || 'No bio yet.'}</span>
						{/if}
					</div>
					{#if !editing && user && user.email === profile.email}
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
								{#if user && user.email === profile.email}
									<button
										class="remove-interest-btn"
										on:click|stopPropagation={async () => {
											const updated = profile.interests.filter((_, idx) => idx !== i);
											const { error: updateError } = await supabase
												.from('profiles')
												.update({ interests: updated })
												.eq('account_id', profile.account_id);
											if (!updateError) profile.interests = updated;
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
				{#if user && profile && user.email === profile.email}
					<form
						class="add-interest-form"
						on:submit|preventDefault={async () => {
							if (!newInterest.trim()) return;
							const updated = [...(profile.interests || []), newInterest.trim()];
							const { error: updateError } = await supabase
								.from('profiles')
								.update({ interests: updated })
								.eq('account_id', profile.account_id);
							if (!updateError) {
								profile.interests = updated;
								newInterest = '';
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
						class:active={selectedTab === tab.key}
						on:click={() => (selectedTab = tab.key)}
						type="button"
					>
						{tab.label}
					</button>
				{/each}
			</div>
			<div class="profile-tab-content">
				<svelte:component
					this={tabs.find((t) => t.key === selectedTab)?.component}
					{profile}
					{stories}
					{userComments}
					{loadingComments}
				/>
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
		background: #fff;
		border-radius: 16px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		padding: 2rem 2.5rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.profile-card.error,
	.profile-card.loading {
		background: #ffeaea;
		color: #b00020;
	}
	.profile-card.loading.loading-steps {
		background: #f3f4f6;
		color: #222;
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
		background: #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		font-weight: bold;
		color: #666;
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
		background: #4f46e5;
		color: #fff;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.2s;
	}
	.edit-btn:hover {
		background: #3730a3;
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
		border: 1px solid #ccc;
		padding: 0.5rem;
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
		border: 1px solid #ccc;
		font-size: 1rem;
	}
	button,
	.edit-btn {
		background: #4f46e5;
		color: #fff;
		border: none;
		padding: 0.5rem 1.2rem;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	button:hover,
	.edit-btn:hover {
		background: #3730a3;
	}
	.edit-btn {
		margin-left: 1rem;
		padding: 0.3rem 0.9rem;
		font-size: 0.95rem;
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
		color: #4f46e5;
		margin-bottom: 0.8rem;
	}
	.profile-tabs {
		display: flex;
		gap: 1.2rem;
	}
	.profile-tabs button {
		background: #f3f4f6;
		color: #3730a3;
		border: none;
		border-radius: 7px 7px 0 0;
		padding: 0.7em 1.5em;
		font-size: 1.05rem;
		cursor: pointer;
		transition:
			background 0.16s,
			color 0.16s;
		font-weight: 500;
	}
	.profile-tabs button.active,
	.profile-tabs button:hover {
		background: #e0e7ff;
		color: #4f46e5;
	}
	.profile-tab-content {
		background: #fafafa;
		border-radius: 0 0 12px 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
		padding: 1.5rem 2rem;
		min-height: 220px;
	}
	.profile-spinner {
		width: 38px;
		height: 38px;
		border: 5px solid #e0e7ff;
		border-top: 5px solid #6366f1;
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
		background: #f8f5f2;
		border-radius: 10px;
		box-shadow: 0 1px 6px #e0d7ce;
		padding: 1em 1.2em 0.8em 1.2em;
		margin: 1.5em 0 0 0;
		text-align: center;
	}
	.profile-interests-panel h3 {
		margin-top: 0;
		margin-bottom: 0.7em;
		font-size: 1.13em;
		color: #3730a3;
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
		background: #ede9e3;
		color: #7c5e48;
		font-size: 0.97em;
		padding: 0.18em 0.7em;
		border-radius: 999px;
		font-weight: 500;
		border: 1px solid #e0d7ce;
		display: flex;
		align-items: center;
		gap: 0.2em;
	}
	.remove-interest-btn {
		background: none;
		border: none;
		color: #a67c52;
		font-size: 1.1em;
		margin-left: 0.2em;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}
	.remove-interest-btn:hover {
		color: #b91c1c;
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
		border: 1px solid #cbd5e1;
		font-size: 1em;
		background: #fff;
		transition: border-color 0.15s;
	}
	.add-interest-form input[type='text']:focus {
		border-color: #6366f1;
		outline: none;
	}
	.add-interest-form button {
		background: #a67c52;
		color: #fff;
		border: none;
		border-radius: 5px;
		padding: 0.35em 1em;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
	}
	.add-interest-form button:hover {
		background: #7c5e48;
	}
	.no-interests {
		color: #888;
		font-size: 0.97em;
		margin-bottom: 0.7em;
	}
</style>
