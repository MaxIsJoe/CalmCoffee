import { supabase } from '../supabaseClient';

const STORE = "ContentStore";

export enum StoreContentType {
    TEMPLATE = 'TEMPLATE',
    STYLE = 'STYLE'
}

export type StoreContent = {
    name: string,
    description: string,
    id: number,
    content: string,
    type: StoreContentType
    created_by: string
}

export async function fetchStoreContent({ limit = 10, offset = 0 }: { limit?: number; offset?: number }) {
    const { data, error, count } = await supabase
        .from(STORE)
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1);
    if (error) throw error;
    return { data, count };
}

export async function createStoreContent(content: Omit<StoreContent, 'id'>) {
    if (content.content === null || content.content === undefined || content.content.length <= 5) {
        throw new Error("can't upload empty data");
    }
    const { data, error } = await supabase
        .from(STORE)
        .insert([content])
        .select()
        .single();
    if (error) throw error;
    return data;
}


export async function updateStoreContent(id: number, updates: Partial<Omit<StoreContent, 'id'>>) {
    const { data, error } = await supabase
        .from(STORE)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}


export async function deleteStoreContent(id: number) {
    const { error } = await supabase
        .from(STORE)
        .delete()
        .eq('id', id);
    if (error) throw error;
    return { success: true };
}