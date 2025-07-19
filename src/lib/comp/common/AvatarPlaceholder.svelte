<script lang="ts">
	export let minSize: string = '6px';
</script>

<svg
	viewBox="0 0 40 40"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	style="min-width: {minSize}; min-height: {minSize};"
>
	<circle cx="20" cy="20" r="20" fill="#e0e0e0" />
	<circle cx="20" cy="15" r="7" fill="#bdbdbd" />
	<ellipse cx="20" cy="30" rx="12" ry="7" fill="#bdbdbd" />
</svg>

<style>
	svg {
		display: block;
		border-radius: 50%;
		background: #e0e0e0;
	}
</style>
