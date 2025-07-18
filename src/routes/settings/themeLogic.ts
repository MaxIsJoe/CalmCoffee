import { writable, get } from 'svelte/store';

export const THEME_VARIABLES = [
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

export const VARIABLE_CATEGORIES = {
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

export type Theme = {
    name: string;
    variables: Record<string, string>;
    isCustom?: boolean;
};

export const BUILTIN_THEMES: Theme[] = [
    {
        name: 'Morning Coffee',
        variables: {}, // Uses :root
    },
    {
        name: 'Dark Chocolate',
        variables: {}, // Uses [data-theme="dark"]
    },
    {
        name: 'Blueberry Frost',
        variables: {}, // Uses [data-theme="caramel"]
    },
    {
        name: 'Strawberry Frap',
        variables: {}, // Uses [data-theme="strawberry-frap"]
    },
];

export const customThemes = writable<Theme[]>([]);
export const selectedTheme = writable<string>('Morning Coffee');
export const customThemeDraft = writable<Theme>({
    name: '',
    variables: Object.fromEntries(THEME_VARIABLES.map((v) => [v, '#ffffff'])),
    isCustom: true
});
export const showCreateForm = writable(false);
export const showPreview = writable(false);
export const showDeleteConfirm = writable(false);
export const themeToDelete = writable<string | null>(null);
export const editingTheme = writable<string | null>(null);
export const hasRandomized = writable(false);
export const showBrightnessSlider = writable(false);
export const brightnessAdjustment = writable(0);
export const originalPalette = writable<Record<string, string>>({});
export const hideSliderTimeout = writable<ReturnType<typeof setTimeout> | null>(null);

export function generateRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30) + 40;
    const lightness = Math.floor(Math.random() * 30) + 35;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function generateComplementaryColor(baseColor: string): string {
    const match = baseColor.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
    if (!match) return generateRandomColor();
    const [, h, s, l] = match.map(Number);
    const complementaryHue = (h + 180) % 360;
    return `hsl(${complementaryHue}, ${s}%, ${l}%)`;
}

export function generateAnalogousColor(baseColor: string, offset: number): string {
    const match = baseColor.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
    if (!match) return generateRandomColor();
    const [, h, s, l] = match.map(Number);
    const analogousHue = (h + offset) % 360;
    return `hsl(${analogousHue}, ${s}%, ${l}%)`;
}

export function generateLighterVariant(color: string, amount: number = 20): string {
    const match = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
    if (!match) return color;
    const [, h, s, l] = match.map(Number);
    const newLightness = Math.min(95, l + amount);
    return `hsl(${h}, ${s}%, ${newLightness}%)`;
}

export function generateDarkerVariant(color: string, amount: number = 20): string {
    const match = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
    if (!match) return color;
    const [, h, s, l] = match.map(Number);
    const newLightness = Math.max(5, l - amount);
    return `hsl(${h}, ${s}%, ${newLightness}%)`;
}

export function generateMonochromaticVariant(color: string, saturationChange: number = 0, lightnessChange: number = 0): string {
    const match = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
    if (!match) return color;
    const [, h, s, l] = match.map(Number);
    const newSaturation = Math.max(0, Math.min(100, s + saturationChange));
    const newLightness = Math.max(0, Math.min(100, l + lightnessChange));
    return `hsl(${h}, ${newSaturation}%, ${newLightness}%)`;
}

export function generateColorPalette(): Record<string, string> {
    const primaryColor = generateRandomColor();
    const secondaryColor = generateAnalogousColor(primaryColor, 30);
    const accentColor = generateComplementaryColor(primaryColor);
    const bgColor = generateLighterVariant(primaryColor, 40);
    const bgAltColor = generateLighterVariant(secondaryColor, 35);
    const cardBgColor = generateLighterVariant(primaryColor, 45);
    const textColor = generateDarkerVariant(primaryColor, 60);
    const mutedColor = generateMonochromaticVariant(primaryColor, -20, 10);
    const linkColor = accentColor;
    const linkHoverColor = generateDarkerVariant(accentColor, 15);
    const borderColor = generateMonochromaticVariant(primaryColor, -30, 20);
    const btnPrimaryColor = accentColor;
    const btnPrimaryTextColor = generateLighterVariant(accentColor, 60);
    const btnPrimaryHoverColor = generateDarkerVariant(accentColor, 10);
    const dangerColor = `hsl(${(Math.floor(Math.random() * 30) + 340) % 360}, 70%, 50%)`;
    const successColor = `hsl(${(Math.floor(Math.random() * 60) + 120) % 180}, 70%, 50%)`;
    const navbarBgColor = generateLighterVariant(primaryColor, 30);
    const navbarLinkColor = generateDarkerVariant(primaryColor, 40);
    const navbarLinkHoverColor = accentColor;
    const microblogBgColor = generateLighterVariant(secondaryColor, 40);
    const microblogTagBgColor = generateLighterVariant(accentColor, 50);
    const microblogTagTextColor = generateDarkerVariant(accentColor, 30);
    const characterCardBgColor = generateLighterVariant(primaryColor, 35);
    const characterAvatarBgColor = generateLighterVariant(secondaryColor, 45);
    const characterTagBgColor = generateLighterVariant(accentColor, 45);
    const blockBgColor = generateLighterVariant(primaryColor, 40);
    const blockBtnBgColor = generateLighterVariant(accentColor, 40);
    const blockBtnHoverColor = accentColor;
    const editorBgColor = generateLighterVariant(primaryColor, 45);
    const editorBtnBgColor = generateLighterVariant(secondaryColor, 40);
    const editorBtnHoverColor = secondaryColor;
    const toolbarBgColor = generateLighterVariant(secondaryColor, 35);
    const toolbarBtnBgColor = generateLighterVariant(primaryColor, 40);
    const toolbarBtnHoverColor = primaryColor;
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
        '--color-navbar-bg': navbarBgColor,
        '--color-navbar-link': navbarLinkColor,
        '--color-navbar-link-hover': navbarLinkHoverColor,
        '--color-navbar-border': borderColor,
        '--color-navbar-shadow': generateMonochromaticVariant(borderColor, 0, -10),
        '--color-card-bg': cardBgColor,
        '--color-card-shadow': generateMonochromaticVariant(borderColor, 0, -15),
        '--color-section-bg': generateLighterVariant(primaryColor, 42),
        '--color-section-border': borderColor,
        '--color-bg-hover': generateLighterVariant(primaryColor, 25),
        '--color-footer-bg': generateDarkerVariant(primaryColor, 20),
        '--color-footer-alt': generateDarkerVariant(primaryColor, 25),
        '--color-footer-text': generateLighterVariant(primaryColor, 70),
        '--color-footer-link': generateLighterVariant(accentColor, 50),
        '--color-footer-link-hover': accentColor,
        '--color-footer-muted': generateMonochromaticVariant(primaryColor, -40, 30),
        '--color-banner-bg': generateLighterVariant(accentColor, 45),
        '--color-banner-text': generateDarkerVariant(accentColor, 40),
        '--color-banner-hover': generateDarkerVariant(accentColor, 10),
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
        '--color-microblog-warning': `hsl(${(Math.floor(Math.random() * 30) + 40) % 70}, 80%, 50%)`,
        '--color-microblog-post-disabled-bg': generateMonochromaticVariant(primaryColor, -50, 20),
        '--color-microblog-post-disabled-text': generateMonochromaticVariant(primaryColor, -60, 40),
        '--color-microblog-add-tag-disabled-bg': generateMonochromaticVariant(accentColor, -50, 30),
        '--color-microblog-add-tag-disabled-text': generateMonochromaticVariant(accentColor, -60, 50),
        '--color-microblog-confirm-disabled-bg': generateMonochromaticVariant(successColor, -50, 30),
        '--color-microblog-confirm-disabled-text': generateMonochromaticVariant(successColor, -60, 50),
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

export function adjustPaletteBrightness(palette: Record<string, string>, adjustment: number): Record<string, string> {
    const adjustedPalette: Record<string, string> = {};
    for (const [variable, color] of Object.entries(palette)) {
        if (!color.startsWith('hsl(') && !color.startsWith('#')) {
            adjustedPalette[variable] = color;
            continue;
        }
        let hslColor = color;
        if (color.startsWith('#')) {
            hslColor = hexToHsl(color);
        }
        const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (!match) {
            adjustedPalette[variable] = color;
            continue;
        }
        const [, h, s, l] = match.map(Number);
        let newLightness = Math.max(0, Math.min(100, l + adjustment));
        if (newLightness < 15) {
            newLightness = Math.min(95, 100 - newLightness);
        }
        adjustedPalette[variable] = `hsl(${h}, ${s}%, ${newLightness}%)`;
    }
    return adjustedPalette;
}

export function hexToHsl(hex: string): string {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
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

export function exportThemeToCSS(theme: Theme): void {
    let cssContent = `/* Calm Coffee Theme: ${theme.name} */\n`;
    cssContent += `/* Generated on: ${new Date().toLocaleString()} */\n\n`;
    cssContent += `:root {\n`;
    for (const variable of THEME_VARIABLES) {
        const value = theme.variables[variable] || '#ffffff';
        cssContent += `  ${variable}: ${value};\n`;
    }
    cssContent += `}\n\n`;
    cssContent += `/* Usage Instructions:\n`;
    cssContent += ` * 1. Save this file as '${theme.name.replace(/[^a-zA-Z0-9]/g, '_')}.css'\n`;
    cssContent += ` * 2. Import it in your HTML: <link rel='stylesheet' href='theme.css'>\n`;
    cssContent += ` * 3. Or import it in your CSS: @import 'theme.css';\n`;
    cssContent += ` */\n`;
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

export function exportCurrentThemeToCSS(): void {
    const draft = get(customThemeDraft);
    if (get(showCreateForm) && draft.name.trim()) {
        exportThemeToCSS(draft);
    } else {
        const currentTheme = [...BUILTIN_THEMES, ...get(customThemes)].find((t) => t.name === get(selectedTheme));
        if (currentTheme) {
            exportThemeToCSS(currentTheme);
        }
    }
}

export function importThemeFromCSS(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
        const cssContent = e.target?.result as string;
        if (!cssContent) return;
        const themeVariables: Record<string, string> = {};
        const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/);
        if (rootMatch) {
            const rootContent = rootMatch[1];
            const variableMatches = rootContent.matchAll(/--color-[^:]+:\s*([^;]+);/g);
            for (const match of variableMatches) {
                const variableName = match[0].split(':')[0].trim();
                const variableValue = match[1].trim();
                if (THEME_VARIABLES.includes(variableName)) {
                    themeVariables[variableName] = variableValue;
                }
            }
        }
        let themeName = file.name.replace(/\.css$/i, '').replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
        if (!themeName) {
            themeName = 'Imported Theme';
        }
        let finalThemeName = themeName;
        let counter = 1;
        while ([...BUILTIN_THEMES, ...get(customThemes)].some((t) => t.name === finalThemeName)) {
            finalThemeName = `${themeName} (${counter})`;
            counter++;
        }
        const importedTheme: Theme = {
            name: finalThemeName,
            variables: { ...themeVariables },
            isCustom: true
        };
        customThemes.set([...get(customThemes), importedTheme]);
        saveCustomThemes();
        selectedTheme.set(finalThemeName);
        // applyTheme(importedTheme);
        alert(`Theme "${finalThemeName}" imported successfully!`);
    };
    reader.onerror = () => {
        alert('Error reading CSS file. Please make sure it\'s a valid CSS file.');
    };
    reader.readAsText(file);
}

export function updatePaletteColor(colorName: string, value: string) {
    const colorMap: Record<string, string> = {
        primary: '--color-primary',
        secondary: '--color-secondary',
        accent: '--color-accent',
        bg: '--color-bg',
        text: '--color-text',
        link: '--color-link'
    };
    const variableName = colorMap[colorName];
    if (!variableName) return;
    customThemeDraft.update((draft) => {
        draft.variables[variableName] = value;
        if (colorName === 'primary') {
            draft.variables['--color-primary-alt'] = generateLighterVariant(value, 60);
            draft.variables['--color-btn-primary'] = value;
            draft.variables['--color-btn-primary-hover'] = generateDarkerVariant(value, 10);
            draft.variables['--color-navbar-bg'] = generateLighterVariant(value, 30);
            draft.variables['--color-navbar-link'] = generateDarkerVariant(value, 40);
            draft.variables['--color-section-bg'] = generateLighterVariant(value, 42);
            draft.variables['--color-bg-hover'] = generateLighterVariant(value, 25);
            draft.variables['--color-footer-bg'] = generateDarkerVariant(value, 20);
            draft.variables['--color-footer-alt'] = generateDarkerVariant(value, 25);
            draft.variables['--color-footer-text'] = generateLighterVariant(value, 70);
            draft.variables['--color-character-card-bg'] = generateLighterVariant(value, 35);
            draft.variables['--color-character-name'] = generateDarkerVariant(value, 20);
            draft.variables['--color-character-info-text'] = generateDarkerVariant(value, 30);
            draft.variables['--color-character-tag-panel-title'] = generateDarkerVariant(value, 35);
            draft.variables['--color-block-bg'] = generateLighterVariant(value, 40);
            draft.variables['--color-block-editor-bg'] = generateLighterVariant(value, 45);
            draft.variables['--color-block-textarea-bg'] = generateLighterVariant(value, 48);
            draft.variables['--color-editor-bg'] = generateLighterVariant(value, 45);
            draft.variables['--color-editor-header-bg'] = generateLighterVariant(value, 35);
            draft.variables['--color-toolbar-btn-bg'] = generateLighterVariant(value, 40);
            draft.variables['--color-toolbar-btn-active'] = value;
            draft.variables['--color-toolbar-btn-text'] = generateDarkerVariant(value, 30);
            draft.variables['--color-blog-heading'] = generateDarkerVariant(value, 30);
            draft.variables['--color-blog-label'] = generateDarkerVariant(value, 25);
            draft.variables['--color-blog-select-bg'] = generateLighterVariant(value, 45);
            draft.variables['--color-blog-spinner-bg'] = generateLighterVariant(value, 45);
        } else if (colorName === 'secondary') {
            draft.variables['--color-bg-alt'] = generateLighterVariant(value, 35);
            draft.variables['--color-character-gender'] = generateDarkerVariant(value, 25);
            draft.variables['--color-character-avatar-bg'] = generateLighterVariant(value, 45);
            draft.variables['--color-block-toggle-bg'] = generateLighterVariant(value, 40);
            draft.variables['--color-block-toggle-text'] = generateDarkerVariant(value, 30);
            draft.variables['--color-block-toggle-hover'] = value;
            draft.variables['--color-block-toggle-hover-border'] = value;
            draft.variables['--color-editor-btn-bg'] = generateLighterVariant(value, 40);
            draft.variables['--color-editor-btn-hover'] = value;
            draft.variables['--color-editor-btn-active'] = value;
            draft.variables['--color-editor-btn-text'] = generateDarkerVariant(value, 30);
            draft.variables['--color-toolbar-bg'] = generateLighterVariant(value, 35);
            draft.variables['--color-toolbar-group-bg'] = generateLighterVariant(value, 40);
            draft.variables['--color-blog-tabs-btn'] = generateLighterVariant(value, 40);
            draft.variables['--color-blog-tabs-btn-active'] = value;
            draft.variables['--color-blog-tabs-btn-active-border'] = value;
            draft.variables['--color-blog-tabs-btn-hover'] = generateDarkerVariant(value, 5);
        } else if (colorName === 'accent') {
            draft.variables['--color-link-hover'] = generateDarkerVariant(value, 15);
            draft.variables['--color-navbar-link-hover'] = value;
            draft.variables['--color-footer-link'] = generateLighterVariant(value, 50);
            draft.variables['--color-footer-link-hover'] = value;
            draft.variables['--color-banner-bg'] = generateLighterVariant(value, 45);
            draft.variables['--color-banner-text'] = generateDarkerVariant(value, 40);
            draft.variables['--color-banner-hover'] = generateDarkerVariant(value, 10);
            draft.variables['--color-microblog-tag-bg'] = generateLighterVariant(value, 50);
            draft.variables['--color-microblog-tag-text'] = generateDarkerVariant(value, 30);
            draft.variables['--color-microblog-add-tag-bg'] = value;
            draft.variables['--color-microblog-add-tag-text'] = generateLighterVariant(value, 60);
            draft.variables['--color-microblog-add-tag-hover-bg'] = generateDarkerVariant(value, 10);
            draft.variables['--color-microblog-toggle'] = value;
            draft.variables['--color-microblog-toggle-hover'] = generateDarkerVariant(value, 10);
            draft.variables['--color-microblog-focus'] = value;
            draft.variables['--color-microblog-post-bg'] = value;
            draft.variables['--color-microblog-post-text'] = generateLighterVariant(value, 60);
            draft.variables['--color-microblog-post-hover-bg'] = generateDarkerVariant(value, 5);
            draft.variables['--color-character-type'] = value;
            draft.variables['--color-character-tag-bg'] = generateLighterVariant(value, 45);
            draft.variables['--color-character-tag-text'] = generateDarkerVariant(value, 25);
            draft.variables['--color-character-add-tag-bg'] = value;
            draft.variables['--color-character-add-tag-text'] = generateLighterVariant(value, 60);
            draft.variables['--color-character-add-tag-hover-bg'] = generateDarkerVariant(value, 10);
            draft.variables['--color-character-remove-tag'] = generateDarkerVariant(value, 20);
            draft.variables['--color-character-remove-tag-hover'] = generateDarkerVariant(value, 20); // fallback
            draft.variables['--color-character-tag-warning'] = generateMonochromaticVariant(generateDarkerVariant(value, 20), 0, 20);
            draft.variables['--color-character-art-hint'] = generateMonochromaticVariant(value, -20, 10); // fallback
            draft.variables['--color-character-info-text'] = generateDarkerVariant(value, 30);
            draft.variables['--color-character-info-bg'] = generateLighterVariant(value, 50);
            draft.variables['--color-character-info-label'] = value;
            draft.variables['--color-character-info-border'] = value;
            draft.variables['--color-character-info-shadow'] = generateMonochromaticVariant(value, 0, -5);
            draft.variables['--color-character-relationship-bg'] = generateLighterVariant(value, 45);
            draft.variables['--color-character-relationship-shadow'] = generateMonochromaticVariant(value, 0, -8);
            draft.variables['--color-character-tag-panel-bg'] = generateLighterVariant(value, 52);
        }
        return draft;
    });
    if (get(showPreview)) {
        injectCustomThemeStyle(get(customThemeDraft).variables);
    }
}

export function randomizeTheme() {
    const newPalette = generateColorPalette();
    originalPalette.set({ ...newPalette });
    customThemeDraft.update(draft => ({ ...draft, variables: { ...draft.variables, ...newPalette } }));
    hasRandomized.set(true);
    brightnessAdjustment.set(0);
}

export function adjustBrightness(value: number) {
    brightnessAdjustment.set(Math.max(-45, Math.min(45, value)));
    const adjustedPalette = adjustPaletteBrightness(get(originalPalette), get(brightnessAdjustment));
    customThemeDraft.update(draft => ({ ...draft, variables: { ...draft.variables, ...adjustedPalette } }));
}

export function saveCustomThemes() {
    localStorage.setItem('customThemes', JSON.stringify(get(customThemes)));
}

export function handleCreateTheme() {
    const draft = get(customThemeDraft);
    if (!draft.name.trim()) return;
    if (get(editingTheme)) {
        const themeIndex = get(customThemes).findIndex((t) => t.name === get(editingTheme));
        if (themeIndex !== -1) {
            const updatedThemes = [...get(customThemes)];
            updatedThemes[themeIndex] = { ...draft };
            customThemes.set(updatedThemes);
            saveCustomThemes();
            selectedTheme.set(draft.name);
        }
    } else {
        customThemes.set([...get(customThemes), { ...draft }]);
        saveCustomThemes();
        selectedTheme.set(draft.name);
    }
    showCreateForm.set(false);
    editingTheme.set(null);
    customThemeDraft.set({
        name: '',
        variables: Object.fromEntries(THEME_VARIABLES.map((v) => [v, '#ffffff'])),
        isCustom: true
    });
}

export function injectCustomThemeStyle(vars: Record<string, string>) {
    const styleId = 'custom-theme-style';
    const existing = document.getElementById(styleId);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = styleId;
    let css = ':root {';
    for (const v of THEME_VARIABLES) {
        css += `${v}: ${vars[v]};`;
    }
    css += '}';
    style.textContent = css;
    document.head.appendChild(style);
} 