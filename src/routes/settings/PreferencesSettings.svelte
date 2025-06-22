<script lang="ts">
	import { onMount } from 'svelte';

	// List of all theme variables to control - updated to match app.css
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
		'--color-footer-muted',
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
		'--color-block-bg',
		'--color-block-list-bg',
		'--color-block-list-shadow',
		'--color-block-list-title',
		'--color-block-shadow',
		'--color-block-text',
		'--color-block-date',
		'--color-block-editor-bg',
		'--color-block-editor-shadow',
		'--color-block-btn-bg',
		'--color-block-btn-hover',
		'--color-block-btn-text',
		'--color-block-add-btn-bg',
		'--color-block-add-btn-hover',
		'--color-block-add-btn-text',
		'--color-block-wait',
		'--color-block-loading',
		'--color-block-error',
		'--color-block-wait-info-bg',
		'--color-block-wait-info-border',
		'--color-block-textarea-bg',
		'--color-block-textarea-border',
		'--color-block-textarea-shadow',
		'--color-block-toggle-bg',
		'--color-block-toggle-text',
		'--color-block-toggle-hover',
		'--color-block-toggle-border',
		'--color-block-toggle-hover-border',
		'--color-editor-bg',
		'--color-editor-border',
		'--color-editor-shadow',
		'--color-editor-header-bg',
		'--color-editor-header-border',
		'--color-editor-btn-bg',
		'--color-editor-btn-hover',
		'--color-editor-btn-text',
		'--color-editor-btn-border',
		'--color-editor-btn-active',
		'--color-editor-text',
		'--color-editor-secondary',
		'--color-toolbar-bg',
		'--color-toolbar-border',
		'--color-toolbar-group-bg',
		'--color-toolbar-btn-bg',
		'--color-toolbar-btn-hover',
		'--color-toolbar-btn-active',
		'--color-toolbar-btn-border',
		'--color-toolbar-btn-text',
		'--color-toolbar-btn-code-bg',
		'--color-microblog-bg',
		'--color-microblog-shadow',
		'--color-microblog-border',
		'--color-microblog-textarea-border',
		'--color-microblog-textarea-bg',
		'--color-microblog-text',
		'--color-microblog-focus',
		'--color-microblog-toggle',
		'--color-microblog-toggle-hover',
		'--color-microblog-styles-border',
		'--color-microblog-styles-bg',
		'--color-microblog-counter',
		'--color-microblog-post-bg',
		'--color-microblog-post-text',
		'--color-microblog-post-disabled-bg',
		'--color-microblog-post-disabled-text',
		'--color-microblog-post-hover-bg',
		'--color-microblog-error',
		'--color-microblog-warning',
		'--color-microblog-preview-bg',
		'--color-microblog-preview-border',
		'--color-microblog-preview-text',
		'--color-microblog-label',
		'--color-microblog-select-border',
		'--color-microblog-select-bg',
		'--color-microblog-select-text',
		'--color-microblog-tag-input-border',
		'--color-microblog-tag-input-bg',
		'--color-microblog-add-tag-bg',
		'--color-microblog-add-tag-text',
		'--color-microblog-add-tag-disabled-bg',
		'--color-microblog-add-tag-disabled-text',
		'--color-microblog-add-tag-hover-bg',
		'--color-microblog-tag-bg',
		'--color-microblog-tag-text',
		'--color-microblog-tag-border',
		'--color-microblog-remove-tag',
		'--color-microblog-remove-tag-hover',
		'--color-microblog-confirm-bg',
		'--color-microblog-confirm-text',
		'--color-microblog-confirm-disabled-bg',
		'--color-microblog-confirm-disabled-text',
		'--color-microblog-confirm-hover-bg',
		'--color-microblog-cancel-bg',
		'--color-microblog-cancel-text',
		'--color-microblog-cancel-hover-bg',
		'--color-microblog-cancel-hover-text',
		'--color-muted',
		'--color-error',
		'--color-character-card-bg',
		'--color-character-card-shadow',
		'--color-character-card-border',
		'--color-character-avatar-bg',
		'--color-character-avatar-border',
		'--color-character-avatar-shadow',
		'--color-character-name',
		'--color-character-type',
		'--color-character-gender',
		'--color-btn-primary',
		'--color-btn-primary-text',
		'--color-btn-primary-hover',
		'--color-character-tag-warning',
		'--color-character-add-tag-bg',
		'--color-character-add-tag-text',
		'--color-character-add-tag-disabled-bg',
		'--color-character-add-tag-disabled-text',
		'--color-character-add-tag-hover-bg',
		'--color-character-tag-bg',
		'--color-character-tag-text',
		'--color-character-tag-border',
		'--color-character-remove-tag',
		'--color-character-remove-tag-hover',
		'--color-character-art-hint',
		'--color-character-info-text',
		'--color-character-info-bg',
		'--color-character-info-label',
		'--color-character-info-border',
		'--color-character-info-shadow',
		'--color-character-relationship-bg',
		'--color-character-relationship-shadow',
		'--color-character-tag-panel-bg',
		'--color-character-tag-panel-shadow',
		'--color-character-tag-panel-title',
		'--color-blog-heading',
		'--color-blog-label',
		'--color-blog-select-bg',
		'--color-blog-select-border',
		'--color-blog-select-text',
		'--color-blog-select-focus-border',
		'--color-blog-select-focus-bg',
		'--color-blog-spinner-bg',
		'--color-blog-spinner-fg',
		'--color-blog-tabs-border',
		'--color-blog-tabs-btn',
		'--color-blog-tabs-btn-active',
		'--color-blog-tabs-btn-active-border',
		'--color-blog-tabs-btn-hover',
		'--color-blog-error'
	];

	// Group variables by category for better organization
	const VARIABLE_CATEGORIES = {
		'Core Colors': [
			'--color-bg', '--color-bg-alt', '--color-text', '--color-primary', '--color-primary-alt',
			'--color-secondary', '--color-accent', '--color-border', '--color-muted', '--color-error'
		],
		'Links & Navigation': [
			'--color-link', '--color-link-hover', '--color-navbar-bg', '--color-navbar-border',
			'--color-navbar-link', '--color-navbar-link-hover', '--color-navbar-shadow'
		],
		'Cards & Sections': [
			'--color-card-bg', '--color-card-shadow', '--color-section-bg', '--color-section-border',
			'--color-bg-hover'
		],
		'Footer & Banner': [
			'--color-footer-bg', '--color-footer-alt', '--color-footer-text', '--color-footer-link',
			'--color-footer-link-hover', '--color-footer-muted', '--color-banner-bg', '--color-banner-text',
			'--color-banner-hover'
		],
		'Buttons & Actions': [
			'--color-danger', '--color-danger-hover', '--color-success', '--color-btn-primary',
			'--color-btn-primary-text', '--color-btn-primary-hover'
		],
		'Block Editor': [
			'--color-block-bg', '--color-block-list-bg', '--color-block-list-shadow', '--color-block-list-title',
			'--color-block-shadow', '--color-block-text', '--color-block-date', '--color-block-editor-bg',
			'--color-block-editor-shadow', '--color-block-btn-bg', '--color-block-btn-hover', '--color-block-btn-text',
			'--color-block-add-btn-bg', '--color-block-add-btn-hover', '--color-block-add-btn-text',
			'--color-block-wait', '--color-block-loading', '--color-block-error', '--color-block-wait-info-bg',
			'--color-block-wait-info-border', '--color-block-textarea-bg', '--color-block-textarea-border',
			'--color-block-textarea-shadow', '--color-block-toggle-bg', '--color-block-toggle-text',
			'--color-block-toggle-hover', '--color-block-toggle-border', '--color-block-toggle-hover-border'
		],
		'Editor & Toolbar': [
			'--color-editor-bg', '--color-editor-border', '--color-editor-shadow', '--color-editor-header-bg',
			'--color-editor-header-border', '--color-editor-btn-bg', '--color-editor-btn-hover', '--color-editor-btn-text',
			'--color-editor-btn-border', '--color-editor-btn-active', '--color-editor-text', '--color-editor-secondary',
			'--color-toolbar-bg', '--color-toolbar-border', '--color-toolbar-group-bg', '--color-toolbar-btn-bg',
			'--color-toolbar-btn-hover', '--color-toolbar-btn-active', '--color-toolbar-btn-border',
			'--color-toolbar-btn-text', '--color-toolbar-btn-code-bg'
		],
		'Microblog': [
			'--color-microblog-bg', '--color-microblog-shadow', '--color-microblog-border', '--color-microblog-textarea-border',
			'--color-microblog-textarea-bg', '--color-microblog-text', '--color-microblog-focus', '--color-microblog-toggle',
			'--color-microblog-toggle-hover', '--color-microblog-styles-border', '--color-microblog-styles-bg',
			'--color-microblog-counter', '--color-microblog-post-bg', '--color-microblog-post-text',
			'--color-microblog-post-disabled-bg', '--color-microblog-post-disabled-text', '--color-microblog-post-hover-bg',
			'--color-microblog-error', '--color-microblog-warning', '--color-microblog-preview-bg',
			'--color-microblog-preview-border', '--color-microblog-preview-text', '--color-microblog-label',
			'--color-microblog-select-border', '--color-microblog-select-bg', '--color-microblog-select-text',
			'--color-microblog-tag-input-border', '--color-microblog-tag-input-bg', '--color-microblog-add-tag-bg',
			'--color-microblog-add-tag-text', '--color-microblog-add-tag-disabled-bg', '--color-microblog-add-tag-disabled-text',
			'--color-microblog-add-tag-hover-bg', '--color-microblog-tag-bg', '--color-microblog-tag-text',
			'--color-microblog-tag-border', '--color-microblog-remove-tag', '--color-microblog-remove-tag-hover',
			'--color-microblog-confirm-bg', '--color-microblog-confirm-text', '--color-microblog-confirm-disabled-bg',
			'--color-microblog-confirm-disabled-text', '--color-microblog-confirm-hover-bg', '--color-microblog-cancel-bg',
			'--color-microblog-cancel-text', '--color-microblog-cancel-hover-bg', '--color-microblog-cancel-hover-text'
		],
		'Characters': [
			'--color-character-card-bg', '--color-character-card-shadow', '--color-character-card-border',
			'--color-character-avatar-bg', '--color-character-avatar-border', '--color-character-avatar-shadow',
			'--color-character-name', '--color-character-type', '--color-character-gender', '--color-character-tag-warning',
			'--color-character-add-tag-bg', '--color-character-add-tag-text', '--color-character-add-tag-disabled-bg',
			'--color-character-add-tag-disabled-text', '--color-character-add-tag-hover-bg', '--color-character-tag-bg',
			'--color-character-tag-text', '--color-character-tag-border', '--color-character-remove-tag',
			'--color-character-remove-tag-hover', '--color-character-art-hint', '--color-character-info-text',
			'--color-character-info-bg', '--color-character-info-label', '--color-character-info-border',
			'--color-character-info-shadow', '--color-character-relationship-bg', '--color-character-relationship-shadow',
			'--color-character-tag-panel-bg', '--color-character-tag-panel-shadow', '--color-character-tag-panel-title'
		],
		'Blog': [
			'--color-blog-heading', '--color-blog-label', '--color-blog-select-bg', '--color-blog-select-border',
			'--color-blog-select-text', '--color-blog-select-focus-border', '--color-blog-select-focus-bg',
			'--color-blog-spinner-bg', '--color-blog-spinner-fg', '--color-blog-tabs-border', '--color-blog-tabs-btn',
			'--color-blog-tabs-btn-active', '--color-blog-tabs-btn-active-border', '--color-blog-tabs-btn-hover',
			'--color-blog-error'
		]
	};

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
	let showPreview = false;
	let showDeleteConfirm = false;
	let themeToDelete: string | null = null;

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

	function previewTheme() {
		if (showCreateForm && customThemeDraft.name.trim()) {
			injectCustomThemeStyle(customThemeDraft.variables);
		}
		showPreview = !showPreview;
	}

	function confirmDeleteTheme(themeName: string) {
		themeToDelete = themeName;
		showDeleteConfirm = true;
	}

	function deleteTheme() {
		if (themeToDelete) {
			customThemes = customThemes.filter(t => t.name !== themeToDelete);
			saveCustomThemes();
			
			// If the deleted theme was selected, switch to Morning Coffee
			if (selectedTheme === themeToDelete) {
				selectedTheme = 'Morning Coffee';
				applyTheme(BUILTIN_THEMES[0]);
			}
			
			themeToDelete = null;
			showDeleteConfirm = false;
		}
	}

	function cancelDelete() {
		themeToDelete = null;
		showDeleteConfirm = false;
	}
