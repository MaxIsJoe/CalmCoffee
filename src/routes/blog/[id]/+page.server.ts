import { error as kitError } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchMicroblogById, extractImages } from '$lib/db/blog';

export const load: PageServerLoad = async ({ params }) => {
	const { blog, error } = await fetchMicroblogById(params.id);

	if (error || !blog) {
		throw kitError(404, 'Blog post not found');
	}

	let avatarUrl = blog.profiles?.avatar_url;
	if (avatarUrl && !avatarUrl.startsWith('http')) {
		avatarUrl = `https://calm-coffee.vercel.app${avatarUrl}`;
	}

	const { content: processedContent, images } = extractImages(blog.content);
	const processedImages = images.map(img =>
		img.startsWith('http') ? img : `https://calm-coffee.vercel.app${img}`
	);

	return {
		blog: {
			...blog,
			content: processedContent
		},
		images: processedImages,
		avatarUrl,
		meta: {
			title: `${blog.profiles?.username}'s Blog Post - Calm Coffee`,
			description: processedContent.slice(0, 160),
			ogImage: avatarUrl
		}
	};
}; 