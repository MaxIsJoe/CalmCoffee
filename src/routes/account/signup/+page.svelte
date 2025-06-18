<script>
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;
	let isAdult = false;
	let agreedToRules = false;

	async function handleSignupStep1() {
		error = '';
		loading = true;

		if (!isAdult) {
			error = 'You must be 18 or older to create an account.';
			loading = false;
			return;
		}

		if (!agreedToRules) {
			error = 'You must agree to the platform rules to create an account.';
			loading = false;
			return;
		}

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

<svelte:head>
	<title>Sign Up - Calm Coffee</title>
	<meta name="description" content="Create your Calm Coffee account to start writing, reading, and connecting with the community." />
	<meta property="og:title" content="Sign Up - Calm Coffee" />
	<meta property="og:description" content="Create your Calm Coffee account to start writing, reading, and connecting with the community." />
	<meta property="og:type" content="website" />
</svelte:head>

<div class="signup-container">
	<div class="signup-card">
		<div class="signup-header">
			<h1>Join Calm Coffee</h1>
			<p class="subtitle">Create your account to start your writing journey</p>
		</div>
		<form on:submit|preventDefault={handleSignupStep1}>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					placeholder="myemail@proton.me"
					required
				/>
			</div>
			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="Password"
					required
					minlength="6"
				/>
			</div>
			<div class="checkbox-group">
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={isAdult} required />
					<span>I confirm that I am 18 years of age or older</span>
				</label>
			</div>
			<div class="checkbox-group">
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={agreedToRules} required />
					<span>I agree to the <a href="/rules" target="_blank" rel="noopener">platform rules</a></span>
				</label>
			</div>
			<button type="submit" disabled={loading} class="submit-button">
				{#if loading}
					<div class="loader"></div>
					<span>Signing up...</span>
				{:else}
					Next
				{/if}
			</button>
			{#if error}
				<p class="error-message">{error}</p>
			{/if}
		</form>
	</div>
</div>

<style>
	.signup-container {
		min-height: calc(100vh - 4rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.signup-card {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		padding: 2.5rem;
		width: 100%;
		max-width: 420px;
		animation: fadeIn 0.5s ease-out;
	}

	.signup-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	h1 {
		color: #4b2e19;
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
	}

	.subtitle {
		color: #6d4c41;
		font-size: 1.1rem;
		margin: 0;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		color: #4b2e19;
		font-weight: 500;
		font-size: 0.95rem;
	}

	input {
		padding: 0.75rem;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: all 0.2s;
	}

	input:focus {
		border-color: #a1887f;
		outline: none;
		box-shadow: 0 0 0 2px rgba(161, 136, 127, 0.1);
	}

	.checkbox-group {
		margin-top: 0.5rem;
	}

	.checkbox-label {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		cursor: pointer;
		font-size: 0.9rem;
		color: #4b2e19;
	}

	.checkbox-label input[type="checkbox"] {
		margin-top: 0.2rem;
		width: 16px;
		height: 16px;
		cursor: pointer;
	}

	.checkbox-label a {
		color: #a1887f;
		text-decoration: none;
		transition: color 0.2s;
	}

	.checkbox-label a:hover {
		color: #6d4c41;
		text-decoration: underline;
	}

	.submit-button {
		background-color: #4b2e19;
		color: white;
		padding: 0.75rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.submit-button:hover:not(:disabled) {
		background-color: #6d4c41;
	}

	.submit-button:disabled {
		background-color: #e0e0e0;
		cursor: not-allowed;
	}

	.error-message {
		color: #d32f2f;
		font-size: 0.9rem;
		margin: 0;
		text-align: center;
	}

	.loader {
		width: 20px;
		height: 20px;
		border: 2px solid #ffffff;
		border-top: 2px solid transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 480px) {
		.signup-container {
			padding: 1rem;
		}

		.signup-card {
			padding: 1.5rem;
		}

		h1 {
			font-size: 1.75rem;
		}

		.subtitle {
			font-size: 1rem;
		}
	}
</style>
