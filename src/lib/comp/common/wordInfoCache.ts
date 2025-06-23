import { writable } from 'svelte/store';

export type WordInfo = { definition: string; synonyms: string[] };

export const wordInfoCache = writable(new Map<string, WordInfo>());

export function getWordInfo(word: string): WordInfo | undefined {
  let value: WordInfo | undefined;
  wordInfoCache.update(map => {
    value = map.get(word);
    return map;
  });
  return value;
}

export function setWordInfo(word: string, info: WordInfo) {
  wordInfoCache.update(map => {
    map.set(word, info);
    return map;
  });
} 