<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/comp/nav/Navbar.svelte';

	let { children } = $props();
</script>

<Navbar />
{@render children()}

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
				<li><a href="https://github.com/maxisjoe/calm-coffee" target="_blank" rel="noopener">GitHub</a></li>
				<li><a href="https://www.maxisjoe.xyz/maxfund">Donate</a></li>
			</ul>
		</div>
	</div>
	<div class="footer-bottom">
		<p>&copy; {new Date().getFullYear()} MaxIsJoe. All rights reserved.</p>
	</div>
</footer>

<style>
	/* filepath: f:\projects\websites\CalmCaf\calm-coffee\src\routes\create\edit\[id]\+page.svelte */
	:global(body) {
		background: #fffdd0;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	footer {
		margin-top: auto;
		background-color: #4b2e19;
		color: #fffdd0;
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
		color: #fffdd0;
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.footer-section h4 {
		color: #fffdd0;
		font-size: 1.2rem;
		margin-bottom: 1rem;
	}

	.footer-section p {
		color: #d4c2b8;
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
		color: #d4c2b8;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-section ul li a:hover {
		color: #fffdd0;
	}

	.footer-bottom {
		text-align: center;
		padding: 1.5rem;
		margin-top: 2rem;
		background-color: #3e2723;
		color: #d4c2b8;
	}

	@media (max-width: 768px) {
		.footer-content {
			grid-template-columns: 1fr;
			padding: 0 1rem;
		}

		.footer-section {
			text-align: center;
		}
	}
</style>
