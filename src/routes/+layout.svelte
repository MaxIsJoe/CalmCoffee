<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/comp/nav/Navbar.svelte';

	let { children } = $props();
</script>

<Navbar />
{@render children()}

<style>
	/* filepath: f:\projects\websites\CalmCaf\calm-coffee\src\routes\create\edit\[id]\+page.svelte */
	:global(body) {
		background: #fffdd0;
	}
	h2 {
		text-align: center;
		margin-top: 2rem;
		color: #4b2e19;
	}
	h3 {
		color: #6d4c41;
		margin-top: 2rem;
		margin-bottom: 1rem;
		text-align: center;
	}
	ul {
		list-style: none;
		padding: 0;
		max-width: 600px;
		margin: 2rem auto 1rem auto;
	}
	li {
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		padding: 1.2rem 1.5rem;
		margin-bottom: 1.2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	strong {
		font-size: 1.1rem;
		color: #3e2723;
	}
	button {
		background: #a1887f;
		color: #fff;
		border: none;
		border-radius: 4px;
		padding: 0.5rem 1.2rem;
		margin-left: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	button:hover {
		background: #6d4c41;
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
