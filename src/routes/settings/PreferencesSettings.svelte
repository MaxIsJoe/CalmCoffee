<script lang="ts">
	import { onMount } from 'svelte';
	import ZenMarkdownEditor from '$lib/comp/markdown/ZenMarkdownEditor.svelte';
	import WordInfoCacheManager from '$lib/comp/common/WordInfoCacheManager.svelte';

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
	let editingTheme: string | null = null; // Track which theme is being edited
	let hasRandomized = false; // Track if randomize has been used
	let showBrightnessSlider = false; // Track if brightness slider should be shown
	let brightnessAdjustment = 0; // Brightness adjustment value (-100 to 100)
	let originalPalette: Record<string, string> = {}; // Store the original generated palette
	let hideSliderTimeout: any = null; // Timeout for hiding the slider

	// Reactive statement to update preview when colors change
	$: if (showPreview && showCreateForm) {
		injectCustomThemeStyle(customThemeDraft.variables);
	}

	// Color palette generation functions
	function generateRandomColor(): string {
		// Generate a random HSL color with good saturation and lightness
		const hue = Math.floor(Math.random() * 360);
		const saturation = Math.floor(Math.random() * 30) + 40; // 40-70% saturation
		const lightness = Math.floor(Math.random() * 30) + 35; // 35-65% lightness
		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	}

	function generateComplementaryColor(baseColor: string): string {
		// Extract HSL values from base color
		const match = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
		if (!match) return generateRandomColor();
		
		const [, h, s, l] = match.map(Number);
		const complementaryHue = (h + 180) % 360;
		return `hsl(${complementaryHue}, ${s}%, ${l}%)`;
	}

	function generateAnalogousColor(baseColor: string, offset: number): string {
		// Extract HSL values from base color
		const match = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
		if (!match) return generateRandomColor();
		
		const [, h, s, l] = match.map(Number);
		const analogousHue = (h + offset) % 360;
		return `hsl(${analogousHue}, ${s}%, ${l}%)`;
	}

	function generateLighterVariant(color: string, amount: number = 20): string {
		const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
		if (!match) return color;
		
		const [, h, s, l] = match.map(Number);
		const newLightness = Math.min(95, l + amount);
		return `hsl(${h}, ${s}%, ${newLightness}%)`;
	}

	function generateDarkerVariant(color: string, amount: number = 20): string {
		const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
		if (!match) return color;
		
		const [, h, s, l] = match.map(Number);
		const newLightness = Math.max(5, l - amount);
		return `hsl(${h}, ${s}%, ${newLightness}%)`;
	}

	function generateMonochromaticVariant(color: string, saturationChange: number = 0, lightnessChange: number = 0): string {
		const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
		if (!match) return color;
		
		const [, h, s, l] = match.map(Number);
		const newSaturation = Math.max(0, Math.min(100, s + saturationChange));
		const newLightness = Math.max(0, Math.min(100, l + lightnessChange));
		return `hsl(${h}, ${newSaturation}%, ${newLightness}%)`;
	}

	function generateColorPalette(): Record<string, string> {
		// Generate a base color scheme
		const primaryColor = generateRandomColor();
		const secondaryColor = generateAnalogousColor(primaryColor, 30);
		const accentColor = generateComplementaryColor(primaryColor);
		
		// Generate background colors (light variants)
		const bgColor = generateLighterVariant(primaryColor, 40);
		const bgAltColor = generateLighterVariant(secondaryColor, 35);
		const cardBgColor = generateLighterVariant(primaryColor, 45);
		
		// Generate text colors (dark variants)
		const textColor = generateDarkerVariant(primaryColor, 60);
		const mutedColor = generateMonochromaticVariant(primaryColor, -20, 10);
		
		// Generate link colors
		const linkColor = accentColor;
		const linkHoverColor = generateDarkerVariant(accentColor, 15);
		
		// Generate border colors
		const borderColor = generateMonochromaticVariant(primaryColor, -30, 20);
		
		// Generate button colors
		const btnPrimaryColor = accentColor;
		const btnPrimaryTextColor = generateLighterVariant(accentColor, 60);
		const btnPrimaryHoverColor = generateDarkerVariant(accentColor, 10);
		
		// Generate danger/success colors
		const dangerColor = `hsl(${(Math.floor(Math.random() * 30) + 340) % 360}, 70%, 50%)`; // Reddish
		const successColor = `hsl(${(Math.floor(Math.random() * 60) + 120) % 180}, 70%, 50%)`; // Greenish
		
		// Generate navbar colors
		const navbarBgColor = generateLighterVariant(primaryColor, 30);
		const navbarLinkColor = generateDarkerVariant(primaryColor, 40);
		const navbarLinkHoverColor = accentColor;
		
		// Generate microblog colors
		const microblogBgColor = generateLighterVariant(secondaryColor, 40);
		const microblogTagBgColor = generateLighterVariant(accentColor, 50);
		const microblogTagTextColor = generateDarkerVariant(accentColor, 30);
		
		// Generate character colors
		const characterCardBgColor = generateLighterVariant(primaryColor, 35);
		const characterAvatarBgColor = generateLighterVariant(secondaryColor, 45);
		const characterTagBgColor = generateLighterVariant(accentColor, 45);
		
		// Generate block editor colors
		const blockBgColor = generateLighterVariant(primaryColor, 40);
		const blockBtnBgColor = generateLighterVariant(accentColor, 40);
		const blockBtnHoverColor = accentColor;
		
		// Generate editor colors
		const editorBgColor = generateLighterVariant(primaryColor, 45);
		const editorBtnBgColor = generateLighterVariant(secondaryColor, 40);
		const editorBtnHoverColor = secondaryColor;
		
		// Generate toolbar colors
		const toolbarBgColor = generateLighterVariant(secondaryColor, 35);
		const toolbarBtnBgColor = generateLighterVariant(primaryColor, 40);
		const toolbarBtnHoverColor = primaryColor;
		
		// Generate blog colors
		const blogHeadingColor = generateDarkerVariant(primaryColor, 30);
		const blogSelectBgColor = generateLighterVariant(primaryColor, 45);
		const blogTabsBtnColor = generateLighterVariant(secondaryColor, 40);
		const blogTabsBtnActiveColor = secondaryColor;

		return {
			'--color-bg': bgColor,
			'--color-bg-alt': bgAltColor,
			'--color-text': textColor,
			'--color-primary': primaryColor,
			'--color-primary-alt': generateLighterVariant(primaryColor, 60),
			'--color-secondary': secondaryColor,
			'--color-accent': accentColor,
			'--color-link': linkColor,
			'--color-link-hover': linkHoverColor,
			'--color-border': borderColor,
			'--color-muted': mutedColor,
			'--color-danger': dangerColor,
			'--color-danger-hover': generateDarkerVariant(dangerColor, 15),
			'--color-success': successColor,
			'--color-btn-primary': btnPrimaryColor,
			'--color-btn-primary-text': btnPrimaryTextColor,
			'--color-btn-primary-hover': btnPrimaryHoverColor,
			
			// Navbar
			'--color-navbar-bg': navbarBgColor,
			'--color-navbar-link': navbarLinkColor,
			'--color-navbar-link-hover': navbarLinkHoverColor,
			'--color-navbar-border': borderColor,
			'--color-navbar-shadow': generateMonochromaticVariant(borderColor, 0, -10),
			
			// Cards & Sections
			'--color-card-bg': cardBgColor,
			'--color-card-shadow': generateMonochromaticVariant(borderColor, 0, -15),
			'--color-section-bg': generateLighterVariant(primaryColor, 42),
			'--color-section-border': borderColor,
			'--color-bg-hover': generateLighterVariant(primaryColor, 25),
			
			// Footer & Banner
			'--color-footer-bg': generateDarkerVariant(primaryColor, 20),
			'--color-footer-alt': generateDarkerVariant(primaryColor, 25),
			'--color-footer-text': generateLighterVariant(primaryColor, 70),
			'--color-footer-link': generateLighterVariant(accentColor, 50),
			'--color-footer-link-hover': accentColor,
			'--color-footer-muted': generateMonochromaticVariant(primaryColor, -40, 30),
			'--color-banner-bg': generateLighterVariant(accentColor, 45),
			'--color-banner-text': generateDarkerVariant(accentColor, 40),
			'--color-banner-hover': generateDarkerVariant(accentColor, 10),
			
			// Microblog
			'--color-microblog-bg': microblogBgColor,
			'--color-microblog-shadow': generateMonochromaticVariant(borderColor, 0, -12),
			'--color-microblog-border': borderColor,
			'--color-microblog-text': textColor,
			'--color-microblog-tag-bg': microblogTagBgColor,
			'--color-microblog-tag-text': microblogTagTextColor,
			'--color-microblog-tag-border': generateMonochromaticVariant(accentColor, -20, 30),
			'--color-microblog-add-tag-bg': accentColor,
			'--color-microblog-add-tag-text': generateLighterVariant(accentColor, 60),
			'--color-microblog-add-tag-hover-bg': generateDarkerVariant(accentColor, 10),
			'--color-microblog-remove-tag': generateDarkerVariant(accentColor, 20),
			'--color-microblog-remove-tag-hover': dangerColor,
			'--color-microblog-textarea-bg': generateLighterVariant(primaryColor, 48),
			'--color-microblog-textarea-border': borderColor,
			'--color-microblog-focus': accentColor,
			'--color-microblog-post-bg': accentColor,
			'--color-microblog-post-text': generateLighterVariant(accentColor, 60),
			'--color-microblog-post-hover-bg': generateDarkerVariant(accentColor, 5),
			'--color-microblog-confirm-bg': successColor,
			'--color-microblog-confirm-text': generateLighterVariant(successColor, 60),
			'--color-microblog-confirm-hover-bg': generateDarkerVariant(successColor, 10),
			'--color-microblog-cancel-bg': generateLighterVariant(dangerColor, 50),
			'--color-microblog-cancel-text': generateDarkerVariant(dangerColor, 30),
			'--color-microblog-cancel-hover-bg': dangerColor,
			'--color-microblog-cancel-hover-text': generateLighterVariant(dangerColor, 60),
			'--color-microblog-select-bg': generateLighterVariant(primaryColor, 45),
			'--color-microblog-select-border': borderColor,
			'--color-microblog-select-text': textColor,
			'--color-microblog-tag-input-bg': generateLighterVariant(primaryColor, 45),
			'--color-microblog-tag-input-border': borderColor,
			'--color-microblog-preview-bg': generateLighterVariant(primaryColor, 50),
			'--color-microblog-preview-border': borderColor,
			'--color-microblog-preview-text': textColor,
			'--color-microblog-label': generateDarkerVariant(primaryColor, 25),
			'--color-microblog-counter': mutedColor,
			'--color-microblog-toggle': accentColor,
			'--color-microblog-toggle-hover': generateDarkerVariant(accentColor, 10),
			'--color-microblog-styles-bg': generateLighterVariant(primaryColor, 45),
			'--color-microblog-styles-border': borderColor,
			'--color-microblog-error': dangerColor,
			'--color-microblog-warning': `hsl(${(Math.floor(Math.random() * 30) + 40) % 70}, 80%, 50%)`, // Orange/Yellow
			'--color-microblog-post-disabled-bg': generateMonochromaticVariant(primaryColor, -50, 20),
			'--color-microblog-post-disabled-text': generateMonochromaticVariant(primaryColor, -60, 40),
			'--color-microblog-add-tag-disabled-bg': generateMonochromaticVariant(accentColor, -50, 30),
			'--color-microblog-add-tag-disabled-text': generateMonochromaticVariant(accentColor, -60, 50),
			'--color-microblog-confirm-disabled-bg': generateMonochromaticVariant(successColor, -50, 30),
			'--color-microblog-confirm-disabled-text': generateMonochromaticVariant(successColor, -60, 50),
			
			// Characters
			'--color-character-card-bg': characterCardBgColor,
			'--color-character-card-shadow': generateMonochromaticVariant(borderColor, 0, -8),
			'--color-character-card-border': borderColor,
			'--color-character-avatar-bg': characterAvatarBgColor,
			'--color-character-avatar-border': borderColor,
			'--color-character-avatar-shadow': generateMonochromaticVariant(borderColor, 0, -10),
			'--color-character-name': generateDarkerVariant(primaryColor, 20),
			'--color-character-type': accentColor,
			'--color-character-gender': generateDarkerVariant(secondaryColor, 25),
			'--color-character-tag-bg': characterTagBgColor,
			'--color-character-tag-text': generateDarkerVariant(accentColor, 25),
			'--color-character-tag-border': generateMonochromaticVariant(accentColor, -25, 25),
			'--color-character-add-tag-bg': accentColor,
			'--color-character-add-tag-text': generateLighterVariant(accentColor, 60),
			'--color-character-add-tag-hover-bg': generateDarkerVariant(accentColor, 10),
			'--color-character-remove-tag': generateDarkerVariant(accentColor, 20),
			'--color-character-remove-tag-hover': dangerColor,
			'--color-character-tag-warning': generateMonochromaticVariant(dangerColor, 0, 20),
			'--color-character-art-hint': mutedColor,
			'--color-character-info-text': generateDarkerVariant(primaryColor, 30),
			'--color-character-info-bg': generateLighterVariant(primaryColor, 50),
			'--color-character-info-label': accentColor,
			'--color-character-info-border': borderColor,
			'--color-character-info-shadow': generateMonochromaticVariant(borderColor, 0, -5),
			'--color-character-relationship-bg': generateLighterVariant(secondaryColor, 45),
			'--color-character-relationship-shadow': generateMonochromaticVariant(borderColor, 0, -8),
			'--color-character-tag-panel-bg': generateLighterVariant(primaryColor, 52),
			'--color-character-tag-panel-shadow': generateMonochromaticVariant(borderColor, 0, -6),
			'--color-character-tag-panel-title': generateDarkerVariant(primaryColor, 35),
			'--color-character-add-tag-disabled-bg': generateMonochromaticVariant(accentColor, -50, 30),
			'--color-character-add-tag-disabled-text': generateMonochromaticVariant(accentColor, -60, 50),
			
			// Block Editor
			'--color-block-bg': blockBgColor,
			'--color-block-shadow': generateMonochromaticVariant(borderColor, 0, -10),
			'--color-block-text': textColor,
			'--color-block-date': mutedColor,
			'--color-block-btn-bg': blockBtnBgColor,
			'--color-block-btn-hover': blockBtnHoverColor,
			'--color-block-btn-text': generateDarkerVariant(accentColor, 30),
			'--color-block-add-btn-bg': accentColor,
			'--color-block-add-btn-hover': generateDarkerVariant(accentColor, 10),
			'--color-block-add-btn-text': generateLighterVariant(accentColor, 60),
			'--color-block-editor-bg': generateLighterVariant(primaryColor, 45),
			'--color-block-editor-shadow': generateMonochromaticVariant(borderColor, 0, -12),
			'--color-block-textarea-bg': generateLighterVariant(primaryColor, 48),
			'--color-block-textarea-border': borderColor,
			'--color-block-textarea-shadow': generateMonochromaticVariant(borderColor, 0, -8),
			'--color-block-toggle-bg': generateLighterVariant(secondaryColor, 40),
			'--color-block-toggle-text': generateDarkerVariant(secondaryColor, 30),
			'--color-block-toggle-hover': secondaryColor,
			'--color-block-toggle-border': borderColor,
			'--color-block-toggle-hover-border': secondaryColor,
			'--color-block-list-bg': generateLighterVariant(primaryColor, 43),
			'--color-block-list-shadow': generateMonochromaticVariant(borderColor, 0, -10),
			'--color-block-list-title': generateDarkerVariant(primaryColor, 25),
			'--color-block-wait': mutedColor,
			'--color-block-loading': accentColor,
			'--color-block-error': dangerColor,
			'--color-block-wait-info-bg': generateLighterVariant(primaryColor, 50),
			'--color-block-wait-info-border': borderColor,
			
			// Editor & Toolbar
			'--color-editor-bg': editorBgColor,
			'--color-editor-border': borderColor,
			'--color-editor-shadow': generateMonochromaticVariant(borderColor, 0, -8),
			'--color-editor-header-bg': generateLighterVariant(primaryColor, 35),
			'--color-editor-header-border': borderColor,
			'--color-editor-btn-bg': editorBtnBgColor,
			'--color-editor-btn-hover': editorBtnHoverColor,
			'--color-editor-btn-text': generateDarkerVariant(secondaryColor, 30),
			'--color-editor-btn-border': borderColor,
			'--color-editor-btn-active': secondaryColor,
			'--color-editor-text': textColor,
			'--color-editor-secondary': mutedColor,
			'--color-toolbar-bg': toolbarBgColor,
			'--color-toolbar-border': borderColor,
			'--color-toolbar-group-bg': generateLighterVariant(secondaryColor, 40),
			'--color-toolbar-btn-bg': toolbarBtnBgColor,
			'--color-toolbar-btn-hover': toolbarBtnHoverColor,
			'--color-toolbar-btn-active': primaryColor,
			'--color-toolbar-btn-border': borderColor,
			'--color-toolbar-btn-text': generateDarkerVariant(primaryColor, 30),
			'--color-toolbar-btn-code-bg': generateLighterVariant(primaryColor, 50),
			
			// Blog
			'--color-blog-heading': blogHeadingColor,
			'--color-blog-label': generateDarkerVariant(primaryColor, 25),
			'--color-blog-select-bg': blogSelectBgColor,
			'--color-blog-select-border': borderColor,
			'--color-blog-select-text': textColor,
			'--color-blog-select-focus-border': accentColor,
			'--color-blog-select-focus-bg': generateLighterVariant(accentColor, 55),
			'--color-blog-spinner-bg': generateLighterVariant(primaryColor, 45),
			'--color-blog-spinner-fg': accentColor,
			'--color-blog-tabs-border': borderColor,
			'--color-blog-tabs-btn': blogTabsBtnColor,
			'--color-blog-tabs-btn-active': blogTabsBtnActiveColor,
			'--color-blog-tabs-btn-active-border': secondaryColor,
			'--color-blog-tabs-btn-hover': generateDarkerVariant(secondaryColor, 5),
			'--color-blog-error': dangerColor
		};
	}

	function adjustPaletteBrightness(palette: Record<string, string>, adjustment: number): Record<string, string> {
		const adjustedPalette: Record<string, string> = {};
		
		for (const [variable, color] of Object.entries(palette)) {
			// Skip non-color variables or already processed colors
			if (!color.startsWith('hsl(') && !color.startsWith('#')) {
				adjustedPalette[variable] = color;
				continue;
			}
			
			// Convert hex to HSL if needed
			let hslColor = color;
			if (color.startsWith('#')) {
				hslColor = hexToHsl(color);
			}
			
			// Parse HSL values
			const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
			if (!match) {
				adjustedPalette[variable] = color;
				continue;
			}
			
			const [, h, s, l] = match.map(Number);
			let newLightness = Math.max(0, Math.min(100, l + adjustment));
			
			// If the color becomes too dark (below 15% lightness), invert it for better visibility
			if (newLightness < 15) {
				// Invert the lightness: 15% becomes 85%, 10% becomes 90%, etc.
				newLightness = Math.min(95, 100 - newLightness);
			}
			
			adjustedPalette[variable] = `hsl(${h}, ${s}%, ${newLightness}%)`;
		}
		
		return adjustedPalette;
	}

	function hexToHsl(hex: string): string {
		// Remove # if present
		hex = hex.replace('#', '');
		
		// Convert hex to RGB
		const r = parseInt(hex.substr(0, 2), 16) / 255;
		const g = parseInt(hex.substr(2, 2), 16) / 255;
		const b = parseInt(hex.substr(4, 2), 16) / 255;
		
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0, s = 0, l = (max + min) / 2;
		
		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		
		return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
	}

	function randomizeTheme() {
		const newPalette = generateColorPalette();
		originalPalette = { ...newPalette }; // Store the original palette
		customThemeDraft.variables = { ...customThemeDraft.variables, ...newPalette };
		hasRandomized = true;
		brightnessAdjustment = 0; // Reset brightness adjustment
		
		// Update preview if it's showing
		if (showPreview) {
			injectCustomThemeStyle(customThemeDraft.variables);
		}
	}

	function adjustBrightness(value: number) {
		// Clamp the brightness adjustment to -45 to +45
		brightnessAdjustment = Math.max(-45, Math.min(45, value));
		
		// Adjust the original palette with the new brightness value
		const adjustedPalette = adjustPaletteBrightness(originalPalette, brightnessAdjustment);
		customThemeDraft.variables = { ...customThemeDraft.variables, ...adjustedPalette };
		
		// Update preview if it's showing
		if (showPreview) {
			injectCustomThemeStyle(customThemeDraft.variables);
		}
	}

	function handleRandomizeMouseEnter() {
		if (hasRandomized) {
			showBrightnessSlider = true;
			// Clear any existing timeout
			if (hideSliderTimeout) {
				clearTimeout(hideSliderTimeout);
				hideSliderTimeout = null;
			}
		}
	}

	function handleRandomizeMouseLeave() {
		// Set a timeout to hide the slider after 2 seconds
		hideSliderTimeout = setTimeout(() => {
			showBrightnessSlider = false;
			hideSliderTimeout = null;
		}, 2000);
	}

	function handleSliderMouseEnter() {
		// Clear the timeout when mouse enters the slider area
		if (hideSliderTimeout) {
			clearTimeout(hideSliderTimeout);
			hideSliderTimeout = null;
		}
	}

	function handleSliderMouseLeave() {
		// Set a timeout to hide the slider after 2 seconds when leaving slider area
		hideSliderTimeout = setTimeout(() => {
			showBrightnessSlider = false;
			hideSliderTimeout = null;
		}, 2000);
	}

	function exportThemeToCSS(theme: Theme): void {
		// Generate CSS content
		let cssContent = `/* Calm Coffee Theme: ${theme.name} */\n`;
		cssContent += `/* Generated on: ${new Date().toLocaleString()} */\n\n`;
		cssContent += `:root {\n`;
		
		// Add all theme variables
		for (const variable of THEME_VARIABLES) {
			const value = theme.variables[variable] || '#ffffff'; // fallback
			cssContent += `  ${variable}: ${value};\n`;
		}
		
		cssContent += `}\n\n`;
		
		// Add some helpful comments
		cssContent += `/* Usage Instructions:\n`;
		cssContent += ` * 1. Save this file as "${theme.name.replace(/[^a-zA-Z0-9]/g, '_')}.css"\n`;
		cssContent += ` * 2. Import it in your HTML: <link rel="stylesheet" href="theme.css">\n`;
		cssContent += ` * 3. Or import it in your CSS: @import "theme.css";\n`;
		cssContent += ` */\n`;
		
		// Create and download the file
		const blob = new Blob([cssContent], { type: 'text/css' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${theme.name.replace(/[^a-zA-Z0-9]/g, '_')}.css`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function exportCurrentThemeToCSS(): void {
		if (showCreateForm && customThemeDraft.name.trim()) {
			exportThemeToCSS(customThemeDraft);
		} else {
			// Export the currently selected theme
			const currentTheme = [...BUILTIN_THEMES, ...customThemes].find(t => t.name === selectedTheme);
			if (currentTheme) {
				exportThemeToCSS(currentTheme);
			}
		}
	}

	function importThemeFromCSS(file: File): void {
		const reader = new FileReader();
		reader.onload = (e) => {
			const cssContent = e.target?.result as string;
			if (!cssContent) return;

			// Parse CSS content to extract theme variables
			const themeVariables: Record<string, string> = {};
			const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/);
			
			if (rootMatch) {
				const rootContent = rootMatch[1];
				// Extract CSS custom properties
				const variableMatches = rootContent.matchAll(/--color-[^:]+:\s*([^;]+);/g);
				
				for (const match of variableMatches) {
					const variableName = match[0].split(':')[0].trim();
					const variableValue = match[1].trim();
					
					// Only include variables that are in our THEME_VARIABLES list
					if (THEME_VARIABLES.includes(variableName)) {
						themeVariables[variableName] = variableValue;
					}
				}
			}

			// Extract theme name from CSS comments or filename
			let themeName = file.name.replace(/\.css$/i, '').replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
			if (!themeName) {
				themeName = 'Imported Theme';
			}

			// Check if theme name already exists
			let finalThemeName = themeName;
			let counter = 1;
			while ([...BUILTIN_THEMES, ...customThemes].some(t => t.name === finalThemeName)) {
				finalThemeName = `${themeName} (${counter})`;
				counter++;
			}

			// Create new theme
			const importedTheme: Theme = {
				name: finalThemeName,
				variables: { ...themeVariables },
				isCustom: true
			};

			// Add to custom themes
			customThemes = [...customThemes, importedTheme];
			saveCustomThemes();

			// Select the imported theme
			selectedTheme = finalThemeName;
			applyTheme(importedTheme);

			// Show success message (you could add a toast notification here)
			alert(`Theme "${finalThemeName}" imported successfully!`);
		};

		reader.onerror = () => {
			alert('Error reading CSS file. Please make sure it\'s a valid CSS file.');
		};

		reader.readAsText(file);
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
		
		// Reset the input so the same file can be selected again
		input.value = '';
	}

	function editTheme(themeName: string): void {
		const themeToEdit = customThemes.find(t => t.name === themeName);
		if (!themeToEdit) return;

		// Load the theme into the draft
		customThemeDraft = {
			name: themeToEdit.name,
			variables: { ...themeToEdit.variables },
			isCustom: true
		};

		// Set editing mode
		editingTheme = themeName;
		showCreateForm = true;

		// Apply the theme to preview if it's showing
		if (showPreview) {
			injectCustomThemeStyle(customThemeDraft.variables);
		}
	}

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
		
		if (editingTheme) {
			// Update existing theme
			const themeIndex = customThemes.findIndex(t => t.name === editingTheme);
			if (themeIndex !== -1) {
				customThemes[themeIndex] = { ...customThemeDraft };
				saveCustomThemes();
				selectedTheme = customThemeDraft.name;
				applyTheme(customThemeDraft);
			}
		} else {
			// Create new theme
		customThemes = [...customThemes, { ...customThemeDraft }];
		saveCustomThemes();
		selectedTheme = customThemeDraft.name;
		applyTheme(customThemeDraft);
		}
		
		// Reset form
		showCreateForm = false;
		editingTheme = null;
		customThemeDraft = {
			name: '',
			variables: Object.fromEntries(THEME_VARIABLES.map(v => [v, '#ffffff'])),
			isCustom: true
		};
	}

	function toggleCreateForm() {
		showCreateForm = !showCreateForm;
		if (showCreateForm) {
			// Generate a random theme when opening the create form (only if not editing)
			if (!editingTheme) {
				const randomPalette = generateColorPalette();
				customThemeDraft.variables = { ...customThemeDraft.variables, ...randomPalette };
			}
			
			// Apply the theme to preview if it's showing
			if (showPreview) {
				injectCustomThemeStyle(customThemeDraft.variables);
			}
		} else {
			// Reset editing mode when canceling
			editingTheme = null;
			customThemeDraft = {
				name: '',
				variables: Object.fromEntries(THEME_VARIABLES.map(v => [v, '#ffffff'])),
				isCustom: true
			};
		}
	}

	function handleDraftVarChange(varName: string, value: string) {
		customThemeDraft.variables[varName] = value;
		// Update preview immediately if it's showing
		if (showPreview) {
			injectCustomThemeStyle(customThemeDraft.variables);
		}
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

	function updatePaletteColor(colorName: string, value: string) {
		// Map color names to their CSS variable names
		const colorMap: Record<string, string> = {
			'primary': '--color-primary',
			'secondary': '--color-secondary',
			'accent': '--color-accent',
			'bg': '--color-bg',
			'text': '--color-text',
			'link': '--color-link'
		};

		const variableName = colorMap[colorName];
		if (!variableName) return;

		// Update the main color
		customThemeDraft.variables[variableName] = value;

		// Propagate changes to related colors based on the color type
		if (colorName === 'primary') {
			// Update primary-related colors
			customThemeDraft.variables['--color-primary-alt'] = generateLighterVariant(value, 60);
			customThemeDraft.variables['--color-btn-primary'] = value;
			customThemeDraft.variables['--color-btn-primary-hover'] = generateDarkerVariant(value, 10);
			customThemeDraft.variables['--color-navbar-bg'] = generateLighterVariant(value, 30);
			customThemeDraft.variables['--color-navbar-link'] = generateDarkerVariant(value, 40);
			customThemeDraft.variables['--color-section-bg'] = generateLighterVariant(value, 42);
			customThemeDraft.variables['--color-bg-hover'] = generateLighterVariant(value, 25);
			customThemeDraft.variables['--color-footer-bg'] = generateDarkerVariant(value, 20);
			customThemeDraft.variables['--color-footer-alt'] = generateDarkerVariant(value, 25);
			customThemeDraft.variables['--color-footer-text'] = generateLighterVariant(value, 70);
			customThemeDraft.variables['--color-character-card-bg'] = generateLighterVariant(value, 35);
			customThemeDraft.variables['--color-character-name'] = generateDarkerVariant(value, 20);
			customThemeDraft.variables['--color-character-info-text'] = generateDarkerVariant(value, 30);
			customThemeDraft.variables['--color-character-tag-panel-title'] = generateDarkerVariant(value, 35);
			customThemeDraft.variables['--color-block-bg'] = generateLighterVariant(value, 40);
			customThemeDraft.variables['--color-block-editor-bg'] = generateLighterVariant(value, 45);
			customThemeDraft.variables['--color-block-textarea-bg'] = generateLighterVariant(value, 48);
			customThemeDraft.variables['--color-editor-bg'] = generateLighterVariant(value, 45);
			customThemeDraft.variables['--color-editor-header-bg'] = generateLighterVariant(value, 35);
			customThemeDraft.variables['--color-toolbar-btn-bg'] = generateLighterVariant(value, 40);
			customThemeDraft.variables['--color-toolbar-btn-active'] = value;
			customThemeDraft.variables['--color-toolbar-btn-text'] = generateDarkerVariant(value, 30);
			customThemeDraft.variables['--color-blog-heading'] = generateDarkerVariant(value, 30);
			customThemeDraft.variables['--color-blog-label'] = generateDarkerVariant(value, 25);
			customThemeDraft.variables['--color-blog-select-bg'] = generateLighterVariant(value, 45);
			customThemeDraft.variables['--color-blog-spinner-bg'] = generateLighterVariant(value, 45);
		} else if (colorName === 'secondary') {
			// Update secondary-related colors
			customThemeDraft.variables['--color-bg-alt'] = generateLighterVariant(value, 35);
			customThemeDraft.variables['--color-character-gender'] = generateDarkerVariant(value, 25);
			customThemeDraft.variables['--color-character-avatar-bg'] = generateLighterVariant(value, 45);
			customThemeDraft.variables['--color-block-toggle-bg'] = generateLighterVariant(value, 40);
			customThemeDraft.variables['--color-block-toggle-text'] = generateDarkerVariant(value, 30);
			customThemeDraft.variables['--color-block-toggle-hover'] = value;
			customThemeDraft.variables['--color-block-toggle-hover-border'] = value;
			customThemeDraft.variables['--color-editor-btn-bg'] = generateLighterVariant(value, 40);
			customThemeDraft.variables['--color-editor-btn-hover'] = value;
			customThemeDraft.variables['--color-editor-btn-active'] = value;
			customThemeDraft.variables['--color-editor-btn-text'] = generateDarkerVariant(value, 30);
			customThemeDraft.variables['--color-toolbar-bg'] = generateLighterVariant(value, 35);
			customThemeDraft.variables['--color-toolbar-group-bg'] = generateLighterVariant(value, 40);
			customThemeDraft.variables['--color-blog-tabs-btn'] = generateLighterVariant(value, 40);
			customThemeDraft.variables['--color-blog-tabs-btn-active'] = value;
			customThemeDraft.variables['--color-blog-tabs-btn-active-border'] = value;
			customThemeDraft.variables['--color-blog-tabs-btn-hover'] = generateDarkerVariant(value, 5);
		} else if (colorName === 'accent') {
			// Update accent-related colors
			customThemeDraft.variables['--color-link-hover'] = generateDarkerVariant(value, 15);
			customThemeDraft.variables['--color-navbar-link-hover'] = value;
			customThemeDraft.variables['--color-footer-link'] = generateLighterVariant(value, 50);
			customThemeDraft.variables['--color-footer-link-hover'] = value;
			customThemeDraft.variables['--color-banner-bg'] = generateLighterVariant(value, 45);
			customThemeDraft.variables['--color-banner-text'] = generateDarkerVariant(value, 40);
			customThemeDraft.variables['--color-banner-hover'] = generateDarkerVariant(value, 10);
			customThemeDraft.variables['--color-microblog-tag-bg'] = generateLighterVariant(value, 50);
			customThemeDraft.variables['--color-microblog-tag-text'] = generateDarkerVariant(value, 30);
			customThemeDraft.variables['--color-microblog-add-tag-bg'] = value;
			customThemeDraft.variables['--color-microblog-add-tag-text'] = generateLighterVariant(value, 60);
			customThemeDraft.variables['--color-microblog-add-tag-hover-bg'] = generateDarkerVariant(value, 10);
			customThemeDraft.variables['--color-microblog-toggle'] = value;
			customThemeDraft.variables['--color-microblog-toggle-hover'] = generateDarkerVariant(value, 10);
			customThemeDraft.variables['--color-microblog-focus'] = value;
			customThemeDraft.variables['--color-microblog-post-bg'] = value;
			customThemeDraft.variables['--color-microblog-post-text'] = generateLighterVariant(value, 60);
			customThemeDraft.variables['--color-microblog-post-hover-bg'] = generateDarkerVariant(value, 5);
			customThemeDraft.variables['--color-character-type'] = value;
			customThemeDraft.variables['--color-character-tag-bg'] = generateLighterVariant(value, 45);
			customThemeDraft.variables['--color-character-tag-text'] = generateDarkerVariant(value, 25);
			customThemeDraft.variables['--color-character-add-tag-bg'] = value;
			customThemeDraft.variables['--color-character-add-tag-text'] = generateLighterVariant(value, 60);
			customThemeDraft.variables['--color-character-add-tag-hover-bg'] = generateDarkerVariant(value, 10);
			customThemeDraft.variables['--color-character-info-label'] = value;
			customThemeDraft.variables['--color-block-btn-bg'] = generateLighterVariant(value, 40);
			customThemeDraft.variables['--color-block-btn-hover'] = value;
			customThemeDraft.variables['--color-block-btn-text'] = generateDarkerVariant(value, 30);
			customThemeDraft.variables['--color-block-add-btn-bg'] = value;
			customThemeDraft.variables['--color-block-add-btn-text'] = generateLighterVariant(value, 60);
			customThemeDraft.variables['--color-block-add-btn-hover'] = generateDarkerVariant(value, 10);
			customThemeDraft.variables['--color-block-loading'] = value;
			customThemeDraft.variables['--color-blog-select-focus-border'] = value;
			customThemeDraft.variables['--color-blog-select-focus-bg'] = generateLighterVariant(value, 55);
			customThemeDraft.variables['--color-blog-spinner-fg'] = value;
		} else if (colorName === 'bg') {
			// Update background-related colors
			customThemeDraft.variables['--color-card-bg'] = generateLighterVariant(value, 45);
			customThemeDraft.variables['--color-microblog-textarea-bg'] = generateLighterVariant(value, 48);
			customThemeDraft.variables['--color-microblog-tag-input-bg'] = generateLighterVariant(value, 45);
			customThemeDraft.variables['--color-microblog-preview-bg'] = generateLighterVariant(value, 50);
			customThemeDraft.variables['--color-character-info-bg'] = generateLighterVariant(value, 50);
			customThemeDraft.variables['--color-character-tag-panel-bg'] = generateLighterVariant(value, 52);
			customThemeDraft.variables['--color-block-wait-info-bg'] = generateLighterVariant(value, 50);
			customThemeDraft.variables['--color-toolbar-btn-code-bg'] = generateLighterVariant(value, 50);
		} else if (colorName === 'text') {
			// Update text-related colors
			customThemeDraft.variables['--color-microblog-text'] = value;
			customThemeDraft.variables['--color-block-text'] = value;
			customThemeDraft.variables['--color-editor-text'] = value;
			customThemeDraft.variables['--color-microblog-preview-text'] = value;
			customThemeDraft.variables['--color-blog-select-text'] = value;
		} else if (colorName === 'link') {
			// Update link-related colors
			customThemeDraft.variables['--color-navbar-link'] = value;
			customThemeDraft.variables['--color-footer-link'] = generateLighterVariant(value, 50);
			customThemeDraft.variables['--color-footer-link-hover'] = value;
			customThemeDraft.variables['--color-character-info-label'] = value;
		}

		// Update preview immediately if it's showing
		if (showPreview) {
			injectCustomThemeStyle(customThemeDraft.variables);
		}
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
			<div class="theme-action-buttons">
				<button on:click={toggleCreateForm} class="create-theme-btn">
					{showCreateForm ? 'Cancel' : 'Create New Theme'}
				</button>
				<button on:click={exportCurrentThemeToCSS} class="export-theme-btn">
					📁 Export Theme
				</button>
				<button on:click={() => document.getElementById('import-theme-input')?.click()} class="import-theme-btn">
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
			{#if customThemes.length > 0}
				<div class="custom-themes-list">
					<h4>Custom Themes</h4>
					{#each customThemes as theme}
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
			<div class="randomize-container">
				{#if showBrightnessSlider}
					<div class="brightness-slider-container" on:mouseenter={handleSliderMouseEnter} on:mouseleave={handleSliderMouseLeave}>
						<div class="brightness-slider">
							<label for="brightness-slider">Brightness: {brightnessAdjustment > 0 ? '+' : ''}{brightnessAdjustment}%</label>
							<input 
								id="brightness-slider"
								type="range" 
								min="-45" 
								max="45" 
								value={brightnessAdjustment}
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
				<button on:click={randomizeTheme} class="randomize-btn" on:mouseenter={handleRandomizeMouseEnter} on:mouseleave={handleRandomizeMouseLeave}>
					🎨 Randomize Colors
				</button>
			</div>
			<button on:click={exportCurrentThemeToCSS} class="export-theme-btn">
				📁 Export CSS
			</button>
			<button on:click={handleCreateTheme} class="save-theme-btn">
				{editingTheme ? 'Update Theme' : 'Save Theme'}
			</button>
		</div>

		{#if showPreview}
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
										bind:value={customThemeDraft.variables['--color-primary']} 
										on:input={(e) => updatePaletteColor('primary', (e.target as HTMLInputElement).value)} 
									/>
									<input 
										type="text" 
										bind:value={customThemeDraft.variables['--color-primary']} 
										on:input={(e) => updatePaletteColor('primary', (e.target as HTMLInputElement).value)} 
										size="8" 
									/>
								</div>
							</div>
							<div class="palette-color-item">
								<label>Secondary</label>
								<div class="color-picker-group">
									<input 
										type="color" 
										bind:value={customThemeDraft.variables['--color-secondary']} 
										on:input={(e) => updatePaletteColor('secondary', (e.target as HTMLInputElement).value)} 
									/>
									<input 
										type="text" 
										bind:value={customThemeDraft.variables['--color-secondary']} 
										on:input={(e) => updatePaletteColor('secondary', (e.target as HTMLInputElement).value)} 
										size="8" 
									/>
								</div>
							</div>
							<div class="palette-color-item">
								<label>Accent</label>
								<div class="color-picker-group">
									<input 
										type="color" 
										bind:value={customThemeDraft.variables['--color-accent']} 
										on:input={(e) => updatePaletteColor('accent', (e.target as HTMLInputElement).value)} 
									/>
									<input 
										type="text" 
										bind:value={customThemeDraft.variables['--color-accent']} 
										on:input={(e) => updatePaletteColor('accent', (e.target as HTMLInputElement).value)} 
										size="8" 
									/>
								</div>
							</div>
							<div class="palette-color-item">
								<label>Background</label>
								<div class="color-picker-group">
									<input 
										type="color" 
										bind:value={customThemeDraft.variables['--color-bg']} 
										on:input={(e) => updatePaletteColor('bg', (e.target as HTMLInputElement).value)} 
									/>
									<input 
										type="text" 
										bind:value={customThemeDraft.variables['--color-bg']} 
										on:input={(e) => updatePaletteColor('bg', (e.target as HTMLInputElement).value)} 
										size="8" 
									/>
								</div>
							</div>
							<div class="palette-color-item">
								<label>Text</label>
								<div class="color-picker-group">
									<input 
										type="color" 
										bind:value={customThemeDraft.variables['--color-text']} 
										on:input={(e) => updatePaletteColor('text', (e.target as HTMLInputElement).value)} 
									/>
									<input 
										type="text" 
										bind:value={customThemeDraft.variables['--color-text']} 
										on:input={(e) => updatePaletteColor('text', (e.target as HTMLInputElement).value)} 
										size="8" 
									/>
								</div>
							</div>
							<div class="palette-color-item">
								<label>Link</label>
								<div class="color-picker-group">
									<input 
										type="color" 
										bind:value={customThemeDraft.variables['--color-link']} 
										on:input={(e) => updatePaletteColor('link', (e.target as HTMLInputElement).value)} 
									/>
									<input 
										type="text" 
										bind:value={customThemeDraft.variables['--color-link']} 
										on:input={(e) => updatePaletteColor('link', (e.target as HTMLInputElement).value)} 
										size="8" 
									/>
								</div>
							</div>
						</div>
						<div class="palette-preview-visual">
							<div class="palette-swatch primary" style="background-color: {customThemeDraft.variables['--color-primary']}"></div>
							<div class="palette-swatch secondary" style="background-color: {customThemeDraft.variables['--color-secondary']}"></div>
							<div class="palette-swatch accent" style="background-color: {customThemeDraft.variables['--color-accent']}"></div>
							<div class="palette-swatch bg" style="background-color: {customThemeDraft.variables['--color-bg']}"></div>
							<div class="palette-swatch text" style="background-color: {customThemeDraft.variables['--color-text']}"></div>
							<div class="palette-swatch link" style="background-color: {customThemeDraft.variables['--color-link']}"></div>
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
								<img class="preview-microblog-pfp" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNlNWU3ZWIiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwODYgOCA4QzggMTAuMjA5MSA5Ljc5MDg2IDEyIDEyIDEyWiIgZmlsbD0iI2E2N2M1MiIvPgo8cGF0aCBkPSJNMTIgMTRDMTUuMzEzNyAxNCAxOCAxNi42ODYzIDE4IDIwSDFDMSAxNi42ODYzIDMuNjg2MyAxNCA3IDE0SDEyWiIgZmlsbD0iI2E2N2M1MiIvPgo8L3N2Zz4KPC9zdmc+" alt="pfp" />
								<span class="preview-microblog-writer">Username</span>
							</div>
							<div class="preview-microblog-content">
								This is a sample microblog post showing how content will look with your custom theme colors.
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
								<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjZTRiODg5Ii8+Cjxzdmcgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHg9IjIwIiB5PSIyMCI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwODYgOCA4QzggMTAuMjA5MSA5Ljc5MDg2IDEyIDEyIDEyWiIgZmlsbD0iI2E2N2M1MiIvPgo8cGF0aCBkPSJNMTIgMTRDMTUuMzEzNyAxNCAxOCAxNi42ODYzIDE4IDIwSDFDMSAxNi42ODYzIDMuNjg2MyAxNCA3IDE0SDEyWiIgZmlsbD0iI2E2N2M1MiIvPgo8L3N2Zz4KPC9zdmc+" alt="Avatar" />
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
								This is a sample story block showing how your content will appear with the custom theme. It includes <strong>bold text</strong>, <em>italic text</em>, and <a href="#">links</a>.
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
								<span class="preview-tag">sample <button class="preview-remove-tag">×</button></span>
								<span class="preview-tag">theme <button class="preview-remove-tag">×</button></span>
								<span class="preview-tag">preview <button class="preview-remove-tag">×</button></span>
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
	transition: background 0.15s, color 0.15s;
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
	transition: background 0.15s, border 0.15s;
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
.color-picker-group input[type="color"] {
	width: 50px;
	height: 35px;
	border: 1px solid var(--color-border);
	border-radius: 4px;
	cursor: pointer;
}
.color-picker-group input[type="text"] {
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
