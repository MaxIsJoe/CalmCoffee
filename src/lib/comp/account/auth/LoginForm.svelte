<script>
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleLogin() {
		loading = true;
		error = '';
		const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
		if (loginError) {
			error = loginError.message;
			loading = false;
			return;
		}

		// Wait for the session to be set
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) {
			error = 'Login failed. Please try again.';
			loading = false;
			return;
		}

		// Fetch the user's profile to get the username
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('username, is_active, email')
			.eq('account_id', user.id)
			.single();

		if (profileError || !profile) {
			error = `Could not find user profile.\n ${profileError?.message || 'Unknown error'}`;
			loading = false;
			return;
		}

		if (profile.is_active) {
			goto(`/profile/${profile.username}`);
		} else {
			goto(`/account/setup?email=${encodeURIComponent(profile.email)}`);
		}
		loading = false;
	}
</script>

<form on:submit|preventDefault={handleLogin}>
	<input type="email" bind:value={email} placeholder="Email" required />
	<input type="password" bind:value={password} placeholder="Password" required />
	<button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
	{#if error}<p style="color:red">{error}</p>{/if}
</form>

<div class="signup-link">
	<p>Don't have an account? <a href="/account/signup">Sign up here</a></p>
</div>

<style>
	form {
		display: flex;
		flex-direction: column;
		max-width: 300px;
		margin: auto;
	}

	input {
		margin-bottom: 10px;
		padding: 8px;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text);
		background: var(--color-bg-alt);
	}

	button {
		padding: 10px;
		background-color: var(--color-link);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:disabled {
		background-color: var(--color-border);
		cursor: not-allowed;
	}

	p {
		color: red;
	}
	input:focus {
		border-color: var(--color-link);
		outline: none;
		box-shadow: 0 0 5px var(--color-card-shadow);
	}
	input {
		width: 100%;
	}

	button {
		width: 100%;
	}
	button:hover {
		background-color: var(--color-link-hover);
	}
	input::placeholder {
		color: var(--color-secondary);
	}
	input:focus::placeholder {
		color: transparent;
	}
	input:focus {
		border-color: var(--color-link);
		box-shadow: 0 0 5px var(--color-card-shadow);
	}
	input[type='email'],
	input[type='password'] {
		font-size: 16px;
	}
	input[type='email']::placeholder,
	input[type='password']::placeholder {
		font-size: 14px;
	}
	button {
		font-size: 16px;
		font-weight: bold;
	}
	button:disabled {
		opacity: 0.7;
	}
	button:active {
		background-color: var(--color-primary);
	}
	button:focus {
		outline: none;
		box-shadow: 0 0 5px var(--color-card-shadow);
	}
	input:focus {
		outline: none;
		box-shadow: 0 0 5px var(--color-card-shadow);
	}
	input {
		font-size: 16px;
		padding: 10px;
	}
	input::placeholder {
		color: var(--color-secondary);
		font-size: 14px;
	}
	input:focus::placeholder {
		color: transparent;
	}
	input:focus {
		border-color: var(--color-link);
		box-shadow: 0 0 5px var(--color-card-shadow);
	}
	.signup-link {
		text-align: center;
		margin-top: 1.5rem;
	}
	.signup-link a {
		color: var(--color-link);
		text-decoration: underline;
	}
	.signup-link a:hover {
		color: var(--color-link-hover);
	}
</style>
