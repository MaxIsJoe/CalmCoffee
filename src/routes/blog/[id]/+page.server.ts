import { error } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

// Extract images from markdown content
function extractImages(content: string): { content: string; images: string[] } {
	const imageRegex = /!\[.*?\]\((.*?)\)/g;
	const images: string[] = [];
	let match;
	let processedContent = content;

	// Find all image matches
	while ((match = imageRegex.exec(content)) !== null) {
		images.push(match[1]);
	}

	// Remove image markdown from content
	processedContent = processedContent.replace(imageRegex, '');

	return {
		content: processedContent.trim(),
		images
	};
}

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

	// Process content and extract images
	const { content: processedContent, images } = extractImages(data.content);

	// Ensure image URLs are absolute
	const processedImages = images.map(img => 
		img.startsWith('http') ? img : `https://calm-coffee.vercel.app${img}`
	);

	return {
		blog: {
			...data,
			content: processedContent
		},
		images: processedImages,
		avatarUrl,
		meta: {
			title: `${data.profiles?.username}'s Blog Post - Calm Coffee`,
			description: processedContent.slice(0, 160),
			ogImage: avatarUrl
		}
	};
}; 