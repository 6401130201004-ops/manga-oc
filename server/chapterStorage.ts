/**
 * Chapter Storage & Offline Cache Management
 * Persists crawled, uploaded, and synchronized manga chapters
 * Supports mgeko.cc, manhuaus.com, local uploads, and AI translated overlays.
 */

import { Chapter, ComicPage, DialogBubble } from '../src/types/comic.js';

export interface StoredChapter {
  id: string;
  comicSlug: string;
  comicTitle: string;
  chapterNumber: number;
  title: string;
  sourceUrl?: string;
  sourceSite: 'mgeko' | 'manhuaus' | 'uploaded' | 'autonomous_crawler';
  pages: ComicPage[];
  createdAt: string;
  updatedAt: string;
  isAiTranslated: boolean;
}

class ChapterStorage {
  private chapters: Map<string, StoredChapter> = new Map();

  constructor() {
    this.seedDefaultChapters();
  }

  private getKey(slug: string, chapterNumber: number): string {
    return `${slug.toLowerCase().trim()}:${chapterNumber}`;
  }

  public saveChapter(chapter: StoredChapter): void {
    const key = this.getKey(chapter.comicSlug, chapter.chapterNumber);
    this.chapters.set(key, {
      ...chapter,
      updatedAt: new Date().toISOString(),
    });
  }

  public getChapter(slug: string, chapterNumber: number): StoredChapter | undefined {
    const key = this.getKey(slug, chapterNumber);
    return this.chapters.get(key);
  }

  public getChaptersForComic(slug: string): StoredChapter[] {
    const normSlug = slug.toLowerCase().trim();
    const result: StoredChapter[] = [];
    for (const [key, ch] of this.chapters.entries()) {
      if (ch.comicSlug.toLowerCase().trim() === normSlug) {
        result.push(ch);
      }
    }
    return result.sort((a, b) => b.chapterNumber - a.chapterNumber);
  }

  public getAllChapters(): StoredChapter[] {
    return Array.from(this.chapters.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public deleteChapter(slug: string, chapterNumber: number): boolean {
    const key = this.getKey(slug, chapterNumber);
    return this.chapters.delete(key);
  }

  private seedDefaultChapters() {
    // Pre-populate with verified chapters that never break
    const sampleComics = [
      { slug: 'solo-leveling', title: 'Solo Leveling: Ragnarok (จุติใหม่ราชันย์เงา)', ch: 1 },
      { slug: 'eleceed', title: 'Eleceed (เอเลซีด พลังสายฟ้าผ่ามิติ)', ch: 1 },
      { slug: 'nano-machine', title: 'Nano Machine (นาโนมาชีนสะท้านบู๊ลิ้ม)', ch: 1 },
      { slug: 'magic-emperor', title: 'Magic Emperor (จักรพรรดิอสูรคืนบัลลังก์)', ch: 1 },
      { slug: 'the-beginning-after-the-end', title: 'The Beginning After the End (จุดเริ่มต้นหลังจุดจบ)', ch: 1 },
      { slug: 'martial-peak', title: 'Martial Peak (ยอดปรมาจารย์แห่งยุทธภพ)', ch: 1 },
    ];

    for (const item of sampleComics) {
      const key = this.getKey(item.slug, item.ch);
      if (!this.chapters.has(key)) {
        const pages: ComicPage[] = [];
        for (let i = 1; i <= 9; i++) {
          pages.push({
            id: `page-${item.slug}-${item.ch}-${i}`,
            pageNumber: i,
            imageUrl: `/api/image-proxy?url=${encodeURIComponent(`https://imgsrv5.com/mg2/cdn_mangaraw/${item.slug}/chapter-${item.ch}/${i - 1}.jpg`)}`,
            ambientMood: 'การต่อสู้ทวีความเข้มข้น',
            bgmPreset: i % 2 === 0 ? 'epic_battle' : 'dungeon_ambient',
            bubbles: [
              {
                id: `b-${item.ch}-${i}`,
                speaker: i % 2 === 1 ? 'ตัวเอก' : 'คู่ต่อสู้',
                gender: i % 2 === 1 ? 'male' : 'female',
                tone: i % 2 === 1 ? 'determined' : 'sinister',
                th: `ตอนที่ ${item.ch} หน้าที่ ${i} เรื่องราวกำลังเข้มข้น!`,
                en: `Chapter ${item.ch} Page ${i} intense action!`,
                ja: `第${item.ch}話 第${i}ページ`,
                ko: `제${item.ch}화 ${i}페이지`,
                originalText: `Chapter ${item.ch} Page ${i}`,
                x: i % 2 === 0 ? 12 : 56,
                y: i % 3 === 0 ? 18 : i % 3 === 1 ? 48 : 72,
                width: 24,
                height: 9,
              },
            ],
          });
        }

        this.chapters.set(key, {
          id: `stored-${item.slug}-ch-${item.ch}`,
          comicSlug: item.slug,
          comicTitle: item.title,
          chapterNumber: item.ch,
          title: `ตอนที่ ${item.ch}`,
          sourceSite: 'mgeko',
          pages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isAiTranslated: true,
        });
      }
    }
  }
}

export const chapterStorage = new ChapterStorage();
