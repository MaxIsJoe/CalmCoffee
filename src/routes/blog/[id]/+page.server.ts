import { error } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { data, error: fetchError } = await supabase
		.from('microblogs')
		.select('*, profiles:writer(username, avatar_url)')
		.eq('post_id', params.id)
		.single();

	if (fetchError) {
		throw error(404, 'Blog post not found');
	}

	if (!data) {
		throw error(404, 'Blog post not found');
	}

	// Ensure avatar URL is absolute
	let avatarUrl = data.profiles?.avatar_url;
	if (avatarUrl && !avatarUrl.startsWith('http')) {
		avatarUrl = `https://calm-coffee.vercel.app${avatarUrl}`;
	}

	return {
		blog: data,
		avatarUrl,
		meta: {
			title: `${data.profiles?.username}'s Blog Post - Calm Coffee`,
			description: data.content.slice(0, 160),
			ogImage: avatarUrl
		}
	};
}; 