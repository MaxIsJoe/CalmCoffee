<script lang="ts">
	import { onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';

	let showPopup = $state(false);
	let currentStep = $state<'theme' | 'notice'>('theme');
	let selectedTheme = $state('Morning Coffee');

	const BUILTIN_THEMES = [
		{
			name: 'Morning Coffee',
			description: 'Warm, light theme with coffee-inspired colors',
			preview: {
				bg: '#fffdd0',
				primary: '#4b2e19',
				secondary: '#d4c2b8',
				accent: '#a67c52'
			}
		},
		{
			name: 'Dark Chocolate',
			description: 'Rich dark theme for comfortable reading',
			preview: {
				bg: '#3d2c21',
				primary: '#a67c52',
				secondary: '#b39c8f',
				accent: '#d4c2b8'
			}
		},
		{
			name: 'Blueberry Frost',
			description: 'Cool blue theme with a modern feel',
			preview: {
				bg: '#0a0e17',
				primary: '#4fc3f7',
				secondary: '#81d4fa',
				accent: '#00bcd4'
			}
		},
		{
			name: 'Strawberry Frab',
			description: 'Fruity pink theme inspired by strawberry frappuccino',
			preview: {
				bg: 'hsl(11, 43%, 76%)',
				primary: 'hsl(11, 43%, 36%)',
				secondary: 'hsl(41, 43%, 36%)',
				accent: 'hsl(191, 43%, 36%)'
			}
		}
	];

	function checkFirstTimeVisitor(): boolean {
		return !localStorage.getItem('hasVisitedBefore');
	}

	function markAsVisited(): void {
		localStorage.setItem('hasVisitedBefore', 'true');
	}

	function applyTheme(themeName: string): void {
		selectedTheme = themeName;

		// Only apply theme if it's different from what's currently set
		const currentTheme = localStorage.getItem('theme');
		if (currentTheme !== themeName) {
			if (themeName === 'Morning Coffee') {
				document.documentElement.setAttribute('data-theme', 'light');
				localStorage.setItem('theme', 'Morning Coffee');
			} else if (themeName === 'Dark Chocolate') {
				document.documentElement.setAttribute('data-theme', 'dark');
				localStorage.setItem('theme', 'Dark Chocolate');
			} else if (themeName === 'Blueberry Frost') {
				document.documentElement.setAttribute('data-theme', 'caramel');
				localStorage.setItem('theme', 'Blueberry Frost');
			} else if (themeName === 'Strawberry Frab') {
				document.documentElement.setAttribute('data-theme', 'strawberry-frap');
				localStorage.setItem('theme', 'Strawberry Frab');
			}
		}
	}

	function nextStep(): void {
		if (currentStep === 'theme') {
			currentStep = 'notice';
		} else {
			completeOnboarding();
		}
	}

	function completeOnboarding(): void {
		markAsVisited();
		showPopup = false;
	}

	function skipOnboarding(): void {
		markAsVisited();
		showPopup = false;
	}

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			selectedTheme = savedTheme;
		}

		if (checkFirstTimeVisitor()) {
			showPopup = true;
		}
	});
</script>

