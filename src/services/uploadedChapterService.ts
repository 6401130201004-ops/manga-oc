/**
 * Uploaded & External Chapter Service
 * Manages custom chapter uploads, external source imports (mgeko.cc, manhuaus.com),
 * and client-side offline caching for favorited comics.
 */

import { Chapter, ComicPage, Comic } from '../types/comic';

const OFFLINE_STORAGE_PREFIX = 'mangaoc_offline_ch_';
const FAVORITES_STORAGE_KEY = 'mangaoc_favorite_ids';

export interface ImportExternalResult {
  success: boolean;
  message: string;
  comicSlug?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  pageCount?: number;
  pages?: ComicPage[];
}

/**
 * Import and filter a chapter directly from mgeko.cc or manhuaus.com
 * Automatically translates dialogue to Thai via AI overlay
 */
export async function importChapterFromExternalUrl(
  urlOrSlug: string,
  chapterNumber: number = 1,
  comicTitle?: string
): Promise<ImportExternalResult> {
  try {
    const res = await fetch('/api/manga/import-external', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urlOrSlug,
        chapterNumber,
        comicTitle,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'ไม่สามารถเชื่อมต่อระบบนำเข้าการ์ตูนภายนอกได้',
    };
  }
}

/**
 * Upload custom chapter pages (images as base64 or URLs)
 */
export async function uploadCustomChapter(payload: {
  comicSlug: string;
  comicTitle: string;
  chapterNumber: number;
  title: string;
  images: string[];
  autoAiTranslate?: boolean;
}): Promise<ImportExternalResult> {
  try {
    const res = await fetch('/api/chapters/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'ไม่สามารถอัปโหลดตอนการ์ตูนได้',
    };
  }
}

/**
 * Save chapter locally for offline reading
 */
export function saveChapterForOffline(comicSlug: string, chapter: Chapter): boolean {
  try {
    const key = `${OFFLINE_STORAGE_PREFIX}${comicSlug.toLowerCase()}_${chapter.chapterNumber}`;
    localStorage.setItem(key, JSON.stringify({
      ...chapter,
      savedAt: new Date().toISOString(),
    }));
    return true;
  } catch (e) {
    console.warn('LocalStorage quota exceeded for offline chapter:', e);
    return false;
  }
}

/**
 * Retrieve offline stored chapter
 */
export function getOfflineChapter(comicSlug: string, chapterNumber: number): Chapter | null {
  try {
    const key = `${OFFLINE_STORAGE_PREFIX}${comicSlug.toLowerCase()}_${chapterNumber}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

/**
 * Check if a chapter is cached offline
 */
export function isChapterOfflineAvailable(comicSlug: string, chapterNumber: number): boolean {
  const key = `${OFFLINE_STORAGE_PREFIX}${comicSlug.toLowerCase()}_${chapterNumber}`;
  return !!localStorage.getItem(key);
}

/**
 * Automatically cache the latest 5 chapters for all favorited comics
 */
export function cacheFavoriteComicsOffline(favorites: Comic[]): { cachedCount: number } {
  let cachedCount = 0;
  try {
    for (const comic of favorites) {
      const top5Chapters = (comic.chapters || []).slice(0, 5);
      for (const ch of top5Chapters) {
        if (!isChapterOfflineAvailable(comic.slug, ch.chapterNumber)) {
          const success = saveChapterForOffline(comic.slug, ch);
          if (success) cachedCount++;
        }
      }
    }
  } catch (e) {}
  return { cachedCount };
}

/**
 * Get all favorited comic IDs
 */
export function getFavoriteComicIds(): string[] {
  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Toggle favorite comic
 */
export function toggleFavoriteComic(comicId: string): string[] {
  try {
    const current = getFavoriteComicIds();
    const updated = current.includes(comicId)
      ? current.filter(id => id !== comicId)
      : [...current, comicId];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
