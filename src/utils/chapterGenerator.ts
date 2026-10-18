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

export const CANONICAL_STORY_MAP: Record<string, string[]> = {
  'solo-leveling': ['solo', 'solo-leveling', 'solo-leveling-ragnarok', 'ragnarok', 'ราชันย์เงา'],
  'lookism': ['lookism', 'ลูกกิซึม', 'ปาฏิหาริย์สองร่าง', 'street-fighter'],
  'eleceed': ['eleceed', 'อิลิซีด', 'เอเลซีด', 'แมวส้มสายฟ้า'],
  'nano-machine': ['nano-machine', 'nanomachine', 'นาโนแมชีน', 'นาโนมาชีน'],
  'magic-emperor': ['magic-emperor', 'demonic-emperor', 'จักรพรรดิอสูร', 'ราชาปีศาจจักรพรรดิ'],
  'omniscient-reader': ['omniscient-reader', 'omniscient-readers-viewpoint', 'orv', 'มุมมองนักอ่าน'],
  'the-beginning-after-the-end': ['the-beginning-after-the-end', 'tbate', 'กำเนิดใหม่หลังความตาย', 'จุดเริ่มต้นหลังจุดจบ'],
  'martial-peak': ['martial-peak', 'จุดสูงสุดแห่งยุทธภพ', 'ยอดปรมาจารย์แห่งยุทธภพ'],
  'the-player-that-cant-level-up': ['the-player-that-cant-level-up', 'the-player-that-can-t-level-up', 'ผู้เล่นที่อัพเลเวลไม่ได้', 'ผู้เล่นไร้เลเวล'],
  'honzuki-no-gekokujou': ['honzuki', 'honzuki-no-gekokujou', 'ascendance-of-a-bookworm', 'หนอนหนังสือ', 'ตราบาปหนอนหนังสือ'],
  'infinite-mage': ['infinite-mage', 'จอมเวทอนันต์', 'จอมเวทไร้ขีดจำกัด'],
  'disastrous-necromancer': ['disastrous-necromancer', 'catastrophic-necromancer', 'เนโครแมนเซอร์'],
  'afterlife-diner': ['afterlife-diner', 'ภัตตาคารปรโลก'],
  'reality-quest': ['reality-quest', 'เควสต์เปลี่ยนชีวิต'],
  'modern-man-in-murim': ['modern-man', 'modern-man-in-murim', 'a-modern-man-who-got-transmigrated', 'หนุ่มยุคใหม่ทะลุมิติ', 'มู่หลิน'],
  'return-of-the-mount-hua-sect': ['mount-hua', 'return-of-the-mount-hua-sect', 'blossoming-blade', 'flowering-mount-hua', 'กระบี่ดอกเหมย', 'กระบี่ฮวาซาน'],
  'pick-me-up-infinite-gacha': ['pick-me-up', 'pick-me-up-infinite-gacha', 'พิคมีอัป', 'สุ่มกาชา'],
  'sss-class-suicide-hunter': ['sss-class-suicide-hunter', 'sss-class-revival-hunter', 'suicide-hunter', 'ฮันเตอร์ผู้อยากตาย', 'ฮันเตอร์ระดับ sss'],
  'overlord-of-insects': ['overlord-of-insects', 'ราชาแมลง', '天灾级虫族之主'],
  'isekai-kara-elf-san-ga-ochite-kita-no-desu-ga': ['isekai-kara-elf-san', 'elf-san', 'เอลฟ์สาวตกมาจากต่างโลก'],
};

export function getCanonicalStoryKey(item: { id?: string; slug?: string; title?: string }): string {
  const text = `${item.id || ''} ${item.slug || ''} ${item.title || ''}`.toLowerCase();
  for (const [canon, aliases] of Object.entries(CANONICAL_STORY_MAP)) {
    for (const a of aliases) {
      if (text.includes(a.toLowerCase())) return canon;
    }
  }
  return (item.slug || item.id || item.title || '').toLowerCase().trim();
}

/**
 * Deduplicate an array of comics by canonical story key.
 * Strictly guarantees that no two versions of the same comic story exist.
 * If duplicate entries exist, merges their chapters without duplicating.
 */
export function deduplicateComics(comics: Comic[]): Comic[] {
  const seenCanonicalKeys = new Set<string>();
  const uniqueList: Comic[] = [];

  for (const c of comics) {
    if (!c) continue;
    const canonKey = getCanonicalStoryKey(c);
    if (!canonKey) continue;

    if (seenCanonicalKeys.has(canonKey)) {
      // Find existing and merge chapters
      const existing = uniqueList.find((item) => getCanonicalStoryKey(item) === canonKey);
      if (existing) {
        existing.chapters = deduplicateChapters([...(existing.chapters || []), ...(c.chapters || [])]);
      }
      continue;
    }

    seenCanonicalKeys.add(canonKey);
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
  initialPagesForLatest: ComicPage[] = [],
  publishedAtLabel?: string
): Chapter[] {
  const chapters: Chapter[] = [];

  // 1. Add latest chapter with full initial pages if available
  chapters.push({
    id: `${comicSlug}-ch-${latestChapter}`,
    chapterNumber: latestChapter,
    title: `ตอนที่ ${latestChapter}`,
    publishedAt: publishedAtLabel || 'เพิ่งอัปเดต (NEW)',
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

/**
 * Returns a sortable timestamp in milliseconds for when a comic was last updated with a new chapter.
 */
export function getComicUpdateTimestamp(comic: Comic): number {
  if (comic.updatedAt) {
    const t = new Date(comic.updatedAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  const top = comic.chapters?.[0];
  if (top && top.publishedAt) {
    const pub = top.publishedAt;
    if (pub.includes('นาที') || pub.includes('สดเมื่อสักครู่')) {
      const match = pub.match(/(\d+)\s*นาที/);
      const minutes = match ? parseInt(match[1], 10) : 5;
      return Date.now() - minutes * 60 * 1000;
    }
    if (pub.includes('ชั่วโมง')) {
      const match = pub.match(/(\d+(\.\d+)?)\s*ชั่วโมง/);
      const hours = match ? parseFloat(match[1]) : 1;
      return Date.now() - hours * 3600 * 1000;
    }
    if (pub.includes('เพิ่งอัปเดต') || pub.includes('NEW')) {
      return Date.now() - 30 * 60 * 1000;
    }
    if (pub.includes('วันนี้')) {
      return Date.now() - 2 * 3600 * 1000;
    }
    if (pub.includes('เมื่อวาน')) {
      return Date.now() - 24 * 3600 * 1000;
    }
  }
  return 0;
}

/**
 * Checks if a comic has chapters updated today.
 */
export function isComicUpdatedToday(comic: Comic): boolean {
  if (comic.updatedAt) {
    const d = new Date(comic.updatedAt);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return true;
    if (Date.now() - d.getTime() < 24 * 3600 * 1000) return true;
  }
  const top = comic.chapters?.[0];
  if (!top || !top.publishedAt) return false;
  const pub = top.publishedAt;
  return (
    pub.includes('วันนี้') ||
    pub.includes('NEW') ||
    pub.includes('เพิ่งอัปเดต') ||
    pub.includes('สดเมื่อสักครู่') ||
    pub.includes('นาที') ||
    pub.includes('ชั่วโมง')
  );
}

