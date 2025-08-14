<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/comp/nav/Navbar.svelte';
	import FirstTimeVisitorPopup from '$lib/comp/common/FirstTimeVisitorPopup.svelte';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import WordInfoPopup from '$lib/comp/common/WordInfoPopup.svelte';
	import { getWordInfo, setWordInfo } from '$lib/comp/common/wordInfoCache';

	let { children } = $props();
	let showBanner = $state(true);
	let versionInfo = $state<{ hash: string; message: string; timestamp: string } | null>(null);
	let wordPopup = $state<{
		word: string;
		definition: string;
		synonyms: string[];
		x: number;
		y: number;
	} | null>(null);

	// Theme switching logic
	let theme = $state('light');

	// Check if banner was previously dismissed
	function checkBannerDismissed() {
		if (typeof window !== 'undefined') {
			const dismissed = localStorage.getItem('banner-dismissed');
			if (dismissed === 'true') {
				showBanner = false;
			}
		}
	}

	function getCaretCoordinates(
		element: HTMLInputElement | HTMLTextAreaElement,
		selectionEnd: number
	) {
		// Create a mirror div for accurate caret position
		const isInput = element.nodeName === 'INPUT';
		const div = document.createElement('div');
		const style = getComputedStyle(element);
		for (const prop of [
			'boxSizing',
			'width',
			'height',
			'overflowX',
			'overflowY',
			'borderTopWidth',
			'borderRightWidth',
			'borderBottomWidth',
			'borderLeftWidth',
			'paddingTop',
			'paddingRight',
			'paddingBottom',
			'paddingLeft',
			'fontStyle',
			'fontVariant',
			'fontWeight',
			'fontStretch',
			'fontSize',
			'fontSizeAdjust',
			'lineHeight',
			'fontFamily',
			'textAlign',
			'textTransform',
			'textIndent',
			'textDecoration',
			'letterSpacing',
			'wordSpacing'
		]) {
			// @ts-ignore
			div.style[prop] = style[prop];
		}
		div.style.position = 'absolute';
		div.style.visibility = 'hidden';
		div.style.whiteSpace = 'pre-wrap';
		if (isInput) div.style.whiteSpace = 'pre';
		div.textContent = element.value.substring(0, selectionEnd);
		if (!isInput) div.textContent += '\u200b';
		document.body.appendChild(div);
		const span = document.createElement('span');
		span.textContent = element.value.substring(selectionEnd) || '.';
		div.appendChild(span);
		const rect = span.getBoundingClientRect();
		document.body.removeChild(div);
		return { x: rect.left, y: rect.top };
	}

	function handleInputSelection(e: Event) {
		const el = e.target as HTMLInputElement | HTMLTextAreaElement;
		if (!el) return;
		const start = el.selectionStart ?? 0;
		const end = el.selectionEnd ?? 0;
		if (start === end) return;
		const text = el.value.slice(start, end).trim();
		if (text && /^\w+$/.test(text)) {
			const { x, y } = getCaretCoordinates(el, end);
			fetchWordInfo(text, x, y + 24); // 24px offset for caret height
			return;
		}
		clearWordPopup();
	}

	function attachInputListeners() {
		const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
		for (const el of inputs) {
			el.removeEventListener('mouseup', handleInputSelection);
			el.removeEventListener('keyup', handleInputSelection);
			el.removeEventListener('touchend', handleInputSelection);
			el.addEventListener('mouseup', handleInputSelection);
			el.addEventListener('keyup', handleInputSelection);
			el.addEventListener('touchend', handleInputSelection);
		}
	}

	onMount(() => {
		// Check if banner was previously dismissed
		checkBannerDismissed();

		let cleanup: (() => void) | undefined;
		(async () => {
			try {
				const response = await fetch('/version.json');
				versionInfo = await response.json();
			} catch (error) {
				console.error('Failed to load version info:', error);
			}
			function handleSelection(e: MouseEvent | TouchEvent) {
				if (e instanceof MouseEvent && e.button !== 0) return;
				const target = e.target as HTMLElement;
				if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
				const selection = window.getSelection();
				if (selection && selection.rangeCount > 0) {
					const text = selection.toString().trim();
					if (text && /^\w+$/.test(text)) {
						let x = 0,
							y = 0;
						if (e instanceof MouseEvent) {
							x = e.clientX;
							y = e.clientY;
						} else if (e instanceof TouchEvent && e.touches.length > 0) {
							x = e.touches[0].clientX;
							y = e.touches[0].clientY;
						}
						fetchWordInfo(text, x, y);
						return;
					}
				}
				clearWordPopup();
			}
			document.addEventListener('mouseup', handleSelection);
			document.addEventListener('touchend', handleSelection);
			document.addEventListener('mousedown', (e) => {
				if (wordPopup) {
					clearWordPopup();
				}
			});
			attachInputListeners();
			setTimeout(attachInputListeners, 500); // catch late/dynamic inputs
			cleanup = () => {
				document.removeEventListener('mouseup', handleSelection);
				document.removeEventListener('touchend', handleSelection);
				document.removeEventListener('mousedown', clearWordPopup);
				const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
				for (const el of inputs) {
					el.removeEventListener('mouseup', handleInputSelection);
					el.removeEventListener('keyup', handleInputSelection);
					el.removeEventListener('touchend', handleInputSelection);
				}
			};
		})();
		return () => {
			if (cleanup) cleanup();
		};
	});

	async function fetchWordInfo(word: string, x: number, y: number) {
		// Check store cache first
		const cached = getWordInfo(word);
		if (cached) {
			const { definition, synonyms } = cached;
			if (definition) {
				wordPopup = { word, definition, synonyms, x, y };
			} else {
				wordPopup = null;
			}
			return;
		}
		let definition = '';
		let synonyms: string[] = [];
		try {
			const defRes = await fetch(
				`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
			);
			if (defRes.ok) {
				const defData = await defRes.json();
				definition = defData[0]?.meanings?.[0]?.definitions?.[0]?.definition || '';
			} else {
				definition = '';
			}
			const synRes = await fetch(
				`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}`
			);
			if (synRes.ok) {
				const synData = await synRes.json();
				synonyms = synData.map((s: any) => s.word);
			}
		} catch (e) {
			definition = '';
			synonyms = [];
		}
		// Store in Svelte store
		setWordInfo(word, { definition, synonyms });
		if (definition) {
			wordPopup = { word, definition, synonyms, x, y };
		} else {
			wordPopup = null;
		}
	}

	function dismissBanner() {
		showBanner = false;
		// Save the preference to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('banner-dismissed', 'true');
		}
	}

	function clearWordPopup() {
		wordPopup = null;
	}
</script>

<Navbar />
<FirstTimeVisitorPopup />
{#if showBanner}
	<div class="banner" transition:slide>
		<span>Calm Coffee is still in pre-alpha. Learn more <a href="/roadmap">here</a></span>
		<button onclick={dismissBanner} aria-label="Dismiss banner">×</button>
	</div>
{/if}
{#if wordPopup}
	<WordInfoPopup
		word={wordPopup.word}
		definition={wordPopup.definition}
		synonyms={wordPopup.synonyms}
		x={wordPopup.x}
		y={wordPopup.y}
		on:close={() => (wordPopup = null)}
	/>
{/if}
<main>
	{@render children()}
</main>

<footer>
	<div class="footer-content">
		<div class="footer-section">
			<h3>Calm Coffee</h3>
			<p>A cozy space for writers and readers to share their stories.</p>
		</div>
		<div class="footer-section">
			<h4>Quick Links</h4>
			<ul>
				<li><a href="/">Home</a></li>
				<li><a href="/read">Read</a></li>
				<li><a href="/rules">Community Rules</a></li>
			</ul>
		</div>
		<div class="footer-section">
			<h4>Connect</h4>
			<ul>
				<li>
					<a href="https://github.com/maxisjoe/calm-coffee" target="_blank" rel="noopener">GitHub</a
					>
				</li>
				<li><a href="https://www.maxisjoe.xyz/maxfund">Donate</a></li>
			</ul>
		</div>
	</div>
	<div class="footer-bottom">
		<p>&copy; {new Date().getFullYear()} MaxIsJoe. All rights reserved.</p>
		{#if versionInfo}
			<p class="version-info">
				Version: <a
					href={`https://github.com/maxisjoe/CalmCoffee/commit/${versionInfo.hash}`}
					target="_blank"
					rel="noopener">{versionInfo.hash}</a
				>
				- {versionInfo.message}
				<br />
				<span class="build-time">Built: {new Date(versionInfo.timestamp).toLocaleString()}</span>
			</p>
		{/if}
	</div>
</footer>

<style>
	/* filepath: f:\projects\websites\CalmCaf\calm-coffee\src\routes\create\edit\[id]\+page.svelte */
	:global(body) {
		background: var(--color-bg);
		color: var(--color-text);
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Oxygen,
			Ubuntu,
			Cantarell,
			sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	:global(p, li, span, div) {
		line-height: 1.6;
		letter-spacing: 0.01em;
	}

	:global(.read-story-container) {
		font-family: 'Merriweather', Georgia, serif;
		font-size: 1.1rem;
		line-height: 1.8;
		letter-spacing: 0.01em;
	}

	:global(.read-story-container p) {
		margin-bottom: 1.5em;
	}

	:global(.read-story-container h1) {
		font-size: 2.2em;
		line-height: 1.3;
		margin-bottom: 0.8em;
	}

	:global(.read-story-container h2) {
		font-size: 1.8em;
		line-height: 1.4;
		margin: 1.5em 0 0.8em;
	}

	:global(.read-story-container h3) {
		font-size: 1.5em;
		line-height: 1.4;
		margin: 1.3em 0 0.7em;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	main {
		flex: 1;
		width: 100%;
		margin: 0 auto;
		padding: 1rem;
		box-sizing: border-box;
	}

	footer {
		margin-top: auto;
		background-color: var(--color-footer-bg);
		color: var(--color-footer-text);
		padding: 2rem 0 0 0;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.footer-section {
		padding: 1rem;
	}

	.footer-section h3 {
		color: var(--color-footer-text);
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.footer-section h4 {
		color: var(--color-footer-text);
		font-size: 1.2rem;
		margin-bottom: 1rem;
	}

	.footer-section p {
		color: var(--color-footer-muted);
		line-height: 1.6;
	}

	.footer-section ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.footer-section ul li {
		margin-bottom: 0.5rem;
	}

	.footer-section ul li a {
		color: var(--color-footer-link);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-section ul li a:hover {
		color: var(--color-footer-link-hover);
	}

	.footer-bottom {
		text-align: center;
		padding: 1.5rem;
		margin-top: 2rem;
		background-color: var(--color-footer-alt);
		color: var(--color-footer-muted);
	}

	@media (max-width: 768px) {
		main {
			padding: 0;
			max-width: 100%;
		}

		footer {
			display: none;
		}

		.footer-content {
			grid-template-columns: 1fr;
			padding: 0 1rem;
			gap: 1rem;
		}

		.footer-section {
			text-align: center;
			padding: 0.8rem;
		}

		.footer-section h3 {
			font-size: 1.3rem;
		}

		.footer-section h4 {
			font-size: 1.1rem;
		}

		.footer-bottom {
			padding: 1rem;
			margin-top: 1rem;
		}
	}

	@media (max-width: 480px) {
		main {
			padding: 0;
			max-width: 100%;
		}

		.footer-content {
			padding: 0 0.5rem;
		}

		.footer-section {
			padding: 0.5rem;
		}
	}

	.banner {
		background-color: var(--color-banner-bg);
		color: var(--color-banner-text);
		padding: 0.75rem 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		text-align: center;
	}

	.banner button {
		position: absolute;
		right: 1rem;
		background: none;
		border: none;
		color: var(--color-banner-text);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0 0.5rem;
		line-height: 1;
	}

	.banner button:hover {
		color: var(--color-banner-hover);
	}

	.version-info {
		font-size: 0.8rem;
		margin-top: 0.5rem;
	}

	.build-time {
		font-size: 0.7rem;
		color: var(--color-footer-muted);
	}

	.version-info a {
		color: var(--color-footer-link);
		text-decoration: none;
	}

	.version-info a:hover {
		color: var(--color-footer-link-hover);
		text-decoration: underline;
	}
</style>
