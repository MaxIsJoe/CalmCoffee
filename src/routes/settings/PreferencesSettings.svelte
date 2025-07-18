<script lang="ts">
	import { onMount } from 'svelte';
	import ZenMarkdownEditor from '$lib/comp/markdown/ZenMarkdownEditor.svelte';
	import WordInfoCacheManager from '$lib/comp/common/WordInfoCacheManager.svelte';
	import {
		THEME_VARIABLES,
		VARIABLE_CATEGORIES,
		BUILTIN_THEMES,
		type Theme,
		exportThemeToCSS,
		exportCurrentThemeToCSS,
		importThemeFromCSS,
		updatePaletteColor,
		randomizeTheme,
		adjustBrightness,
		handleCreateTheme,
		saveCustomThemes,
		injectCustomThemeStyle,
		customThemes,
		selectedTheme,
		customThemeDraft,
		showCreateForm,
		showPreview,
		showDeleteConfirm,
		themeToDelete,
		editingTheme,
		hasRandomized,
		showBrightnessSlider,
		brightnessAdjustment,
		originalPalette,
		hideSliderTimeout
	} from './themeLogic';

	$: if ($showPreview && $showCreateForm) {
		injectCustomThemeStyle($customThemeDraft.variables);
	}

	onMount(() => {
		const raw = localStorage.getItem('customThemes');
		if (raw) customThemes.set(JSON.parse(raw));
		const saved = localStorage.getItem('theme');
		if (saved) {
			selectedTheme.set(saved);
			let themeName = saved;
			if (saved === 'light') themeName = 'Morning Coffee';
			if (saved === 'dark') themeName = 'Dark Chocolate';
			const found = [...BUILTIN_THEMES, ...$customThemes].find((t) => t.name === themeName);
			if (found) {
				if (found.name === 'Morning Coffee') {
					document.documentElement.setAttribute('data-theme', 'light');
				} else if (found.name === 'Dark Chocolate') {
					document.documentElement.setAttribute('data-theme', 'dark');
				} else if (found.name === 'Blueberry Frost') {
					document.documentElement.setAttribute('data-theme', 'caramel');
				} else if (found.name === 'Strawberry Frab') {
					document.documentElement.setAttribute('data-theme', 'strawberry-frap');
				} else {
					document.documentElement.setAttribute('data-theme', 'custom');
					const styleId = 'custom-theme-style';
					const existing = document.getElementById(styleId);
					if (existing) existing.remove();
					const style = document.createElement('style');
					style.id = styleId;
					let css = ':root {';
					for (const v of THEME_VARIABLES) {
						css += `${v}: ${found.variables[v]};`;
					}
					css += '}';
					style.textContent = css;
					document.head.appendChild(style);
				}
			}
		}
	});

	function toggleCreateForm() {
		showCreateForm.update((v) => !v);
	}
	function handleThemeChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		if (!target) return;
		selectedTheme.set(target.value);
	}
	function handleFileImport(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			if (file.type === 'text/css' || file.name.endsWith('.css')) {
				importThemeFromCSS(file);
			} else {
				alert('Please select a valid CSS file.');
			}
		}
		input.value = '';
	}
	function editTheme(themeName: string): void {
		const themeToEdit = $customThemes.find((t) => t.name === themeName);
		if (!themeToEdit) return;
		customThemeDraft.set({
			name: themeToEdit.name,
			variables: { ...themeToEdit.variables },
			isCustom: true
		});
		editingTheme.set(themeName);
		showCreateForm.set(true);
	}
	function confirmDeleteTheme(themeName: string) {
		themeToDelete.set(themeName);
		showDeleteConfirm.set(true);
	}
	function deleteTheme() {
		const toDelete = $themeToDelete;
		if (toDelete) {
			const filtered = $customThemes.filter((t) => t.name !== toDelete);
			customThemes.set(filtered);
			saveCustomThemes();
			if ($selectedTheme === toDelete) {
				selectedTheme.set('Morning Coffee');
			}
			themeToDelete.set(null);
			showDeleteConfirm.set(false);
		}
	}
	function cancelDelete() {
		themeToDelete.set(null);
		showDeleteConfirm.set(false);
	}
	function previewTheme() {
		showPreview.update((v) => !v);
	}
	function handleSliderMouseEnter() {
		if ($hideSliderTimeout) {
			clearTimeout($hideSliderTimeout);
			hideSliderTimeout.set(null);
		}
	}
	function handleSliderMouseLeave() {
		hideSliderTimeout.set(
			setTimeout(() => {
				showBrightnessSlider.set(false);
				hideSliderTimeout.set(null);
			}, 2000)
		);
	}
	function handleRandomizeMouseEnter() {
		if ($hasRandomized) {
			showBrightnessSlider.set(true);
			if ($hideSliderTimeout) {
				clearTimeout($hideSliderTimeout);
				hideSliderTimeout.set(null);
			}
		}
	}
	function handleRandomizeMouseLeave() {
		hideSliderTimeout.set(
			setTimeout(() => {
				showBrightnessSlider.set(false);
				hideSliderTimeout.set(null);
			}, 2000)
		);
	}
	function handleDraftVarChange(varName: string, value: string) {
		customThemeDraft.update((draft) => {
			draft.variables[varName] = value;
			return draft;
		});
	}