</script>

<h2>Preferences</h2>
<p>Customize your Calm Coffee experience.</p>

<div class="theme-section">
	<h3>Theme</h3>
	<div class="theme-selector">
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
		<div class="theme-actions">
			<button on:click={() => showCreateForm = !showCreateForm} class="create-theme-btn">
				{showCreateForm ? 'Cancel' : 'Create New Theme'}
			</button>
			{#if customThemes.length > 0}
				<div class="custom-themes-list">
					<h4>Custom Themes</h4>
					{#each customThemes as theme}
						<div class="custom-theme-item">
							<span>{theme.name}</span>
							<button 
								on:click={() => confirmDeleteTheme(theme.name)} 
								class="delete-theme-btn"
								title="Delete theme"
							>
								🗑️
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

{#if showDeleteConfirm}
	<div class="delete-confirm-overlay">
		<div class="delete-confirm-modal">
			<h4>Delete Theme</h4>
			<p>Are you sure you want to delete "{themeToDelete}"? This action cannot be undone.</p>
			<div class="delete-confirm-actions">
				<button on:click={deleteTheme} class="delete-confirm-btn">Delete</button>
				<button on:click={cancelDelete} class="cancel-btn">Cancel</button>
			</div>
		</div>
	</div>
{/if}

{#if showCreateForm}
	<div class="create-theme-form">
		<h4>Create Custom Theme</h4>
		<label>
			Theme Name:
			<input type="text" bind:value={customThemeDraft.name} placeholder="My Theme" />
		</label>
		
		<div class="theme-controls">
			<button on:click={previewTheme} class="preview-btn">
				{showPreview ? 'Hide Preview' : 'Show Preview'}
			</button>
			<button on:click={handleCreateTheme} class="save-theme-btn">Save Theme</button>
		</div>

		{#if showPreview}
			<div class="theme-preview">
				<h5>Theme Preview</h5>
				<div class="preview-container">
					<!-- Navbar Preview -->
					<div class="preview-navbar">
						<div class="preview-nav-item">Home</div>
						<div class="preview-nav-item">Stories</div>
						<div class="preview-nav-item">Characters</div>
						<div class="preview-nav-item">Blog</div>
					</div>
					
					<!-- Content Preview -->
					<div class="preview-content">
						<div class="preview-card">
							<h6>Sample Card</h6>
							<p>This is how cards will look with your theme colors.</p>
							<button class="preview-button">Sample Button</button>
						</div>
						
						<div class="preview-form">
							<label>Sample Form:</label>
							<input type="text" placeholder="Sample input" />
							<button class="preview-button primary">Primary Button</button>
							<button class="preview-button secondary">Secondary Button</button>
						</div>
						
						<div class="preview-tags">
							<span class="preview-tag">Tag 1</span>
							<span class="preview-tag">Tag 2</span>
							<span class="preview-tag">Tag 3</span>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<div class="theme-vars-container">
			{#each Object.entries(VARIABLE_CATEGORIES) as [category, variables]}
				<div class="theme-category">
					<h5>{category}</h5>
					<div class="theme-vars-grid">
						{#each variables as varName}
							<div class="theme-var-row">
								<label title={varName}>{varName.replace('--color-', '')}</label>
								<input 
									type="color" 
									bind:value={customThemeDraft.variables[varName]} 
									on:input={(e) => handleDraftVarChange(varName, (e.target as HTMLInputElement).value)} 
								/>
								<input 
									type="text" 
									bind:value={customThemeDraft.variables[varName]} 
									on:input={(e) => handleDraftVarChange(varName, (e.target as HTMLInputElement).value)} 
									size="8" 
								/>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
.theme-section {
	margin: 2rem 0;
}
.theme-selector {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
.theme-actions {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
.create-theme-btn {
	padding: 0.4em 1em;
	background: var(--color-primary);
	color: var(--color-primary-alt);
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 1em;
	align-self: flex-start;
}
.custom-themes-list {
	margin-top: 1rem;
}
.custom-themes-list h4 {
	margin: 0 0 0.5rem 0;
	color: var(--color-text);
	font-size: 1em;
}
.custom-theme-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.5rem;
	background: var(--color-card-bg);
	border: 1px solid var(--color-border);
	border-radius: 4px;
	margin-bottom: 0.5rem;
}
.custom-theme-item span {
	color: var(--color-text);
}
.delete-theme-btn {
	background: none;
	border: none;
	cursor: pointer;
	font-size: 1.2em;
	padding: 0.2rem;
	border-radius: 4px;
	transition: background-color 0.2s;
}
.delete-theme-btn:hover {
	background: var(--color-danger);
	color: white;
}
.delete-confirm-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}
.delete-confirm-modal {
	background: var(--color-card-bg);
	padding: 2rem;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	max-width: 400px;
	width: 90%;
}
.delete-confirm-modal h4 {
	margin: 0 0 1rem 0;
	color: var(--color-text);
}
.delete-confirm-modal p {
	margin: 0 0 1.5rem 0;
	color: var(--color-text);
}
.delete-confirm-actions {
	display: flex;
	gap: 1rem;
	justify-content: flex-end;
}
.delete-confirm-btn {
	padding: 0.5rem 1rem;
	background: var(--color-danger);
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}
.cancel-btn {
	padding: 0.5rem 1rem;
	background: var(--color-secondary);
	color: var(--color-text);
	border: none;
	border-radius: 4px;
	cursor: pointer;
}
.create-theme-form {
	margin: 2rem 0;
	padding: 1.5rem;
	background: var(--color-card-bg);
	border-radius: 10px;
	box-shadow: 0 2px 8px var(--color-card-shadow);
}
.theme-controls {
	display: flex;
	gap: 1rem;
	margin: 1rem 0;
}
.preview-btn {
	padding: 0.5em 1.5em;
	background: var(--color-secondary);
	color: var(--color-text);
	border: none;
	border-radius: 6px;
	font-size: 1em;
	cursor: pointer;
}
.theme-vars-container {
	display: flex;
	flex-direction: column;
	gap: 2rem;
	margin-top: 2rem;
}
.theme-category {
	border: 1px solid var(--color-border);
	border-radius: 8px;
	padding: 1.5rem;
	background: var(--color-section-bg);
}
.theme-category h5 {
	margin: 0 0 1rem 0;
	color: var(--color-text);
	border-bottom: 2px solid var(--color-primary);
	padding-bottom: 0.5rem;
}
.theme-vars-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 0.8rem;
}
.theme-var-row {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem;
	background: var(--color-bg-alt);
	border-radius: 4px;
	border: 1px solid var(--color-border);
}
.theme-var-row label {
	flex: 1;
	font-size: 0.85em;
	color: var(--color-text);
	font-family: monospace;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.theme-var-row input[type="color"] {
	width: 40px;
	height: 30px;
	border: 1px solid var(--color-border);
	border-radius: 4px;
	cursor: pointer;
}
.theme-var-row input[type="text"] {
	width: 80px;
	padding: 0.3rem;
	border: 1px solid var(--color-border);
	border-radius: 4px;
	background: var(--color-bg-alt);
	color: var(--color-text);
	font-family: monospace;
	font-size: 0.85em;
}
.save-theme-btn {
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

/* Preview Styles */
.theme-preview {
	margin: 2rem 0;
	padding: 1.5rem;
	background: var(--color-bg);
	border: 2px solid var(--color-border);
	border-radius: 8px;
}
.theme-preview h5 {
	margin: 0 0 1rem 0;
	color: var(--color-text);
}
.preview-container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
.preview-navbar {
	display: flex;
	background: var(--color-navbar-bg);
	border-bottom: 1px solid var(--color-navbar-border);
	padding: 0.5rem 1rem;
	gap: 1rem;
	box-shadow: 0 2px 4px var(--color-navbar-shadow);
}
.preview-nav-item {
	color: var(--color-navbar-link);
	cursor: pointer;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
}
.preview-nav-item:hover {
	background: var(--color-navbar-link-hover);
	color: var(--color-navbar-link-hover);
}
.preview-content {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 1rem;
	background: var(--color-bg);
}
.preview-card {
	background: var(--color-card-bg);
	border: 1px solid var(--color-border);
	border-radius: 8px;
	padding: 1rem;
	box-shadow: 0 2px 4px var(--color-card-shadow);
}
.preview-card h6 {
	margin: 0 0 0.5rem 0;
	color: var(--color-text);
}
.preview-card p {
	margin: 0 0 1rem 0;
	color: var(--color-text);
}
.preview-form {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 1rem;
	background: var(--color-section-bg);
	border: 1px solid var(--color-section-border);
	border-radius: 6px;
}
.preview-form label {
	color: var(--color-text);
	font-weight: 500;
}
.preview-form input {
	padding: 0.5rem;
	border: 1px solid var(--color-border);
	border-radius: 4px;
	background: var(--color-bg-alt);
	color: var(--color-text);
}
.preview-button {
	padding: 0.5rem 1rem;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 0.9em;
}
.preview-button.primary {
	background: var(--color-btn-primary);
	color: var(--color-btn-primary-text);
}
.preview-button.secondary {
	background: var(--color-secondary);
	color: var(--color-text);
}
.preview-tags {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}
.preview-tag {
	background: var(--color-character-tag-bg);
	color: var(--color-character-tag-text);
	border: 1px solid var(--color-character-tag-border);
	padding: 0.25rem 0.5rem;
	border-radius: 12px;
	font-size: 0.8em;
}
</style>
