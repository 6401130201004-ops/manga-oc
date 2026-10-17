import { Chapter, Comic, ComicPage } from '../types/comic';

/**
 * Deduplicate an array of chapters by chapterNumber.
 * Ensures strictly 1 instance of each chapter number, sorted descending (latest first).
 */
export function deduplicateChapters(chapters: Chapter[]): Chapter[] {
  const seenNumbers = new Set<number>();
  const uniqueList: Chapter[] = [];

  for (const ch of chapters) {
    if (!ch || typeof ch.chapterNumber !== 'number') continue;
    if (!seenNumbers.has(ch.chapterNumber)) {
      seenNumbers.add(ch.chapterNumber);
      uniqueList.push(ch);
    }
  }

  return uniqueList.sort((a, b) => b.chapterNumber - a.chapterNumber);
}

/**
 * Deduplicate an array of comics by id, slug, and normalized title.
 * Strictly filters out duplicate stories. If duplicate entries exist, merges their chapters without duplicating.
 */
export function deduplicateComics(comics: Comic[]): Comic[] {
  const seenSlugs = new Set<string>();
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const uniqueList: Comic[] = [];

  for (const c of comics) {
    if (!c) continue;
    const slugKey = (c.slug || '').toLowerCase().trim();
    const idKey = (c.id || '').toLowerCase().trim();
    // Normalize title by removing parenthetical subtitles and non-alphanumeric chars
    const titleKey = (c.title || '')
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/[^a-z0-9ก-๙]/gi, '')
      .trim();

    const isDuplicate = 
      (slugKey && seenSlugs.has(slugKey)) || 
      (idKey && seenIds.has(idKey)) || 
      (titleKey && titleKey.length >= 3 && seenTitles.has(titleKey));

    if (isDuplicate) {
      // Find existing and merge chapters
      const existing = uniqueList.find(
        (item) =>
          (slugKey && item.slug.toLowerCase().trim() === slugKey) ||
          (idKey && item.id.toLowerCase().trim() === idKey) ||
          (titleKey &&
            item.title
              .toLowerCase()
              .replace(/\(.*?\)/g, '')
              .replace(/[^a-z0-9ก-๙]/gi, '')
              .trim() === titleKey)
      );
      if (existing) {
        existing.chapters = deduplicateChapters([...(existing.chapters || []), ...(c.chapters || [])]);
      }
      continue;
    }

    if (slugKey) seenSlugs.add(slugKey);
    if (idKey) seenIds.add(idKey);
    if (titleKey) seenTitles.add(titleKey);

    uniqueList.push({
      ...c,
      chapters: deduplicateChapters(c.chapters || []),
    });
  }

  return uniqueList;
}

/**
 * Generate a comprehensive, realistic chapter list for a comic series.
 * Generates both recent consecutive chapters and iconic milestone/earlier chapters down to Chapter 1.
 */
export function buildComprehensiveChapterList(
  comicSlug: string,
  latestChapter: number,
  initialPagesForLatest: ComicPage[] = []
): Chapter[] {
  const chapters: Chapter[] = [];

  // 1. Add latest chapter with full initial pages if available
  chapters.push({
    id: `${comicSlug}-ch-${latestChapter}`,
    chapterNumber: latestChapter,
    title: `ตอนที่ ${latestChapter}`,
    publishedAt: 'เพิ่งอัปเดต (NEW)',
    pages: initialPagesForLatest,
  });

  // 2. Generate recent chapters (e.g. latest - 1 down to latest - 30)
  const recentSpan = Math.min(latestChapter - 1, 35);
  for (let i = 1; i <= recentSpan; i++) {
    const chNum = latestChapter - i;
    if (chNum <= 0) break;
    chapters.push({
      id: `${comicSlug}-ch-${chNum}`,
      chapterNumber: chNum,
      title: `ตอนที่ ${chNum}`,
      publishedAt: i <= 2 ? 'วันนี้' : i <= 7 ? `${i} วันที่แล้ว` : `${Math.floor(i / 7) + 1} สัปดาห์ที่แล้ว`,
      pages: [],
    });
  }

  // 3. Generate milestone chapters (every 10 or 25 chapters) down to chapter 1
  if (latestChapter > 40) {
    const step = latestChapter > 500 ? 50 : latestChapter > 200 ? 25 : 10;
    for (let chNum = Math.floor((latestChapter - 35) / step) * step; chNum >= 15; chNum -= step) {
      if (chNum <= 0) break;
      chapters.push({
        id: `${comicSlug}-ch-${chNum}`,
        chapterNumber: chNum,
        title: `ตอนที่ ${chNum}`,
        publishedAt: 'อาร์ไคฟ์ตอนคลาสสิก',
        pages: [],
      });
    }
  }

  // 4. Ensure early foundational chapters (1 to 10) are always available
  const earlyCount = Math.min(10, latestChapter);
  for (let chNum = earlyCount; chNum >= 1; chNum--) {
    chapters.push({
      id: `${comicSlug}-ch-${chNum}`,
      chapterNumber: chNum,
      title: `ตอนที่ ${chNum}`,
      publishedAt: chNum === 1 ? 'ตอนแรกเปิดเรื่อง' : 'ซีซั่นแรก',
      pages: [],
    });
  }

  return deduplicateChapters(chapters);
}
