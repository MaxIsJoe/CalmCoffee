import { supabase } from '../supabaseClient';
import type { Database } from '../../../database.types';
import { get } from 'svelte/store';
import { user } from '../stores/user';

export type Character = Database['public']['Tables']['characters']['Row'] & {
  profiles: { username: string } | null;
  characters_reactions: { reaction: string }[] | null;
  reaction_counts: Record<string, number>;
};

export interface FetchCharactersOptions {
  search?: string;
  typeFilter?: string | null;
  sort?: 'popular' | 'newest';
  currentPage?: number;
  itemsPerPage?: number;
}

export async function fetchCharacters({
  search = '',
  typeFilter = null,
  sort = 'popular',
  currentPage = 1,
  itemsPerPage = 10
}: FetchCharactersOptions = {}) {
  // Count query
  let countQuery = supabase
    .from('characters')
    .select('id', { count: 'exact', head: true });
  if (search.trim()) {
    countQuery = countQuery.ilike('character_name', `%${search.trim()}%`);
  }
  if (typeFilter) {
    countQuery = countQuery.eq('character_type', typeFilter);
  }
  const { count, error: countError } = await countQuery;
  if (countError) {
    throw new Error(countError.message);
  }
  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Data query
  let query = supabase
    .from('characters')
    .select(`
      *,
      profiles:creator(username),
      characters_reactions (
        reaction
      )
    `)
    .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
  if (search.trim()) {
    query = query.ilike('character_name', `%${search.trim()}%`);
  }
  if (typeFilter) {
    query = query.eq('character_type', typeFilter);
  }
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'popular') {
    query = query.order('created_at', { ascending: false });
  }
  const { data, error: err } = await query;
  if (err) {
    throw new Error(err.message);
  }
  // Add reaction counts
  const characters: Character[] = (data || []).map((char: Character & { characters_reactions?: { reaction: string }[] }) => {
    const reactionCounts: Record<string, number> = {};
    (char.characters_reactions || []).forEach((r: { reaction: string }) => {
      reactionCounts[r.reaction] = (reactionCounts[r.reaction] || 0) + 1;
    });
    return {
      ...char,
      reaction_counts: reactionCounts
    };
  });
  // Sort by popularity if needed
  if (sort === 'popular') {
    characters.sort((a, b) => {
      const aPositive = ((a.reaction_counts || {})['0'] || 0) + ((a.reaction_counts || {})['1'] || 0);
      const bPositive = ((b.reaction_counts || {})['0'] || 0) + ((b.reaction_counts || {})['1'] || 0);
      return bPositive - aPositive;
    });
  }
  return { characters, totalItems, totalPages };
}

export async function fetchMyCharacters() {
  const currentUser = get(user);
  if (!currentUser) return [];
  const { data, error } = await supabase
    .from('characters')
    .select('*,profiles:creator(username)')
    .eq('creator', currentUser.usr?.id)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function fetchCharacterById(id: string) {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export type CharacterInsert = Database['public']['Tables']['characters']['Insert'];

export async function createCharacter(insertData: CharacterInsert) {
  const { data, error } = await supabase
    .from('characters')
    .insert([insertData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCharacter(id: string, updateData: Partial<Character>) {
  const { error } = await supabase
    .from('characters')
    .update(updateData)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteCharacter(id: string) {
  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function fetchCharactersByCreator(creatorId: string, page = 1, pageSize = 12) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from('characters')
    .select('*', { count: 'exact' })
    .eq('creator', creatorId)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { data: data || [], total, totalPages };
} 