{#if showPopup}
	<div class="overlay" transition:fade={{ duration: 200 }}>
		<div class="popup" transition:slide={{ duration: 300 }}>
			{#if currentStep === 'theme'}
				<div class="step theme-step">
					<div class="header">
						<h2>Welcome to Calm Coffee! ☕</h2>
						<p>Let's start by choosing your preferred theme</p>
					</div>

					<div class="theme-grid">
						{#each BUILTIN_THEMES as theme}
							<button
								class="theme-option {selectedTheme === theme.name ? 'selected' : ''}"
								on:click={() => applyTheme(theme.name)}
							>
								<div class="theme-preview" style="background-color: {theme.preview.bg}">
									<div
										class="preview-header"
										style="background-color: {theme.preview.primary}"
									></div>
									<div class="preview-content">
										<div
											class="preview-text"
											style="background-color: {theme.preview.secondary}"
										></div>
										<div
											class="preview-text"
											style="background-color: {theme.preview.secondary}; width: 70%"
										></div>
										<div
											class="preview-accent"
											style="background-color: {theme.preview.accent}"
										></div>
									</div>
								</div>
								<div class="theme-info">
									<h3>{theme.name}</h3>
									<p>{theme.description}</p>
								</div>
							</button>
						{/each}
					</div>

					<div class="actions">
						<button class="btn-secondary" on:click={skipOnboarding}> Skip for now </button>
						<button class="btn-primary" on:click={nextStep}> Continue </button>
					</div>
				</div>
			{:else}
				<div class="step notice-step">
					<div class="header">
						<h2>Important Notice 📝</h2>
						<p>Before you start exploring...</p>
					</div>

					<div class="notice-content">
						<div class="notice-icon">⚠️</div>
						<div class="notice-text">
							<h3>Calm Coffee is in Pre-Alpha</h3>
							<p>We're still in the early stages of development. This means:</p>
							<ul>
								<li>Features may change or be removed</li>
								<li>Your data might be lost during updates</li>
								<li>Some functionality may not work as expected</li>
							</ul>
							<p>
								<strong
									>We're working hard on making this platform the best it can be. Thank you for your
									patience!</strong
								>
							</p>
						</div>
					</div>

					<div class="actions">
						<button class="btn-secondary" on:click={skipOnboarding}>
							I understand, let me explore
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: 1rem;
	}

	.popup {
		background: var(--color-card-bg);
		border-radius: 12px;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		border: 1px solid var(--color-border);
	}

	.step {
		padding: 2rem;
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header h2 {
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
		font-size: 1.8rem;
		font-weight: 600;
	}

	.header p {
		color: var(--color-muted);
		margin: 0;
		font-size: 1.1rem;
	}

	/* Theme Selection Styles */
	.theme-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.theme-option {
		background: var(--color-bg);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.theme-option:hover {
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.theme-option.selected {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.2);
	}

	.theme-preview {
		width: 100%;
		height: 80px;
		border-radius: 6px;
		overflow: hidden;
		margin-bottom: 1rem;
		position: relative;
	}

	.preview-header {
		height: 20px;
		width: 100%;
	}

	.preview-content {
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.preview-text {
		height: 8px;
		border-radius: 2px;
		width: 100%;
	}

	.preview-accent {
		height: 12px;
		border-radius: 2px;
		width: 40%;
	}

	.theme-info h3 {
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		font-weight: 600;
	}

	.theme-info p {
		color: var(--color-muted);
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	/* Notice Styles */
	.notice-content {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 2rem;
		align-items: flex-start;
	}

	.notice-icon {
		font-size: 2.5rem;
		flex-shrink: 0;
		margin-top: 0.5rem;
	}

	.notice-text h3 {
		color: var(--color-text);
		margin: 0 0 1rem 0;
		font-size: 1.3rem;
		font-weight: 600;
	}

	.notice-text p {
		color: var(--color-text);
		margin: 0 0 1rem 0;
		line-height: 1.6;
	}

	.notice-text ul {
		color: var(--color-text);
		margin: 1rem 0;
		padding-left: 1.5rem;
		line-height: 1.6;
	}

	.notice-text li {
		margin-bottom: 0.5rem;
	}

	.notice-text strong {
		color: var(--color-primary);
	}

	/* Action Buttons */
	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		min-width: 120px;
	}

	.btn-primary {
		background: var(--color-primary);
		color: var(--color-primary-alt);
	}

	.btn-primary:hover {
		background: var(--color-primary);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.btn-secondary {
		background: var(--color-bg-alt);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background: var(--color-bg-hover);
		border-color: var(--color-primary);
	}

	/* Responsive Design */
	@media (max-width: 640px) {
		.popup {
			margin: 1rem;
			max-height: calc(100vh - 2rem);
		}

		.step {
			padding: 1.5rem;
		}

		.theme-grid {
			grid-template-columns: 1fr;
		}

		.notice-content {
			flex-direction: column;
			text-align: center;
		}

		.notice-icon {
			align-self: center;
		}

		.actions {
			flex-direction: column;
		}

		.btn-primary,
		.btn-secondary {
			width: 100%;
		}
	}
</style>