</script>

<h2>Preferences</h2>
<p>Customize your Calm Coffee experience.</p>

<WordInfoCacheManager />

<div class="theme-section">
	<h3>Theme</h3>
	<div class="theme-selector">
		<label>
			Select Theme:
			<select value={$selectedTheme} on:change={handleThemeChange}>
				{#each BUILTIN_THEMES as theme}
					<option value={theme.name}>{theme.name}</option>
				{/each}
				{#each $customThemes as theme}
					<option value={theme.name}>{theme.name} (Custom)</option>
				{/each}
			</select>
		</label>
		<div class="theme-actions">
			<div class="theme-action-buttons">
				<button on:click={toggleCreateForm} class="create-theme-btn">
					{$showCreateForm ? 'Cancel' : 'Create New Theme'}
				</button>
				<button on:click={exportCurrentThemeToCSS} class="export-theme-btn">
					📁 Export Theme
				</button>
				<button
					on:click={() => document.getElementById('import-theme-input')?.click()}
					class="import-theme-btn"
				>
					📂 Import Theme
				</button>
			</div>
			<input
				id="import-theme-input"
				type="file"
				accept=".css,text/css"
				style="display: none;"
				on:change={handleFileImport}
			/>
			{#if $customThemes.length > 0}
				<div class="custom-themes-list">
					<h4>Custom Themes</h4>
					{#each $customThemes as theme}
						<div class="custom-theme-item">
							<span>{theme.name}</span>
							<div class="theme-item-actions">
								<button
									on:click={() => editTheme(theme.name)}
									class="edit-theme-btn"
									title="Edit theme"
								>
									✏️
								</button>
								<button
									on:click={() => confirmDeleteTheme(theme.name)}
									class="delete-theme-btn"
									title="Delete theme"
								>
									🗑️
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

{#if $showDeleteConfirm}
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

{#if $showCreateForm}
	<div class="create-theme-form">
		<h4>Create Custom Theme</h4>
		<label>
			Theme Name:
			<input
				type="text"
				value={$customThemeDraft.name}
				placeholder="My Theme"
				on:input={(e) =>
					customThemeDraft.update((d) => {
						d.name = (e.target as HTMLInputElement).value;
						return d;
					})}
			/>
		</label>

		<div class="theme-controls">
			<button on:click={previewTheme} class="preview-btn">
				{$showPreview ? 'Hide Preview' : 'Show Preview'}
			</button>
			<div class="randomize-container">
				{#if $showBrightnessSlider}
					<div
						class="brightness-slider-container"
						on:mouseenter={handleSliderMouseEnter}
						on:mouseleave={handleSliderMouseLeave}
					>
						<div class="brightness-slider">
							<label for="brightness-slider"
								>Brightness: {$brightnessAdjustment > 0 ? '+' : ''}{$brightnessAdjustment}%</label
							>
							<input
								id="brightness-slider"
								type="range"
								min="-45"
								max="45"
								value={$brightnessAdjustment}
								on:input={(e) => adjustBrightness(parseInt((e.target as HTMLInputElement).value))}
								class="brightness-range"
							/>
							<div class="brightness-labels">
								<span>Darker</span>
								<span>Brighter</span>
							</div>
						</div>
					</div>
				{/if}
				<button
					on:click={randomizeTheme}
					class="randomize-btn"
					on:mouseenter={handleRandomizeMouseEnter}
					on:mouseleave={handleRandomizeMouseLeave}
				>
					🎨 Randomize Colors
				</button>
			</div>
			<button on:click={exportCurrentThemeToCSS} class="export-theme-btn"> 📁 Export CSS </button>
			<button on:click={handleCreateTheme} class="save-theme-btn">
				{$editingTheme ? 'Update Theme' : 'Save Theme'}
			</button>
		</div>

		{#if $showPreview}
			<div class="theme-preview">
				<h5>Theme Preview Gallery</h5>

				<!-- Palette Preview Section -->
				<div class="preview-section">
					<h6>Color Palette</h6>
					<div class="palette-preview">
						<div class="palette-colors">
							<div class="palette-color-item">
								<label>Primary</label>
								<div class="color-picker-group">
									<input
										type="color"
										value={$customThemeDraft.variables['--color-primary']}
										on:input={(e) =>
											updatePaletteColor('primary', (e.target as HTMLInputElement).value)}
									/>
									<input
										type="text"
										value={$customThemeDraft.variables['--color-primary']}
										on:input={(e) =>
											handleDraftVarChange('primary', (e.target as HTMLInputElement).value)}
										size="8"
									/>
								</div>
							</div>
							<div class="palette-color-item">
								<label>Secondary</label>
								<div class="color-picker-group">
									<input
										type="color"
										value={$customThemeDraft.variables['--color-secondary']}
										on:input={(e) =>
											updatePaletteColor('secondary', (e.target as HTMLInputElement).value)}
									/>
									<input
										type="text"
										value={$customThemeDraft.variables['--color-secondary']}
										on:input={(e) =>
											handleDraftVarChange('secondary', (e.target as HTMLInputElement).value)}
										size="8"
									/>
								</div>
							</div>
							<div class="palette-color-item">
								<label>Accent</label>
								<div class="color-picker-group">
									<input
										type="color"
										value={$customThemeDraft.variables['--color-accent']}
										on:input={(e) =>
											updatePaletteColor('accent', (e.target as HTMLInputElement).value)}
									/>
									<input
										type="text"
										value={$customThemeDraft.variables['--color-accent']}
										on:input={(e) =>
											handleDraftVarChange('accent', (e.target as HTMLInputElement).value)}
										size="8"
									/>
								</div>
							</div>
							<div class="palette-color-item">
								<label>Background</label>
								<div class="color-picker-group">
									<input
										type="color"
										value={$customThemeDraft.variables['--color-bg']}
										on:input={(e) => updatePaletteColor('bg', (e.target as HTMLInputElement).value)}
									/>
									<input
										type="text"
										value={$customThemeDraft.variables['--color-bg']}
										on:input={(e) =>
											handleDraftVarChange('bg', (e.target as HTMLInputElement).value)}
										size="8"
									/>
								</div>
							</div>
							<div class="palette-color-item">
								<label>Text</label>
								<div class="color-picker-group">
									<input
										type="color"
										value={$customThemeDraft.variables['--color-text']}
										on:input={(e) =>
											updatePaletteColor('text', (e.target as HTMLInputElement).value)}
									/>
									<input
										type="text"
										value={$customThemeDraft.variables['--color-text']}
										on:input={(e) =>
											handleDraftVarChange('text', (e.target as HTMLInputElement).value)}
										size="8"
									/>
								</div>
							</div>
							<div class="palette-color-item">
								<label>Link</label>
								<div class="color-picker-group">
									<input
										type="color"
										value={$customThemeDraft.variables['--color-link']}
										on:input={(e) =>
											updatePaletteColor('link', (e.target as HTMLInputElement).value)}
									/>
									<input
										type="text"
										value={$customThemeDraft.variables['--color-link']}
										on:input={(e) =>
											handleDraftVarChange('link', (e.target as HTMLInputElement).value)}
										size="8"
									/>
								</div>
							</div>
						</div>
						<div class="palette-preview-visual">
							<div
								class="palette-swatch primary"
								style="background-color: {$customThemeDraft.variables['--color-primary']}"
							></div>
							<div
								class="palette-swatch secondary"
								style="background-color: {$customThemeDraft.variables['--color-secondary']}"
							></div>
							<div
								class="palette-swatch accent"
								style="background-color: {$customThemeDraft.variables['--color-accent']}"
							></div>
							<div
								class="palette-swatch bg"
								style="background-color: {$customThemeDraft.variables['--color-bg']}"
							></div>
							<div
								class="palette-swatch text"
								style="background-color: {$customThemeDraft.variables['--color-text']}"
							></div>
							<div
								class="palette-swatch link"
								style="background-color: {$customThemeDraft.variables['--color-link']}"
							></div>
						</div>
					</div>
				</div>

				<div class="preview-gallery">
					<!-- Navigation Bar Preview -->
					<div class="preview-section">
						<h6>Navigation Bar</h6>
						<div class="preview-navbar">
							<div class="preview-nav-left">
								<span class="preview-logo">CalmCoffee</span>
								<div class="preview-nav-links">
									<span>Stories</span>
									<span>Microblogs</span>
									<span>Characters</span>
								</div>
							</div>
							<div class="preview-nav-right">
								<div class="preview-search">
									<input type="text" placeholder="Search tags..." />
									<button>🔍</button>
								</div>
								<div class="preview-user">
									<div class="preview-avatar">U</div>
									<span>Username</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Login Form Preview -->
					<div class="preview-section">
						<h6>Login Form</h6>
						<div class="preview-login-form">
							<input type="email" placeholder="Email" />
							<input type="password" placeholder="Password" />
							<button type="submit">Login</button>
							<p>Don't have an account? <a href="#">Sign up here</a></p>
						</div>
					</div>

					<!-- Microblog Preview -->
					<div class="preview-section">
						<h6>Microblog Post</h6>
						<div class="preview-microblog">
							<div class="preview-microblog-header">
								<img
									class="preview-microblog-pfp"
									src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNlNWU3ZWIiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwODYgOCA4QzggMTAuMjA5MSA5Ljc5MDg2IDEyIDEyIDEyWiIgZmlsbD0iI2E2N2M1MiIvPgo8cGF0aCBkPSJNMTIgMTRDMTUuMzEzNyAxNCAxOCAxNi42ODYzIDE4IDIwSDFDMSAxNi42ODYzIDMuNjg2MyAxNCA3IDE0SDEyWiIgZmlsbD0iI2E2N2M1MiIvPgo8L3N2Zz4KPC9zdmc+"
									alt="pfp"
								/>
								<span class="preview-microblog-writer">Username</span>
							</div>
							<div class="preview-microblog-content">
								This is a sample microblog post showing how content will look with your custom theme
								colors.
							</div>
							<div class="preview-microblog-tags">
								<span class="preview-microblog-tag">sample</span>
								<span class="preview-microblog-tag">theme</span>
								<span class="preview-microblog-tag">preview</span>
							</div>
							<div class="preview-microblog-reactions">
								<button class="preview-reaction-btn">💖 2</button>
								<button class="preview-reaction-btn">👀 1</button>
								<button class="preview-reaction-btn">😐 0</button>
								<button class="preview-reaction-btn">🗑️ 0</button>
							</div>
							<small class="preview-microblog-date">
								{new Date().toLocaleString()} | Everyone
							</small>
						</div>
					</div>

					<!-- Character Card Preview -->
					<div class="preview-section">
						<h6>Character Profile</h6>
						<div class="preview-character-card">
							<div class="preview-character-avatar">
								<img
									src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjZTRiODg5Ii8+Cjxzdmcgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHg9IjIwIiB5PSIyMCI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwODYgOCA4QzggMTAuMjA5MSA5Ljc5MDg2IDEyIDEyIDEyWiIgZmlsbD0iI2E2N2M1MiIvPgo8cGF0aCBkPSJNMTIgMTRDMTUuMzEzNyAxNCAxOCAxNi42ODYzIDE4IDIwSDFDMSAxNi42ODYzIDMuNjg2MyAxNCA3IDE0SDEyWiIgZmlsbD0iI2E2N2M1MiIvPgo8L3N2Zz4KPC9zdmc+"
									alt="Avatar"
								/>
							</div>
							<div class="preview-character-info">
								<div><strong>Name:</strong> Sample Character</div>
								<div><strong>Type:</strong> OC</div>
								<div><strong>Gender:</strong> 🧙‍♂️ M</div>
								<div><strong>Created:</strong> {new Date().toLocaleDateString()}</div>
								<div><strong>Creator:</strong> <a href="#">Username</a></div>
							</div>
							<div class="preview-character-reactions">
								<button class="preview-reaction-btn">💖 3</button>
								<button class="preview-reaction-btn">👀 1</button>
								<button class="preview-reaction-btn">😐 0</button>
								<button class="preview-reaction-btn">🗑️ 0</button>
							</div>
						</div>
					</div>

					<!-- Story Block Preview -->
					<div class="preview-section">
						<h6>Story Block</h6>
						<div class="preview-story-block">
							<div class="preview-block-content">
								This is a sample story block showing how your content will appear with the custom
								theme. It includes <strong>bold text</strong>, <em>italic text</em>, and
								<a href="#">links</a>.
							</div>
							<div class="preview-block-actions">
								<button class="preview-block-btn">Edit</button>
								<button class="preview-block-btn">💬 2</button>
								<small class="preview-block-date">{new Date().toLocaleString()}</small>
							</div>
						</div>
					</div>

					<!-- Form Elements Preview -->
					<div class="preview-section">
						<h6>Form Elements</h6>
						<div class="preview-form-elements">
							<label>Sample Label:</label>
							<input type="text" placeholder="Sample input field" />
							<select>
								<option>Option 1</option>
								<option>Option 2</option>
								<option>Option 3</option>
							</select>
							<textarea placeholder="Sample textarea"></textarea>
							<div class="preview-form-buttons">
								<button class="preview-btn primary">Primary Button</button>
								<button class="preview-btn secondary">Secondary Button</button>
								<button class="preview-btn danger">Danger Button</button>
							</div>
						</div>
					</div>

					<!-- Tag System Preview -->
					<div class="preview-section">
						<h6>Tag System</h6>
						<div class="preview-tag-system">
							<div class="preview-tag-input">
								<input type="text" placeholder="Add tag and press Enter" />
								<button class="preview-add-tag-btn">Add</button>
							</div>
							<div class="preview-tag-list">
								<span class="preview-tag">sample <button class="preview-remove-tag">×</button></span
								>
								<span class="preview-tag">theme <button class="preview-remove-tag">×</button></span>
								<span class="preview-tag"
									>preview <button class="preview-remove-tag">×</button></span
								>
							</div>
						</div>
					</div>

					<!-- Zen Markdown Editor Preview -->
					<div class="preview-section">
						<h6>Zen Markdown Editor</h6>
						<div class="preview-zen-editor">
							<ZenMarkdownEditor
								value="# Sample Markdown\n\nThis is a **bold** and *italic* text with [links](https://example.com).\n\n- List item 1\n- List item 2\n- List item 3\n\n```javascript\nconsole.log('Hello, World!');\n```"
								placeholder="Start writing your markdown content..."
								maxLength={1000}
								showPreview={true}
								zenMode={false}
							/>
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
									value={$customThemeDraft.variables[varName]}
									on:input={(e) =>
										handleDraftVarChange(varName, (e.target as HTMLInputElement).value)}
								/>
								<input
									type="text"
									value={$customThemeDraft.variables[varName]}
									on:input={(e) =>
										handleDraftVarChange(varName, (e.target as HTMLInputElement).value)}
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
	.theme-action-buttons {
		display: flex;
		gap: 0.8rem;
		align-items: center;
		flex-wrap: wrap;
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
	.theme-item-actions {
		display: flex;
		gap: 0.3rem;
	}
	.edit-theme-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.2em;
		padding: 0.2rem;
		border-radius: 4px;
		transition: background-color 0.2s;
	}
	.edit-theme-btn:hover {
		background: var(--color-link);
		color: var(--color-primary-alt);
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
	.theme-var-row input[type='color'] {
		width: 40px;
		height: 30px;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		cursor: pointer;
	}
	.theme-var-row input[type='text'] {
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
	.preview-gallery {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.preview-section {
		padding: 1rem;
		background: var(--color-section-bg);
		border: 1px solid var(--color-section-border);
		border-radius: 6px;
	}
	.preview-section h6 {
		margin: 0 0 0.8rem 0;
		color: var(--color-text);
		font-size: 1rem;
		font-weight: 600;
	}
	.preview-navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.8rem 1rem;
		background: var(--color-navbar-bg);
		border-bottom: 1px solid var(--color-navbar-border);
		box-shadow: 0 2px 4px var(--color-navbar-shadow);
		border-radius: 6px;
	}
	.preview-nav-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.preview-logo {
		font-weight: 600;
		color: var(--color-navbar-link);
	}
	.preview-nav-links {
		display: flex;
		gap: 1rem;
	}
	.preview-nav-links span {
		color: var(--color-navbar-link);
		cursor: pointer;
		transition: color 0.15s;
	}
	.preview-nav-links span:hover {
		color: var(--color-navbar-link-hover);
	}
	.preview-nav-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.preview-search {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.preview-search input {
		padding: 0.4rem 0.7rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		background: var(--color-bg-alt);
		color: var(--color-text);
		font-size: 0.9rem;
		width: 120px;
	}
	.preview-search input:focus {
		border-color: var(--color-link);
		outline: none;
	}
	.preview-search button {
		padding: 0.4rem 0.6rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		background: var(--color-secondary);
		color: var(--color-text);
	}
	.preview-search button:hover {
		background: var(--color-banner-hover);
	}
	.preview-user {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.preview-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--color-character-avatar-bg);
		color: var(--color-character-avatar-text, var(--color-text));
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
		border: 1px solid var(--color-character-avatar-border);
	}
	.preview-login-form {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		max-width: 300px;
	}
	.preview-login-form input {
		padding: 0.8rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		background: var(--color-bg-alt);
		color: var(--color-text);
		font-size: 1rem;
	}
	.preview-login-form input:focus {
		border-color: var(--color-link);
		outline: none;
		box-shadow: 0 0 5px var(--color-card-shadow);
	}
	.preview-login-form button {
		padding: 0.8rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		background: var(--color-link);
		color: var(--color-primary-alt);
		font-size: 1rem;
		font-weight: 500;
		transition: background 0.15s;
	}
	.preview-login-form button:hover {
		background: var(--color-link-hover);
	}
	.preview-login-form p {
		text-align: center;
		color: var(--color-text);
		font-size: 0.9rem;
		margin: 0;
	}
	.preview-login-form a {
		color: var(--color-link);
		text-decoration: underline;
	}
	.preview-login-form a:hover {
		color: var(--color-link-hover);
	}
	.preview-microblog {
		padding: 1.2rem;
		background: var(--color-microblog-bg, var(--color-card-bg));
		border: 1px solid var(--color-microblog-border, var(--color-border));
		border-radius: 8px;
		box-shadow: 0 1px 4px var(--color-microblog-shadow, var(--color-card-shadow));
	}
	.preview-microblog-header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.8rem;
	}
	.preview-microblog-pfp {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
	}
	.preview-microblog-writer {
		font-weight: 600;
		font-size: 1.08rem;
		color: var(--color-link);
	}
	.preview-microblog-content {
		font-size: 1.05rem;
		color: var(--color-microblog-text, var(--color-text));
		margin-bottom: 0.8rem;
		line-height: 1.4;
	}
	.preview-microblog-tags {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
		margin-bottom: 0.8rem;
	}
	.preview-microblog-tag {
		background: var(--color-microblog-tag-bg, var(--color-bg-hover));
		color: var(--color-microblog-tag-text, var(--color-accent));
		font-size: 0.93em;
		padding: 0.18em 0.7em;
		border-radius: 999px;
		font-weight: 500;
		letter-spacing: 0.01em;
		border: 1px solid var(--color-microblog-tag-border, var(--color-border));
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.preview-microblog-tag:hover {
		background: var(--color-border);
		color: var(--color-accent);
	}
	.preview-microblog-reactions {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.preview-reaction-btn {
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		padding: 0.18em 0.7em;
		font-size: 1.1em;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.3em;
		transition:
			background 0.15s,
			border 0.15s;
	}
	.preview-reaction-btn:hover {
		background: var(--color-secondary);
		border-color: var(--color-accent);
	}
	.preview-microblog-date {
		font-size: 0.97em;
		color: var(--color-secondary);
	}
	.preview-character-card {
		display: flex;
		align-items: flex-start;
		gap: 1.2rem;
		padding: 1.5rem;
		background: var(--color-character-card-bg, var(--color-card-bg));
		border: 1px solid var(--color-character-card-border, var(--color-border));
		border-radius: 12px;
		box-shadow: 0 2px 12px var(--color-character-card-shadow, var(--color-card-shadow));
	}
	.preview-character-avatar {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		background: var(--color-character-avatar-bg);
		border: 2px solid var(--color-character-avatar-border);
		box-shadow: 0 2px 8px var(--color-character-avatar-shadow);
		overflow: hidden;
	}
	.preview-character-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.preview-character-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		font-size: 1.05rem;
		color: var(--color-character-info-text, var(--color-text));
		background: var(--color-character-info-bg, var(--color-bg-alt));
		border-radius: 10px;
		padding: 1.1rem 1.2rem;
		box-shadow: 0 1px 4px var(--color-character-info-shadow, var(--color-card-shadow));
	}
	.preview-character-info div {
		padding: 0.4rem 0.2rem;
		border-bottom: 1px solid var(--color-character-info-border, var(--color-border));
	}
	.preview-character-info div:last-child {
		border-bottom: none;
	}
	.preview-character-info strong {
		min-width: 110px;
		font-weight: 600;
		color: var(--color-character-info-label, var(--color-link));
		margin-right: 0.7rem;
	}
	.preview-character-info a {
		color: var(--color-link);
		text-decoration: underline;
	}
	.preview-character-info a:hover {
		color: var(--color-link-hover);
	}
	.preview-character-reactions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.preview-story-block {
		padding: 1.5rem;
		background: var(--color-block-bg, var(--color-card-bg));
		border: 1px solid var(--color-border);
		border-radius: 8px;
		box-shadow: 0 1px 4px var(--color-block-shadow, var(--color-card-shadow));
	}
	.preview-block-content {
		margin-bottom: 1rem;
		font-size: 1.08rem;
		color: var(--color-block-text, var(--color-text));
		line-height: 1.6;
	}
	.preview-block-content strong {
		font-weight: 600;
	}
	.preview-block-content em {
		font-style: italic;
	}
	.preview-block-content a {
		color: var(--color-link);
		text-decoration: underline;
	}
	.preview-block-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.preview-block-btn {
		background: var(--color-block-btn-bg, var(--color-secondary));
		color: var(--color-block-btn-text, var(--color-text));
		border: none;
		border-radius: 6px;
		padding: 0.3rem 1rem;
		font-size: 0.97rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	.preview-block-btn:hover {
		background: var(--color-block-btn-hover, var(--color-accent));
	}
	.preview-block-date {
		font-size: 0.85rem;
		color: var(--color-block-date, var(--color-secondary));
	}
	.preview-form-elements {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}
	.preview-form-elements label {
		font-weight: 600;
		color: var(--color-text);
	}
	.preview-form-elements input,
	.preview-form-elements select,
	.preview-form-elements textarea {
		padding: 0.7rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		background: var(--color-bg-alt);
		color: var(--color-text);
		font-size: 1rem;
	}
	.preview-form-elements input:focus,
	.preview-form-elements select:focus,
	.preview-form-elements textarea:focus {
		border-color: var(--color-link);
		outline: none;
		box-shadow: 0 0 5px var(--color-card-shadow);
	}
	.preview-form-elements textarea {
		resize: vertical;
		min-height: 80px;
	}
	.preview-form-buttons {
		display: flex;
		gap: 0.8rem;
		flex-wrap: wrap;
	}
	.preview-btn {
		padding: 0.7rem 1.2rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
		transition: background 0.15s;
	}
	.preview-btn.primary {
		background: var(--color-btn-primary);
		color: var(--color-btn-primary-text);
	}
	.preview-btn.primary:hover {
		background: var(--color-btn-primary-hover);
	}
	.preview-btn.secondary {
		background: var(--color-secondary);
		color: var(--color-text);
	}
	.preview-btn.secondary:hover {
		background: var(--color-accent);
	}
	.preview-btn.danger {
		background: var(--color-danger);
		color: white;
	}
	.preview-btn.danger:hover {
		background: var(--color-danger-hover);
	}
	.preview-tag-system {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}
	.preview-tag-input {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.preview-tag-input input {
		flex: 1;
		padding: 0.4em 0.7em;
		border-radius: 5px;
		border: 1px solid var(--color-microblog-tag-input-border, var(--color-border));
		font-size: 1em;
		background: var(--color-microblog-tag-input-bg, var(--color-bg-alt));
		color: var(--color-text);
	}
	.preview-tag-input input:focus {
		border-color: var(--color-microblog-focus, var(--color-link));
		outline: none;
	}
	.preview-add-tag-btn {
		background: var(--color-microblog-add-tag-bg, var(--color-accent));
		color: var(--color-microblog-add-tag-text, white);
		border: none;
		border-radius: 5px;
		padding: 0.35em 1em;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
	}
	.preview-add-tag-btn:hover {
		background: var(--color-microblog-add-tag-hover-bg, var(--color-primary));
	}
	.preview-tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
	}
	.preview-tag {
		background: var(--color-microblog-tag-bg, var(--color-bg-hover));
		color: var(--color-microblog-tag-text, var(--color-accent));
		font-size: 0.97em;
		padding: 0.18em 0.7em;
		border-radius: 999px;
		font-weight: 500;
		letter-spacing: 0.01em;
		border: 1px solid var(--color-microblog-tag-border, var(--color-border));
		display: flex;
		align-items: center;
		gap: 0.3em;
	}
	.preview-remove-tag {
		background: none;
		border: none;
		color: var(--color-microblog-remove-tag, var(--color-accent));
		font-size: 1.1em;
		cursor: pointer;
		padding: 0;
		line-height: 1;
		transition: color 0.15s;
	}
	.preview-remove-tag:hover {
		color: var(--color-microblog-remove-tag-hover, var(--color-danger));
	}
	.randomize-btn {
		padding: 0.5em 1.5em;
		background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
		color: var(--color-primary-alt);
		border: none;
		border-radius: 6px;
		font-size: 1em;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	.randomize-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
	}
	.export-theme-btn {
		padding: 0.5em 1.5em;
		background: var(--color-success);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1em;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.export-theme-btn:hover {
		background: var(--color-accent);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	.import-theme-btn {
		padding: 0.5em 1.5em;
		background: var(--color-link);
		color: var(--color-primary-alt);
		border: none;
		border-radius: 6px;
		font-size: 1em;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.import-theme-btn:hover {
		background: var(--color-link-hover);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	.preview-remove-tag:hover {
		color: var(--color-microblog-remove-tag-hover, var(--color-danger));
	}
	.preview-zen-editor {
		max-height: 400px;
		overflow: hidden;
	}
	.preview-zen-editor :global(.zen-editor) {
		max-height: 350px;
		overflow: hidden;
	}
	.preview-zen-editor :global(.editor-main) {
		max-height: 300px;
	}
	.preview-zen-editor :global(.preview-column) {
		max-height: 300px;
		overflow-y: auto;
	}

	/* Palette Preview Styles */
	.palette-preview {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
	}
	.palette-colors {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		flex: 1;
	}
	.palette-color-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.8rem;
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		border-radius: 6px;
	}
	.palette-color-item label {
		font-weight: 600;
		color: var(--color-text);
		min-width: 80px;
	}
	.color-picker-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.color-picker-group input[type='color'] {
		width: 50px;
		height: 35px;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		cursor: pointer;
	}
	.color-picker-group input[type='text'] {
		width: 90px;
		padding: 0.4rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		background: var(--color-bg-alt);
		color: var(--color-text);
		font-family: monospace;
		font-size: 0.9em;
	}
	.palette-preview-visual {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 120px;
	}
	.palette-swatch {
		width: 100%;
		height: 40px;
		border-radius: 6px;
		border: 2px solid var(--color-border);
		position: relative;
		transition: transform 0.2s ease;
	}
	.palette-swatch:hover {
		transform: scale(1.05);
	}
	.palette-swatch::after {
		content: attr(class);
		position: absolute;
		bottom: -25px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.8em;
		font-weight: 600;
		color: var(--color-text);
		text-transform: capitalize;
		white-space: nowrap;
	}
	.palette-swatch.primary::after {
		content: 'Primary';
	}
	.palette-swatch.secondary::after {
		content: 'Secondary';
	}
	.palette-swatch.accent::after {
		content: 'Accent';
	}
	.palette-swatch.bg::after {
		content: 'Background';
	}
	.palette-swatch.text::after {
		content: 'Text';
	}
	.palette-swatch.link::after {
		content: 'Link';
	}

	/* Brightness Slider Styles */
	.randomize-container {
		position: relative;
		display: inline-block;
	}

	.brightness-slider-container {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: 10px;
		z-index: 100;
		background: var(--color-card-bg);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		min-width: 200px;
	}

	.brightness-slider {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.brightness-slider label {
		font-size: 0.9em;
		font-weight: 600;
		color: var(--color-text);
		text-align: center;
		margin: 0;
	}

	.brightness-range {
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: linear-gradient(to right, #333, #666, #999, #ccc, #fff);
		outline: none;
		cursor: pointer;
		-webkit-appearance: none;
		appearance: none;
	}

	.brightness-range::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--color-accent);
		cursor: pointer;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.brightness-range::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--color-accent);
		cursor: pointer;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.brightness-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.8em;
		color: var(--color-muted);
	}

	.brightness-labels span {
		font-weight: 500;
	}

	/* Add a subtle arrow pointing down */
	.brightness-slider-container::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 8px solid transparent;
		border-right: 8px solid transparent;
		border-top: 8px solid var(--color-border);
	}

	.brightness-slider-container::before {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-top: 6px solid var(--color-card-bg);
		margin-top: 2px;
	}
</style>
