export type Language = 'th' | 'en' | 'ja' | 'ko' | 'raw';

export interface DialogBubble {
  id: string;
  speaker: string;
  gender: 'male' | 'female' | 'unknown';
  tone: 'brave' | 'cheerful' | 'sinister' | 'cautious' | 'determined' | 'gentle' | 'neutral';
  originalText: string;
  th: string;
  en: string;
  ja: string;
  ko: string;
  x: number; // Left % (0-100)
  y: number; // Top % (0-100)
  width: number; // Width %
  height: number; // Height %
}

export interface ComicPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  ambientMood: string;
  bgmPreset: 'dungeon_ambient' | 'epic_battle' | 'romantic_waltz' | 'comic_fun' | 'mystery';
  bubbles: DialogBubble[];
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  publishedAt: string;
  ambientMood?: string;
  isUnlocked?: boolean;
  pages: ComicPage[];
}

export interface Comic {
  id: string;
  title: string;
  originalTitle: string;
  slug: string;
  author: string;
  artist: string;
  genres: string[];
  synopsis: string;
  coverImage: string;
  bannerImage?: string;
  rating: number;
  viewCount: number;
  status: 'ongoing' | 'completed' | 'quarantined';
  originalLang: string;
  chapters: Chapter[];
  isAiGenerated?: boolean;
  updatedAt?: string;
  lastChapterUpdatedText?: string;
}

export interface AdCampaign {
  id: string;
  jobName: string; // ชื่องาน
  advertiserName: string; // ผู้เสนอโฆษณา
  advertiserContact: string; // ข้อมูลติดต่อ
  popupImage: string; // ป๊อบอัพรูปภาพโฆษณา
  popupHtml?: string;
  targetUrl: string; // ลิงก์ปลายทาง
  proposedOffer?: string; // ข้อเสนอค่าตอบแทน/รายละเอียดตามปกติ
  durationDays: number; // ระยะเวลาเผยแพร่ที่ AI จัดสรรอัตโนมัติ
  status: 'active' | 'queued' | 'expired' | 'rejected';
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  queuePosition?: number;
  aiScreeningNotes?: string;
}

export interface AdItem {
  id: string;
  title: string;
  advertiser: string;
  type: string;
  status: 'approved' | 'rejected';
  complianceScore: number;
  legalNotes: string;
  bannerImage: string;
  targetUrl: string;
  impressions: number;
}

export interface PipelineJob {
  id: string;
  comicTitle: string;
  chapterNum: number;
  source: string;
  status: string;
  ocrConfidence: number;
  translatedBubbles: number;
  timestamp: string;
}
