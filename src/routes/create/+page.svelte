<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';

	onMount(async () => {
		const { data } = await supabase.auth.getUser();
		if (data.user) {
			goto('/create/manage-projects');
		}
	});
</script>

<p>Redirecting...</p>
