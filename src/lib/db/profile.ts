import { supabase } from '../supabaseClient';
import type { Database } from '../../../database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Story = Database['public']['Tables']['stories']['Row'];

export async function fetchAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('username', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Profile[];
}

export async function fetchProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username.trim())
    .maybeSingle<Profile>();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchProfileById(id: number) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle<Profile>();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfileByUsername(username: string, updateFields: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updateFields)
    .eq('username', username)
    .select();
  if (error) throw new Error(error.message);
  return data && data[0];
}

export async function updateProfileByAccountId(accountId: string, updateFields: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updateFields)
    .eq('account_id', accountId)
    .select();
  if (error) throw new Error(error.message);
  return data && data[0];
}

export async function fetchStoriesByUserId(userId: string) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .eq('is_published', true);
  if (error) throw new Error(error.message);
  return data as Story[];
}

export interface ProfileComment {
  comment: string;
  created_at: string;
  block_id: string;
  story_id: string;
  story_title: string;
}

interface RawCommentRow {
  comment: string;
  created_at: string;
  blocks?: any; // Accept any, but handle both array and object in mapping
}

export async function fetchRecentCommentsByAccountId(accountId: string, limit = 6): Promise<ProfileComment[]> {
  const { data, error } = await supabase
    .from('story_block_comments')
    .select(`
      id,
      comment,
      created_at,
      blocks(
        id,
        chapter_id,
        chapters(
          id,
          story_id,
          stories(
            id,
            title
          )
        )
      )
    `)
    .eq('commenter_id', accountId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []).map((c: RawCommentRow): ProfileComment => {
    // blocks may be an array or object
    const blocks = Array.isArray(c.blocks) ? c.blocks[0] : c.blocks;
    const chapters = blocks?.chapters;
    const stories = Array.isArray(chapters?.stories) ? chapters.stories[0] : chapters?.stories;
    return {
      comment: c.comment,
      created_at: c.created_at,
      block_id: blocks?.id || '',
      story_id: stories?.id || '',
      story_title: stories?.title || ''
    };
  });
}

export async function fetchLatestBlogByAccountId(accountId: string) {
  const { data, error } = await supabase
    .from('microblogs')
    .select('*')
    .eq('writer', accountId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  return data && data[0];
}

export async function fetchLatestCharactersByAccountId(accountId: string, limit = 6) {
  const { data, error } = await supabase
    .from('characters')
    .select('id,character_name,character_avatar,character_type')
    .eq('creator', accountId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchProfileStats(accountId: string) {
  const [storiesRes, charsRes, blogsRes, commentsRes, profileRes] = await Promise.all([
    supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', accountId)
      .eq('is_published', true),
    supabase
      .from('characters')
      .select('*', { count: 'exact', head: true })
      .eq('creator', accountId),
    supabase
      .from('microblogs')
      .select('*', { count: 'exact', head: true })
      .eq('writer', accountId),
    supabase
      .from('story_block_comments')
      .select('*', { count: 'exact', head: true })
      .eq('commenter_id', accountId),
    supabase.from('profiles').select('created_at').eq('account_id', accountId).single()
  ]);
  return {
    totalStories: storiesRes.count || 0,
    totalCharacters: charsRes.count || 0,
    totalMicroblogs: blogsRes.count || 0,
    totalComments: commentsRes.count || 0,
    joined: profileRes.data?.created_at
      ? new Date(profileRes.data.created_at).toLocaleDateString()
      : ''
  };
}

export async function fetchMicroblogsByAccountId(accountId: string, limit = 10) {
  const { data, error } = await supabase
    .from('microblogs')
    .select('*')
    .eq('writer', accountId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateProfileInterests(accountId: string, interests: string[]) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ interests })
    .eq('account_id', accountId)
    .select('interests')
    .single();
  if (error) throw new Error(error.message);
  return data?.interests || [];
} 