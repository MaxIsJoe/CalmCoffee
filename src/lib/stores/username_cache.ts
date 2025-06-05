import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

type UsernameCacheEntry = {
	username: string;
	expires: number; // timestamp in ms
};

type UsernameCache = Record<string, UsernameCacheEntry>;

function createUsernameCache() {
	const { subscribe, set, update } = writable<UsernameCache>({});

	// Helper to check if entry is expired
	function isExpired(entry: UsernameCacheEntry) {
		return Date.now() > entry.expires;
	}

	// Fetch username from Supabase and update cache
	async function fetchUsername(id: string): Promise<string | null> {
		const { data, error } = await supabase
			.from('profiles')
			.select('username')
			.eq('account_id', id)
			.single();
		if (error || !data?.username) return null;
		const expires = Date.now() + 30 * 60 * 1000; // 30 minutes
		update(cache => {
			cache[id] = { username: data.username, expires };
			return { ...cache };
		});
		return data.username;
	}

	// Get username, using cache if valid, otherwise fetch
	async function getUsername(id: string): Promise<string | null> {
		let cached: UsernameCacheEntry | undefined;
		let username: string | null = null;
		update(cache => {
			cached = cache[id];
			return cache;
		});
		if (cached && !isExpired(cached)) {
			return cached.username;
		}
		username = await fetchUsername(id);
		return username;
	}

	// Optionally: expose a method to clear expired entries
	function clearExpired() {
		update(cache => {
			const now = Date.now();
			for (const id in cache) {
				if (cache[id].expires < now) {
					delete cache[id];
				}
			}
			return { ...cache };
		});
	}

	return {
		subscribe,
		getUsername,
		clearExpired,
		// For testing/debugging
		_fetchUsername: fetchUsername
	};
}

function printAllCacheEntries(cache: UsernameCache): string {
    let output = '';
    for (const [id, entry] of Object.entries(cache)) {
        output += `ID: ${id}, Username: ${entry.username}, Expires: ${new Date(entry.expires).toLocaleString()}\n`;
    }
    return output;
}

/**
 * usernameCache Svelte store
 * 
 * This store provides a local cache for usernames fetched from Supabase by user/account id.
 * Usernames are cached for 30 minutes to reduce unnecessary Supabase calls.
 * 
 * Usage:
 * 
 * import { usernameCache } from '$lib/stores/username_cache';
 * 
 * // Get a username for a given id (returns a Promise<string|null>)
 * const username = await usernameCache.getUsername('user-id-here');
 * 
 * // Use in a Svelte component:
 * <script lang="ts">
 *   import { usernameCache } from '$lib/stores/username_cache';
 *   let username: string | null = null;
 *   export let userId: string;
 *   $: if (userId) {
 *     usernameCache.getUsername(userId).then(u => username = u);
 *   }
 * </script>
 * <span>{username ?? '...'}</span>
 * 
 * // Subscribe to the cache directly (for advanced use)
 * $: $usernameCache; // gives you the whole cache object
 * 
 * // Optionally clear expired usernames from the cache
 * usernameCache.clearExpired();
 * 
 * Notes:
 * - If a username is not cached or has expired, it will be fetched from Supabase and cached.
 * - If the username is updated on Supabase, it will be refreshed after 30 minutes.
 */

export const usernameCache = createUsernameCache();

if (typeof window !== 'undefined') {
	// Get the current cache value
	let currentCache: UsernameCache = {};
	usernameCache.subscribe(cache => { currentCache = cache; });

	// Attach to window for console use
	(window as any).printAllCacheEntries = () => printAllCacheEntries(currentCache);
}
