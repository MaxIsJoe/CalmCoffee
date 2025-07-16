import { supabase } from '../supabaseClient';
import type { Database } from '../../../database.types';

export type Story = Database['public']['Tables']['stories']['Row'] & {
  tags?: string[];
  reaction_counts?: Record<string, number>;
};
export type Chapter = Database['public']['Tables']['chapters']['Row'];
export type Block = Database['public']['Tables']['blocks']['Row'];

// Add this type for the query result
type StoryWithReactions = {
  id: string;
  title: string;
  short_description: string;
  age_rating: Database['public']['Enums']['AgeRating'];
  created_at: string | null;
  user_id: string | null;
  tags?: string[] | null;
  updated_at: string | null;
  stories_reactions?: { reaction: Database['public']['Enums']['Reactions'] }[];
};

export async function fetchStories({ ageRating = '', sort = 'newest', currentPage = 1, itemsPerPage = 10 }: {
  ageRating?: string;
  sort?: string;
  currentPage?: number;
  itemsPerPage?: number;
}) {
  // Get total count
  let countQuery = supabase
    .from('stories')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true);
  if (ageRating) countQuery = countQuery.eq('age_rating', ageRating);
  const { count, error: countError } = await countQuery;
  if (countError) throw new Error(countError.message);
  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Fetch stories
  let query = supabase
    .from('stories')
    .select(`
      id, title, short_description, age_rating, created_at, user_id, tags, updated_at,
      stories_reactions (reaction)
    `)
    .eq('is_published', true)
    .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
  if (ageRating) query = query.eq('age_rating', ageRating);
  if (sort === 'newest') query = query.order('created_at', { ascending: false });
  else if (sort === 'oldest') query = query.order('created_at', { ascending: true });
  else if (sort === 'recently-updated') query = query.order('updated_at', { ascending: false });
  const { data, error: fetchError } = await query;
  if (fetchError) throw new Error(fetchError.message);
  const stories = (data || []).map((story: StoryWithReactions) => {
    const reactionCounts: Record<string, number> = {};
    (story.stories_reactions || []).forEach((r) => {
      reactionCounts[r.reaction] = (reactionCounts[r.reaction] || 0) + 1;
    });
    return {
      ...story,
      reaction_counts: reactionCounts
    };
  }) as Story[];
  return { stories, totalItems, totalPages };
}

export async function fetchStoryById(id: string) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Story;
}

export async function fetchAuthorByStoryUserId(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('account_id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchChaptersByStoryId(storyId: string) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Chapter[];
}

export async function fetchBlocksByChapterIds(chapterIds: string[]) {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .in('chapter_id', chapterIds)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Block[];
}

export async function fetchCommentsForBlocks(blockIds: string[]) {
  if (!blockIds || !Array.isArray(blockIds) || blockIds.length === 0) return {};
  const { data, error } = await supabase
    .from('story_block_comments')
    .select('id, commenter_id, comment, created_at, profiles(username)')
    .in('id', blockIds)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  const comments: Record<string, { id: string; commenter_id: string; comment: string; username?: string }[]> = {};
  for (const c of data || []) {
    const blockId = c.id;
    if (!comments[blockId]) comments[blockId] = [];
    comments[blockId].push({
      id: c.id,
      commenter_id: c.commenter_id,
      comment: c.comment,
      username: (c.profiles as { username: string }[])[0]?.username
    });
  }
  return comments;
}

export async function createStory(storyData: Partial<Story>) {
  const { data, error } = await supabase
    .from('stories')
    .insert(storyData)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Story;
}

export async function updateStory(id: string, updateData: Partial<Story>) {
  const { data, error } = await supabase
    .from('stories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Story;
}

export async function deleteStory(id: string, userId: string) {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function addChapter(storyId: string, userId: string, title: string) {
  const { data, error } = await supabase
    .from('chapters')
    .insert({ title, story_id: storyId, user_id: userId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Chapter;
}

export async function updateChapter(chapterId: string, updateData: Partial<Chapter>) {
  const { data, error } = await supabase
    .from('chapters')
    .update(updateData)
    .eq('id', chapterId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Chapter;
}

export async function addBlock(blockData: Partial<Block>) {
  const { data, error } = await supabase
    .from('blocks')
    .insert(blockData)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Block;
}

export async function updateBlock(blockId: string, updateData: Partial<Block>) {
  const { data, error } = await supabase
    .from('blocks')
    .update(updateData)
    .eq('id', blockId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Block;
} 