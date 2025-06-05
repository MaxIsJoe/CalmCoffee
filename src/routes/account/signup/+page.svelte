<script>
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleSignupStep1() {
		error = '';
		loading = true;

		const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

		if (signUpError) {
			error = signUpError.message;
			loading = false;
			return;
		}

		// If email confirmation is required, session will be null
		if (!data.session) {
			error =
				'Signup successful! Please check your email to confirm your account before continuing.';
			loading = false;
			return;
		}

		const user = data.user;
		if (!user) {
			error = 'Signup failed. Please try again.';
			loading = false;
			return;
		}

		// Pass email as query param to next step
		goto(`/account/setup?email=${encodeURIComponent(email)}`);
	}
</script>

<form on:submit|preventDefault={handleSignupStep1}>
	<p>Email</p>
	<input type="email" bind:value={email} placeholder="myemail@proton.me" required />
	<p>Password</p>
	<input type="password" bind:value={password} placeholder="Password" required minlength="6" />
	<button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Next'}</button>
	{#if error}<p style="color:red">{error}</p>{/if}
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 35%;
		margin: auto;
	}

	input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		padding: 0.5rem;
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
		margin: 0.5rem 0;
	}
	input:focus {
		border-color: #007bff;
		outline: none;
	}
</style>
