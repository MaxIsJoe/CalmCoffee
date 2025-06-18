export function getLastReadChapter(storyId: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`reading_progress_${storyId}`);
}

export function saveLastReadChapter(storyId: string, chapterId: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`reading_progress_${storyId}`, chapterId);
}

export function clearReadingProgress(storyId: string) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`reading_progress_${storyId}`);
} 