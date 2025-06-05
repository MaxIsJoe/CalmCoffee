<script lang="ts">
	import { onMount } from 'svelte';
	import AccountSettings from './AccountSettings.svelte';
	import InvitesSettings from './InvitesSettings.svelte';
	import PreferencesSettings from './PreferencesSettings.svelte';

	const categories = [
		{ key: 'account', label: 'Account' },
		{ key: 'invites', label: 'Invites' },
		{ key: 'preferences', label: 'Preferences' }
	];

	let selected = 'account';

	let components = {
		account: AccountSettings,
		invites: InvitesSettings,
		preferences: PreferencesSettings
	};
</script>

<div class="settings-container">
	<aside class="settings-sidebar">
		{#each categories as cat}
			<button class:selected={selected === cat.key} on:click={() => (selected = cat.key)}>
				{cat.label}
			</button>
		{/each}
	</aside>
	<main class="settings-main">
		<svelte:component this={components[selected]} />
	</main>
</div>

<style>
	/* filepath: f:\projects\websites\CalmCaf\calm-coffee\src\routes\settings\+page.svelte */
	.settings-container {
		display: flex;
		max-width: 700px;
		margin: 2.5rem auto;
		background: #fff;
		border-radius: 14px;
		box-shadow: 0 4px 24px rgba(99, 102, 241, 0.07);
		min-height: 400px;
	}
	.settings-sidebar {
		display: flex;
		flex-direction: column;
		background: #f3f4f6;
		padding: 2rem 1.2rem 2rem 1.2rem;
		border-radius: 14px 0 0 14px;
		min-width: 150px;
	}
	.settings-sidebar button {
		background: none;
		border: none;
		color: #3730a3;
		font-size: 1.08rem;
		padding: 0.7em 0.5em;
		margin-bottom: 0.5em;
		border-radius: 6px;
		cursor: pointer;
		text-align: left;
		transition: background 0.15s;
	}
	.settings-sidebar button.selected,
	.settings-sidebar button:hover {
		background: #e0e7ff;
		color: #4f46e5;
	}
	.settings-main {
		flex: 1;
		padding: 2.2rem 2rem;
	}
	@media (max-width: 700px) {
		.settings-container {
			flex-direction: column;
			max-width: 98vw;
		}
		.settings-sidebar {
			flex-direction: row;
			border-radius: 14px 14px 0 0;
			padding: 1rem 0.5rem;
			min-width: 0;
			justify-content: center;
		}
		.settings-sidebar button {
			margin: 0 0.5em 0 0;
			padding: 0.7em 1.2em;
		}
		.settings-main {
			padding: 1.2rem 0.7rem;
		}
	}
</style>
