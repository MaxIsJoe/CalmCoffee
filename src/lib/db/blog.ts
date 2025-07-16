import { supabase } from '../supabaseClient';
import type { BlogType } from '../types/blog';
import type { AgeRating } from '../types/story';

export async function fetchMicroblogs({
  ageFilter = 'all',
  currentTab = 'latest',
  userInterests = [],
  limit = 20
}: {
  ageFilter?: AgeRating | 'all';
  currentTab?: 'latest' | 'interests';
  userInterests?: string[];
  limit?: number;
}): Promise<{ blogs: BlogType[]; error: string | null }> {
  let query = supabase
    .from('microblogs')
    .select('*, profiles:writer(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (ageFilter !== 'all') {
    query = query.eq('age_rating', ageFilter);
  }

  if (currentTab === 'interests' && userInterests && userInterests.length > 0) {
    query = query.overlaps('tags', userInterests);
  }

  const { data, error } = await query;
  return {
    blogs: data || [],
    error: error ? error.message : null
  };
}

export async function fetchMicroblogById(id: string): Promise<{ blog: BlogType | null; error: string | null }> {
  const { data, error } = await supabase
    .from('microblogs')
    .select('*, profiles:writer(username, avatar_url)')
    .eq('post_id', id)
    .single();
  return {
    blog: data || null,
    error: error ? error.message : null
  };
}

export function extractImages(content: string): { content: string; images: string[] } {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images: string[] = [];
  let match;
  let processedContent = content;

  while ((match = imageRegex.exec(content)) !== null) {
    images.push(match[1]);
  }

  processedContent = processedContent.replace(imageRegex, '');

  return {
    content: processedContent.trim(),
    images
  };
} 