<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	let user: any = null;
	let profile: any = null;
	let username = '';
	let bio = '';
	let error = '';
	let success = '';

	let newPassword = '';
	let confirmPassword = '';
	let passwordError = '';
	let passwordSuccess = '';

	onMount(async () => {
		const { data: authData } = await supabase.auth.getUser();
		user = authData.user;
		if (!user) {
			error = 'You must be logged in.';
			return;
		}
		const { data: profileData } = await supabase
			.from('profiles')
			.select('*')
			.eq('account_id', user.id)
			.single();
		if (profileData) {
			profile = profileData;
			username = profile.username || '';
			bio = profile.bio || '';
		}
	});

	async function saveProfile() {
		error = '';
		success = '';
		if (!username.trim()) {
			error = 'Username cannot be empty.';
			return;
		}
		if (username.trim().length < 3) {
			error = 'Username must be at least 3 characters long.';
			return;
		}
		const { error: updateError } = await supabase
			.from('profiles')
			.update({ username: username.trim(), bio })
			.eq('account_id', user.id);
		if (updateError) {
			if (updateError.code === '23505') {
				error = 'That username is already taken.';
			} else {
				error = updateError.message;
			}
			return;
		}
		success = 'Profile updated!';
	}

	async function changePassword() {
		passwordError = '';
		passwordSuccess = '';
		if (!newPassword || newPassword.length < 6) {
			passwordError = 'Password must be at least 6 characters.';
			return;
		}
		if (newPassword !== confirmPassword) {
			passwordError = 'Passwords do not match.';
			return;
		}
		const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
		if (pwError) {
			passwordError = pwError.message;
			return;
		}
		passwordSuccess = 'Password changed!';
		newPassword = '';
		confirmPassword = '';
	}
</script>

<h2>Account Settings</h2>
<form on:submit|preventDefault={saveProfile} class="profile-form">
	<label>
		Username
		<input type="text" bind:value={username} maxlength="32" />
	</label>
	<label>
		Bio
		<textarea bind:value={bio} maxlength="300"></textarea>
	</label>
	<button type="submit">Save</button>
	{#if error}<p class="error">{error}</p>{/if}
	{#if success}<p class="success">{success}</p>{/if}
</form>

<div class="divider"></div>

<h3>Change Password</h3>
<form on:submit|preventDefault={changePassword} class="password-form">
	<label>
		New Password
		<input type="password" bind:value={newPassword} minlength="6" />
	</label>
	<label>
		Confirm Password
		<input type="password" bind:value={confirmPassword} minlength="6" />
	</label>
	<button type="submit">Change Password</button>
	{#if passwordError}<p class="error">{passwordError}</p>{/if}
	{#if passwordSuccess}<p class="success">{passwordSuccess}</p>{/if}
</form>

<style>
	.profile-form,
	.password-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 400px;
		margin-bottom: 1.5rem;
	}
	label {
		font-weight: 500;
		color: #3730a3;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	input[type='text'],
	input[type='password'],
	textarea {
		width: 100%;
		padding: 0.5rem;
		border-radius: 7px;
		border: 1px solid #cbd5e1;
		font-size: 1rem;
		margin-top: 0.3rem;
	}
	textarea {
		resize: vertical;
		min-height: 60px;
	}
	button {
		background: #4f46e5;
		color: #fff;
		border: none;
		border-radius: 6px;
		padding: 0.5rem 1.2rem;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
		align-self: flex-start;
	}
	button:hover {
		background: #3730a3;
	}
	.error {
		color: #b91c1c;
		font-size: 0.98rem;
		margin: 0;
	}
	.success {
		color: #059669;
		font-size: 0.98rem;
		margin: 0;
	}
	.divider {
		height: 1px;
		background: #e0e7ff;
		margin: 2rem 0 1.5rem 0;
		border-radius: 2px;
	}
	.account-settings {
		background: var(--color-card-bg);
		color: var(--color-text);
	}
	input,
	select {
		background: var(--color-bg-alt);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}
	input:focus,
	select:focus {
		border-color: var(--color-link);
	}
	.button-primary {
		background: var(--color-link);
		color: var(--color-primary-alt);
	}
	.button-primary:hover {
		background: var(--color-link-hover);
	}
	.button-danger {
		background: var(--color-danger, #dc2626);
		color: var(--color-primary-alt);
	}
	.button-danger:hover {
		background: var(--color-danger-hover, #b91c1c);
	}
	.button-success {
		color: var(--color-success, #059669);
	}
</style>
