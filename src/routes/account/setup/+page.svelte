<script>
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let usrname = '';
	let birthdate = '';
	let error = '';
	let loading = false;

	let email = '';
	$: email = $page.url.searchParams.get('email') ?? '';

	async function handleProfileSetup() {
		error = '';
		loading = true;

		if (!usrname.trim() || usrname.length < 3) {
			error = 'Username must be at least 3 characters.';
			loading = false;
			return;
		}

		const { data: profile, error: fetchError } = await supabase
			.from('profiles')
			.select('id')
			.eq('email', email)
			.single();

		if (fetchError || !profile) {
			error = 'Could not find your profile to update.';
			loading = false;
			return;
		}

		const { error: profileError } = await supabase
			.from('profiles')
			.update({
				username: usrname,
				bd: birthdate,
				is_active: true
			})
			.eq('id', profile.id);

		if (profileError) {
			error = profileError.message;
			loading = false;
			return;
		}

		goto(`/profile/${usrname}`);
	}
</script>

<form on:submit|preventDefault={handleProfileSetup}>
	<p>Username</p>
	<input type="text" bind:value={usrname} placeholder="MoonWriter3000" required minlength="3" />
	<p>Birthdate</p>
	<input type="date" bind:value={birthdate} placeholder="1/1/2001" />
	<button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Finish Signup'}</button>
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
		background-color: var(--color-border);
	}

	p {
		margin: 0.5rem 0;
	}
	input:focus {
		border-color: var(--color-accent);
	}
</style>
