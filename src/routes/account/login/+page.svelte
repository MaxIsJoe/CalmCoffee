<script>
	import LoginForm from '$lib/comp/account/auth/LoginForm.svelte';
</script>

<svelte:head>
	<title>Login - Calm Coffee</title>
	<meta name="description" content="Login to your Calm Coffee account to start writing, reading, and connecting with the community." />
	<meta property="og:title" content="Login - Calm Coffee" />
	<meta property="og:description" content="Login to your Calm Coffee account to start writing, reading, and connecting with the community." />
	<meta property="og:type" content="website" />
</svelte:head>

<div class="login-container">
	<div class="login-card">
		<div class="login-header">
			<h1>Welcome Back</h1>
			<p class="subtitle">Log in to continue your writing journey</p>
		</div>
		<LoginForm />
	</div>
</div>

<style>
	.login-container {
		min-height: calc(100vh - 4rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.login-card {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		padding: 2.5rem;
		width: 100%;
		max-width: 420px;
		animation: fadeIn 0.5s ease-out;
	}

	.login-header {
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

	.login-footer {
		margin-top: 1.5rem;
		text-align: center;
		color: #6d4c41;
	}

	.login-footer a {
		color: #a1887f;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.login-footer a:hover {
		color: #6d4c41;
		text-decoration: underline;
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
		.login-container {
			padding: 1rem;
		}

		.login-card {
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
