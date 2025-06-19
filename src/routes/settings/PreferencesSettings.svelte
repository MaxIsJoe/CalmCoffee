<script lang="ts">
	import { onMount } from 'svelte';

	// List of all theme variables to control
	const THEME_VARIABLES = [
		'--color-bg',
		'--color-bg-alt',
		'--color-text',
		'--color-primary',
		'--color-primary-alt',
		'--color-secondary',
		'--color-accent',
		'--color-link',
		'--color-link-hover',
		'--color-footer-bg',
		'--color-footer-alt',
		'--color-footer-text',
		'--color-footer-link',
		'--color-footer-link-hover',
		'--color-banner-bg',
		'--color-banner-text',
		'--color-banner-hover',
		'--color-border',
		'--color-card-bg',
		'--color-card-shadow',
		'--color-danger',
		'--color-danger-hover',
		'--color-success',
		'--color-bg-hover',
		'--color-navbar-bg',
		'--color-navbar-border',
		'--color-navbar-link',
		'--color-navbar-link-hover',
		'--color-navbar-shadow',
		'--color-section-bg',
		'--color-section-border',
	];

	type Theme = {
		name: string;
		variables: Record<string, string>;
		isCustom?: boolean;
	};

	const BUILTIN_THEMES: Theme[] = [
		{
			name: 'Morning Coffee',
			variables: {}, // Uses :root
		},
		{
			name: 'Dark Chocolate',
			variables: {}, // Uses [data-theme="dark"]
		},
		{
			name: 'Caramel',
			variables: {}, // Uses [data-theme="caramel"]
		},
	];

	let customThemes: Theme[] = [];
	let selectedTheme: string = 'Morning Coffee';
	let customThemeDraft: Theme = {
		name: '',
		variables: Object.fromEntries(THEME_VARIABLES.map(v => [v, '#ffffff'])),
		isCustom: true
	};
	let showCreateForm = false;

	function loadCustomThemes() {
		const raw = localStorage.getItem('customThemes');
		customThemes = raw ? JSON.parse(raw) : [];
	}

	function saveCustomThemes() {
		localStorage.setItem('customThemes', JSON.stringify(customThemes));
	}

	function applyTheme(theme: Theme) {
		if (theme.name === 'Morning Coffee') {
			document.documentElement.setAttribute('data-theme', 'light');
			removeCustomThemeStyle();
			localStorage.setItem('theme', 'Morning Coffee');
		} else if (theme.name === 'Dark Chocolate') {
			document.documentElement.setAttribute('data-theme', 'dark');
			removeCustomThemeStyle();
			localStorage.setItem('theme', 'Dark Chocolate');
		} else if (theme.name === 'Caramel') {
			document.documentElement.setAttribute('data-theme', 'caramel');
			removeCustomThemeStyle();
			localStorage.setItem('theme', 'Caramel');
		} else {
			document.documentElement.setAttribute('data-theme', 'custom');
			injectCustomThemeStyle(theme.variables);
			localStorage.setItem('theme', theme.name);
		}
	}

	function injectCustomThemeStyle(vars: Record<string, string>) {
		removeCustomThemeStyle();
		const style = document.createElement('style');
		style.id = 'custom-theme-style';
		let css = ':root {';
		for (const v of THEME_VARIABLES) {
			css += `${v}: ${vars[v]};`;
		}
		css += '}';
		style.textContent = css;
		document.head.appendChild(style);
	}

	function removeCustomThemeStyle() {
		const el = document.getElementById('custom-theme-style');
		if (el) el.remove();
	}

	onMount(() => {
		loadCustomThemes();
		const saved = localStorage.getItem('theme');
		if (saved) {
			selectedTheme = saved;
			let themeName = saved;
			if (saved === 'light') themeName = 'Morning Coffee';
			if (saved === 'dark') themeName = 'Dark Chocolate';
			const found = [...BUILTIN_THEMES, ...customThemes].find(t => t.name === themeName);
			if (found) applyTheme(found);
		}
	});

	function handleThemeChange(e: Event) {
		const target = e.target;
		if (!(target instanceof HTMLSelectElement)) return;
		const name = target.value;
		selectedTheme = name;
		const found = [...BUILTIN_THEMES, ...customThemes].find(t => t.name === name);
		if (found) applyTheme(found);
	}

	function handleCreateTheme() {
		if (!customThemeDraft.name.trim()) return;
		customThemes = [...customThemes, { ...customThemeDraft }];
		saveCustomThemes();
		selectedTheme = customThemeDraft.name;
		applyTheme(customThemeDraft);
		showCreateForm = false;
		customThemeDraft = {
			name: '',
			variables: Object.fromEntries(THEME_VARIABLES.map(v => [v, '#ffffff'])),
			isCustom: true
		};
	}

	function handleDraftVarChange(varName: string, value: string) {
		customThemeDraft.variables[varName] = value;
	}
</script>

<h2>Preferences</h2>
<p>Customize your Calm Coffee experience.</p>

<div class="theme-section">
	<h3>Theme</h3>
	<label>
		Select Theme:
		<select bind:value={selectedTheme} on:change={handleThemeChange}>
			{#each BUILTIN_THEMES as theme}
				<option value={theme.name}>{theme.name}</option>
			{/each}
			{#each customThemes as theme}
				<option value={theme.name}>{theme.name} (Custom)</option>
			{/each}
		</select>
	</label>
	<button on:click={() => showCreateForm = !showCreateForm} class="create-theme-btn">{showCreateForm ? 'Cancel' : 'Create New Theme'}</button>
</div>

{#if showCreateForm}
	<div class="create-theme-form">
		<h4>Create Custom Theme</h4>
		<label>
			Theme Name:
			<input type="text" bind:value={customThemeDraft.name} placeholder="My Theme" />
		</label>
		<div class="theme-vars-grid">
			{#each THEME_VARIABLES as varName}
				<div class="theme-var-row">
					<label>{varName}</label>
					<input type="color" bind:value={customThemeDraft.variables[varName]} on:input={e => handleDraftVarChange(varName, e.target.value)} />
					<input type="text" bind:value={customThemeDraft.variables[varName]} on:input={e => handleDraftVarChange(varName, e.target.value)} size="10" />
				</div>
			{/each}
		</div>
		<button on:click={handleCreateTheme} class="save-theme-btn">Save Theme</button>
	</div>
{/if}

<style>
.theme-section {
	margin: 2rem 0;
}
.create-theme-btn {
	margin-left: 1rem;
	padding: 0.4em 1em;
	background: var(--color-primary);
	color: var(--color-primary-alt);
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 1em;
}
.create-theme-form {
	margin: 2rem 0;
	padding: 1.5rem;
	background: var(--color-card-bg);
	border-radius: 10px;
	box-shadow: 0 2px 8px var(--color-card-shadow);
}
.theme-vars-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	gap: 1rem;
	margin-top: 1rem;
}
.theme-var-row {
	display: flex;
	align-items: center;
	gap: 0.7em;
}
.theme-var-row label {
	flex: 1 0 120px;
	font-size: 0.95em;
	color: var(--color-secondary);
}
.save-theme-btn {
	margin-top: 1.5rem;
	padding: 0.5em 1.5em;
	background: var(--color-success);
	color: #fff;
	border: none;
	border-radius: 6px;
	font-size: 1em;
	cursor: pointer;
}
.save-theme-btn:hover {
	background: var(--color-accent);
}
</style>
