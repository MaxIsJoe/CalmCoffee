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
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		padding: 10px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	p {
		color: red;
	}
	input:focus {
		border-color: #007bff;
		outline: none;
	}
	input {
		width: 100%;
	}

	button {
		width: 100%;
	}
	button:hover {
		background-color: #0056b3;
	}
	input::placeholder {
		color: #999;
	}
	input:focus::placeholder {
		color: transparent;
	}
	input:focus {
		border-color: #007bff;
		box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
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
	button:hover {
		background-color: #0056b3;
	}
	button:active {
		background-color: #004494;
	}
	button:focus {
		outline: none;
		box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
	}
	input:focus {
		outline: none;
		box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
	}
	input {
		font-size: 16px;
		padding: 10px;
	}
	input::placeholder {
		color: #999;
		font-size: 14px;
	}
	input:focus::placeholder {
		color: transparent;
	}
	input:focus {
		border-color: #007bff;
		box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
	}
	.signup-link {
		text-align: center;
		margin-top: 1.5rem;
	}
	.signup-link a {
		color: #007bff;
		text-decoration: underline;
	}
	.signup-link a:hover {
		color: #0056b3;
	}
</style>
