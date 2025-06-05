import { writable } from 'svelte/store';
import type { ProfileType } from '$lib/types/profile';
import type { User } from '@supabase/supabase-js';

export const user = writable<UserStoreType | null>(null);

export type UserStoreType = {
    usr: User | null;
    profile: ProfileType | null;
}