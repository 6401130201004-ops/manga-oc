import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Volume2, VolumeX, 
  Globe, Play, Pause, ChevronUp, FastForward, Sliders, Sparkles, Music
} from 'lucide-react';
import { Comic, Chapter, ComicPage, DialogBubble, Language } from '../types/comic';
import { 
  audioEngine, VoiceSettings, SlideSettings, 
  mapGenreOrMoodToBgmPreset, BGM_PRESET_LABELS, BgmPresetKey 
} from '../services/audioEngine';
import { CoffeeSupportCard } from './CoffeeSupportCard';
import { generateWebtoonPanelSvg } from '../utils/comicPageGenerator';
import { ReaderSettingsModal } from './ReaderSettingsModal';

interface ReaderViewProps {
  comic: Comic;
  chapter: Chapter;
  onBack: () => void;
  onSelectChapter: (chapter: Chapter) => void;
  onOpenCoffeeModal?: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  comic,
  chapter,
  onBack,
  onSelectChapter,
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>('th');
  const [isBgmActive, setIsBgmActive] = useState<boolean>(false);
  const [bgmPreset, setBgmPreset] = useState<string>(() => 
    mapGenreOrMoodToBgmPreset(comic.genres, `${chapter.ambientMood || ''} ${chapter.title || ''} ${comic.synopsis || ''}`)
  );
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  const [activeSpeakingText, setActiveSpeakingText] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showBubbles, setShowBubbles] = useState<boolean>(true);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [isAutoNarrating, setIsAutoNarrating] = useState<boolean>(false);

  // Voice Settings State
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem('mangaoc_voice_settings');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        autoReadOnScroll: false,
        pauseSlideWhileSpeaking: true,
        characterGenderTone: true,
      };
    } catch {
      return {
        enabled: true,
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        autoReadOnScroll: false,
        pauseSlideWhileSpeaking: true,
        characterGenderTone: true,
      };
    }
  });

  // Slide Settings State
  const [slideSettings, setSlideSettings] = useState<SlideSettings>(() => {
    try {
      const saved = localStorage.getItem('mangaoc_slide_settings');
      return saved ? JSON.parse(saved) : {
        enabled: false,
        speedMultiplier: 1.0,
        pixelsPerSec: 40,
        autoNextChapter: true,
        pauseOnUserTouch: true,
      };
    } catch {
      return {
        enabled: false,
        speedMultiplier: 1.0,
        pixelsPerSec: 40,
        autoNextChapter: true,
        pauseOnUserTouch: true,
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('mangaoc_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  useEffect(() => {
    localStorage.setItem('mangaoc_slide_settings', JSON.stringify(slideSettings));
  }, [slideSettings]);

  // Auto-detect and adapt BGM preset based on chapter mood or comic genre
  useEffect(() => {
    const detected = mapGenreOrMoodToBgmPreset(
      comic.genres,
      `${chapter.ambientMood || ''} ${chapter.title || ''} ${comic.synopsis || ''}`
    );
    setBgmPreset(detected);
    if (isBgmActive) {
      audioEngine.setPreset(detected);
    }
  }, [comic, chapter, isBgmActive]);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.stopBGM();
      audioEngine.stopSpeaking();
    };
  }, []);

  // Track scroll position, visual progress bar, and save Continue Reading state
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? Math.min(100, Math.max(0, (scrollY / totalHeight) * 100)) : 0;
      setReadingProgress(Math.round(progress));

      // Save continue reading progress to localStorage
      try {
        const payload = {
          comicId: comic.id,
          comicSlug: comic.slug,
          comicTitle: comic.title,
          coverImage: comic.coverImage,
          chapterId: chapter.id,
          chapterNumber: chapter.chapterNumber,
          chapterTitle: chapter.title,
          scrollY,
          progressPercent: Math.round(progress),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`mangaoc_continue_${comic.slug}`, JSON.stringify(payload));
        localStorage.setItem('mangaoc_last_read_comic', JSON.stringify(payload));
      } catch (e) {}
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [comic, chapter]);

  // Resume last scroll position on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`mangaoc_continue_${comic.slug}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.chapterNumber === chapter.chapterNumber && data.scrollY > 150) {
          setTimeout(() => {
            window.scrollTo({ top: data.scrollY, behavior: 'smooth' });
          }, 450);
        }
      }
    } catch (e) {}
  }, [comic.slug, chapter.chapterNumber]);

  // Loaded pages
  const [loadedPages, setLoadedPages] = useState<ComicPage[]>(chapter.pages);
  const [isLoadingPages, setIsLoadingPages] = useState<boolean>(false);
  const [readerMode, setReaderMode] = useState<'clean_stream' | 'native'>('native');
  const [iframeHeight, setIframeHeight] = useState<number>(3600);

  // Floating controls & Scroll
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
  const userInteractionTimeoutRef = useRef<any>(null);
  const scrollAnimRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Listen to height broadcast from clean-stream iframe for 100% invisible borderless embed
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data && e.data.type === 'MANGA_IFRAME_RESIZE' && typeof e.data.height === 'number') {
        setIframeHeight(Math.max(e.data.height, 1200));
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  useEffect(() => {
    if (chapter.pages && chapter.pages.length > 0) {
      setLoadedPages(chapter.pages);
      return;
    }

    setIsLoadingPages(true);
    fetch(`/api/manga/chapter-pages?slug=${comic.slug}&chapterNumber=${chapter.chapterNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.images && data.images.length > 0) {
          const fetchedPages: ComicPage[] = data.images.map((imgUrl: string, idx: number) => ({
            id: `p-${comic.slug}-${chapter.chapterNumber}-${idx}`,
            pageNumber: idx + 1,
            imageUrl: imgUrl,
            ambientMood: `การดำเนินเรื่องสุดเข้มข้น ตอนที่ ${chapter.chapterNumber} หน้าที่ ${idx + 1}`,
            bgmPreset: idx % 2 === 0 ? 'dungeon_ambient' : 'epic_battle',
            bubbles: [
              {
                id: `b-${chapter.chapterNumber}-${idx + 1}`,
                speaker: idx % 2 === 0 ? 'ตัวเอก' : 'คู่ต่อสู้',
                gender: idx % 2 === 0 ? 'male' : 'female',
                tone: idx % 2 === 0 ? 'determined' : 'sinister',
                th: `ตอนที่ ${chapter.chapterNumber} หน้าที่ ${idx + 1} เรื่องราวกำลังเข้มข้น!`,
                en: `Chapter ${chapter.chapterNumber} Page ${idx + 1}`,
                ja: `第${chapter.chapterNumber}話 第${idx + 1}ページ`,
                ko: `제${chapter.chapterNumber}화 ${idx + 1}페이지`,
                originalText: `Chapter ${chapter.chapterNumber} Page ${idx + 1}`,
                x: idx % 2 === 0 ? 12 : 58,
                y: idx % 3 === 0 ? 18 : idx % 3 === 1 ? 48 : 72,
                width: 25,
                height: 9,
              },
            ],
          }));
          setLoadedPages(fetchedPages);
        } else {
          setLoadedPages(chapter.pages && chapter.pages.length > 0 ? chapter.pages : []);
        }
      })
      .catch(() => {
        setLoadedPages(chapter.pages);
      })
      .finally(() => {
        setIsLoadingPages(false);
      });
  }, [chapter, comic]);

  // Touch and Wheel interaction listeners to pause auto-slide if enabled
  useEffect(() => {
    if (!slideSettings.pauseOnUserTouch) return;

    const handleUserTouch = () => {
      setIsUserInteracting(true);
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
      userInteractionTimeoutRef.current = setTimeout(() => {
        setIsUserInteracting(false);
      }, 2200);
    };

    window.addEventListener('touchstart', handleUserTouch, { passive: true });
    window.addEventListener('wheel', handleUserTouch, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleUserTouch);
      window.removeEventListener('wheel', handleUserTouch);
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    };
  }, [slideSettings.pauseOnUserTouch]);

  // Chapter navigation calculation
  const sortedChapters = [...comic.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentIndex = sortedChapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  // Handle Smooth Auto-Slide (สไลด์อัตโนมัติ)
  useEffect(() => {
    if (!slideSettings.enabled) {
      if (scrollAnimRef.current) {
        cancelAnimationFrame(scrollAnimRef.current);
        scrollAnimRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const step = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Smart Pause 1: If speech is actively narrating and pauseSlideWhileSpeaking is on
      const isSpeaking = audioEngine.isSpeaking();
      const shouldPauseForSpeech = voiceSettings.pauseSlideWhileSpeaking && isSpeaking;

      // Smart Pause 2: If user is interacting
      const shouldPauseForUser = isUserInteracting;

      if (!shouldPauseForSpeech && !shouldPauseForUser && delta > 0 && delta < 0.2) {
        const scrollDelta = slideSettings.pixelsPerSec * delta;
        window.scrollBy({ top: scrollDelta, left: 0, behavior: 'auto' });

        // If reached bottom of page:
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 40) {
          if (slideSettings.autoNextChapter && nextChapter) {
            onSelectChapter(nextChapter);
          } else {
            setSlideSettings((prev) => ({ ...prev, enabled: false }));
          }
          return;
        }
      }

      scrollAnimRef.current = requestAnimationFrame(step);
    };

    scrollAnimRef.current = requestAnimationFrame(step);

    return () => {
      if (scrollAnimRef.current) {
        cancelAnimationFrame(scrollAnimRef.current);
      }
    };
  }, [
    slideSettings.enabled, 
    slideSettings.pixelsPerSec, 
    slideSettings.autoNextChapter, 
    voiceSettings.pauseSlideWhileSpeaking,
    isUserInteracting,
    nextChapter,
    onSelectChapter
  ]);

  // Track window scroll for "Scroll to Top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleBgm = () => {
    if (isBgmActive) {
      audioEngine.stopBGM();
      setIsBgmActive(false);
    } else {
      audioEngine.playBGM(bgmPreset);
      setIsBgmActive(true);
    }
  };

  const handleSelectBgmPreset = (preset: string) => {
    setBgmPreset(preset);
    if (isBgmActive) {
      audioEngine.setPreset(preset);
    }
  };

  // Speak character speech bubble - text is 100% identical to speech bubble
  const handleSpeakBubble = async (bubble: DialogBubble, overrideText?: string) => {
    if (!voiceSettings.enabled) return;
    setActiveBubbleId(bubble.id);

    const rawText = overrideText || (
      selectedLang === 'th' ? bubble.th :
      selectedLang === 'en' ? bubble.en :
      selectedLang === 'ja' ? bubble.ja :
      selectedLang === 'ko' ? bubble.ko :
      bubble.originalText
    );
    // Strip meta tags like (หน้า 1) so spoken text matches bubble dialogue cleanly
    const textToSpeak = (rawText || '').replace(/\s*\((?:หน้า|page)\s*\d+\)/gi, '').trim();

    setActiveSpeakingText(`"${textToSpeak}"`);

    await audioEngine.speakCharacterVoice(
      textToSpeak,
      selectedLang === 'raw' ? 'th' : selectedLang,
      bubble.gender,
      bubble.tone,
      voiceSettings
    );

    setActiveSpeakingText(null);
    setActiveBubbleId((prev) => (prev === bubble.id ? null : prev));
  };

  // Sequential character voice auto narration loop
  useEffect(() => {
    if (!isAutoNarrating || !loadedPages || loadedPages.length === 0) return;

    let isCancelled = false;
    const allBubbles = loadedPages.flatMap((p) => p.bubbles || []);
    if (allBubbles.length === 0) return;

    let currentIndex = 0;

    const narrateNext = async () => {
      if (isCancelled || currentIndex >= allBubbles.length) {
        if (!isCancelled) setIsAutoNarrating(false);
        return;
      }

      const bubble = allBubbles[currentIndex];
      await handleSpeakBubble(bubble);

      if (isCancelled) return;
      currentIndex++;
      setTimeout(narrateNext, 600);
    };

    narrateNext();

    return () => {
      isCancelled = true;
      audioEngine.stopSpeaking();
    };
  }, [isAutoNarrating, loadedPages, selectedLang]);

  const langLabels: Record<Language, { label: string; flag: string }> = {
    th: { label: 'ภาษาไทย (แปลลื่นไหล)', flag: '🇹🇭' },
    en: { label: 'English', flag: '🇬🇧' },
    ja: { label: '日本語 (Japanese)', flag: '🇯🇵' },
    ko: { label: '한국어 (Korean)', flag: '🇰🇷' },
    raw: { label: 'ต้นฉบับดั้งเดิม (Raw)', flag: '📄' },
  };

  return (
    <div className="min-h-screen bg-[#fff5f7] text-slate-800 flex flex-col items-center select-none font-sans">
      {/* 1. Top Pastel Pink Sticky Navigation Bar with Visual Progress Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#f472b6] text-white shadow-md">
        {/* Visual Reading Progress Bar */}
        <div className="w-full h-1 bg-white/25 overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-amber-300 via-yellow-200 to-white transition-all duration-100 ease-out shadow-xs"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-13 flex items-center justify-between gap-2">
          {/* Back button & Title */}
          <div className="flex items-center gap-2 overflow-hidden">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors flex-shrink-0"
              aria-label="Back to catalog"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="truncate">
              <h1 className="text-xs sm:text-sm font-bold truncate text-white leading-tight">
                {comic.title}
              </h1>
              <p className="text-[10px] text-pink-100 font-medium">
                {chapter.title} • อ่านแล้ว <span className="font-bold text-white bg-white/20 px-1 py-0.2 rounded-md">{readingProgress}%</span> ({loadedPages.length} หน้า)
              </p>
            </div>
          </div>

          {/* Quick Header Actions: Stream Mode, Customization & Audio */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Seamless Stream / Native Toggle Button */}
            <button
              onClick={() => setReaderMode(m => m === 'clean_stream' ? 'native' : 'clean_stream')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs ${
                readerMode === 'clean_stream'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white ring-2 ring-emerald-200'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title="สลับโหมดการแสดงผล: สตรีมกรองไร้โฆษณา / แคนวาสคมชัดสูง"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">
                {readerMode === 'clean_stream' ? 'สตรีมไร้โฆษณา' : 'แคนวาสความเร็วสูง'}
              </span>
              <span className="sm:hidden">
                {readerMode === 'clean_stream' ? 'สตรีม' : 'แคนวาส'}
              </span>
            </button>

            {/* Ambient BGM Button (Mood & Genre Driven) */}
            <button
              onClick={handleToggleBgm}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                isBgmActive
                  ? 'bg-purple-600 hover:bg-purple-700 text-white ring-2 ring-purple-300 animate-pulse'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title={`เพลงบรรยากาศปรับตามอารมณ์: ${BGM_PRESET_LABELS[bgmPreset as BgmPresetKey]?.label || bgmPreset}`}
            >
              <span>{BGM_PRESET_LABELS[bgmPreset as BgmPresetKey]?.icon || '🎵'}</span>
              <span className="hidden sm:inline">{isBgmActive ? 'BGM เล่นอยู่' : 'เปิดเพลง BGM'}</span>
              {isBgmActive && (
                <span className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-3.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </button>

            {/* Easy Customization Menu Trigger Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
              title="เปิดเมนูปรับแต่งการอ่าน (เสียงพากย์และสไลด์อัตโนมัติ)"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ปรับแต่ง</span>
            </button>

            {/* Chapter Selector Dropdown */}
            <select
              value={chapter.id}
              onChange={(e) => {
                const target = comic.chapters.find((c) => c.id === e.target.value);
                if (target) onSelectChapter(target);
              }}
              className="bg-white text-slate-800 font-bold text-xs rounded-xl py-1 px-2 border-0 shadow-sm focus:outline-none cursor-pointer"
            >
              {sortedChapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* 2. Webtoon Long-Strip Canvas / Seamless Stream */}
      <main className="w-full max-w-2xl bg-white flex flex-col items-center p-0 m-0 min-h-screen shadow-md relative">
        {/* Stream / Canvas Mode Indicator Badge */}
        <div className="w-full py-1.5 px-3 bg-pink-50/70 border-b border-pink-100 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">
              {readerMode === 'clean_stream' 
                ? 'ระบบสตรีมกรองเฉพาะการ์ตูนแท้ • ตัดโฆษณาต้นทางออก 100% (ไร้รอยต่อ)' 
                : 'โหมดแคนวาสความเร็วสูง • ภาพคมชัดระดับ HD พร้อมระบบอ่านด้วยเสียง'}
            </span>
          </div>
          <span className="text-[10px] text-pink-600 font-bold hidden sm:inline">
            สไลด์ได้ • อ่านได้ 24 ชม.
          </span>
        </div>

        {isLoadingPages && (
          <div className="w-full py-16 flex flex-col items-center justify-center gap-3 bg-pink-50/50">
            <div className="w-9 h-9 border-4 border-[#f472b6] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-[#db2777]">กำลังโหลดภาพการ์ตูนคุณภาพสูง...</p>
          </div>
        )}

        {/* View Mode A: Clean Ad-Free Seamless Iframe Stream (ออกแบบเนียนมองไม่เห็น iframe ไร้ขอบ ไร้สกอร์บาร์) */}
        {readerMode === 'clean_stream' ? (
          <div className="w-full relative bg-white overflow-hidden m-0 p-0">
            <iframe
              src={`/api/manga/clean-stream?slug=${comic.slug}&chapterNumber=${chapter.chapterNumber}`}
              title="Clean Ad-Filtered Manga Stream"
              className="w-full border-0 m-0 p-0 block bg-white transition-opacity duration-300"
              style={{
                height: `${iframeHeight}px`,
                overflow: 'hidden',
                display: 'block',
              }}
              scrolling="no"
            />
          </div>
        ) : (
          /* View Mode B: Native Image Strip with Strictly Bounded Dialogue Speech Bubbles */
          loadedPages.map((page, index) => (
            <div
              key={page.id || `p-${index}`}
              className="relative w-full p-0 m-0 leading-none overflow-hidden"
            >
              {/* Seamless vertical panel */}
              <img
                src={page.imageUrl}
                alt={`${chapter.title} หน้า ${index + 1}`}
                className="w-full h-auto block p-0 m-0 border-0"
                loading={index < 3 ? 'eager' : 'lazy'}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallbackApplied) {
                    target.dataset.fallbackApplied = 'true';
                    target.src = generateWebtoonPanelSvg({
                      comicTitle: comic.title,
                      chapterNumber: chapter.chapterNumber,
                      pageNumber: page.pageNumber || index + 1,
                      theme: comic.genres.includes('Murim') ? 'murim' : comic.genres.includes('Action') ? 'action' : 'fantasy',
                    });
                  }
                }}
              />

              {/* Dialog speech bubbles: STRICTLY FIT INSIDE ORIGINAL BALLOON (ไม่เกินกล่องข้อความเดิมของภาพ 100%) */}
              {showBubbles && page.bubbles && page.bubbles.map((bubble) => {
                const isHighlighted = activeBubbleId === bubble.id;
                const displayText =
                  selectedLang === 'th' ? bubble.th :
                  selectedLang === 'en' ? bubble.en :
                  selectedLang === 'ja' ? bubble.ja :
                  selectedLang === 'ko' ? bubble.ko :
                  bubble.originalText;

                // Clamp bounding box strictly so it NEVER spills outside the comic panel balloon
                const safeWidth = Math.min(bubble.width || 24, 25);
                const safeHeight = Math.min(bubble.height || 9, 10);
                const safeX = Math.max(3, Math.min(bubble.x, 72));
                const safeY = Math.max(3, Math.min(bubble.y, 88));

                const charCount = displayText.length;
                const fontClass = charCount > 35 
                  ? 'text-[7.5px] leading-[1.1]' 
                  : charCount > 20 
                  ? 'text-[8.5px] leading-tight' 
                  : 'text-[9.5px] leading-tight';

                return (
                  <div
                    key={bubble.id}
                    onClick={() => handleSpeakBubble(bubble)}
                    style={{
                      left: `${safeX}%`,
                      top: `${safeY}%`,
                      width: `${safeWidth}%`,
                      maxHeight: `${safeHeight}%`,
                      maxWidth: '25%',
                      boxSizing: 'border-box',
                    }}
                    className={`absolute z-10 px-1.5 py-0.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center text-center overflow-hidden border shadow-xs ${
                      isHighlighted
                        ? 'bg-[#db2777] text-white border-white scale-105 shadow-md ring-2 ring-pink-300'
                        : 'bg-white/95 text-slate-900 border-slate-300 hover:border-pink-400 hover:bg-pink-50'
                    }`}
                    title="แตะเพื่อฟังเสียงพากย์"
                  >
                    <p className={`${fontClass} font-bold line-clamp-2 select-none`}>
                      {displayText}
                    </p>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* 3. Thai QR Code Coffee Support Card at the End of Every Chapter */}
        <div className="w-full px-4 pt-6 pb-2 bg-gradient-to-b from-white to-pink-50">
          <CoffeeSupportCard
            comicTitle={comic.title}
            chapterNumber={chapter.chapterNumber}
          />
        </div>

        {/* 4. Chapter Navigation Section */}
        <div className="w-full py-6 px-4 bg-white border-t border-pink-100 flex flex-col items-center gap-3">
          <p className="text-xs text-slate-500 font-medium">จบ{chapter.title} (อ่านครบทั้ง {loadedPages.length} หน้า)</p>
          <div className="flex items-center justify-center gap-3 w-full max-w-xs">
            <button
              onClick={() => prevChapter && onSelectChapter(prevChapter)}
              disabled={!prevChapter}
              className="flex-1 py-2 px-3 rounded-xl border border-pink-200 bg-pink-50 hover:bg-pink-100 text-xs font-bold text-slate-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ตอนก่อนหน้า</span>
            </button>

            <button
              onClick={() => nextChapter && onSelectChapter(nextChapter)}
              disabled={!nextChapter}
              className="flex-1 py-2 px-3 rounded-xl bg-[#f472b6] hover:bg-[#fb7185] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1"
            >
              <span>ตอนถัดไป</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Floating Active Speech Subtitle Bar (แสดงเมื่อกำลังอ่านออกเสียง) */}
      {activeSpeakingText && (
        <div className="fixed bottom-20 z-40 max-w-md w-[92%] bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl border border-pink-400/40 shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom">
          <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Volume2 className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs font-semibold leading-tight line-clamp-2">
            {activeSpeakingText}
          </p>
        </div>
      )}

      {/* 5. Floating Bottom Control Dock: Auto-Slide, Voice, Settings & Language */}
      <div className="fixed bottom-4 z-40 max-w-md w-[92%] bg-white/95 backdrop-blur-md border border-pink-200 rounded-2xl shadow-xl p-2 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Language HUD Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl text-xs font-bold text-[#db2777] transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{langLabels[selectedLang].flag}</span>
          </button>

          {showLangMenu && (
            <div className="absolute bottom-11 left-0 w-44 bg-white border border-pink-200 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 animate-in fade-in">
              <span className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                เลือกภาษาอ่าน
              </span>
              {(Object.keys(langLabels) as Language[]).map((langKey) => (
                <button
                  key={langKey}
                  onClick={() => {
                    setSelectedLang(langKey);
                    setShowLangMenu(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                    selectedLang === langKey
                      ? 'bg-[#f472b6] text-white font-bold'
                      : 'text-slate-700 hover:bg-pink-50'
                  }`}
                >
                  <span>{langLabels[langKey].flag} {langLabels[langKey].label}</span>
                  {selectedLang === langKey && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auto-Slide Toggle Button (สไลด์อัตโนมัติ) */}
        <button
          onClick={() => setSlideSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 ${
            slideSettings.enabled
              ? 'bg-[#fb7185] text-white animate-pulse'
              : 'bg-pink-100 text-[#db2777] hover:bg-pink-200'
          }`}
          title={slideSettings.enabled ? 'หยุดสไลด์อัตโนมัติ' : 'เปิดการสไลด์อัตโนมัติ'}
        >
          {slideSettings.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{slideSettings.enabled ? 'หยุดสไลด์' : 'สไลด์อัตโนมัติ'}</span>
        </button>

        {/* Voice Auto-Narrate / Manual Toggle Button */}
        <button
          onClick={() => {
            if (!voiceSettings.enabled) {
              setVoiceSettings((prev) => ({ ...prev, enabled: true }));
            }
            setIsAutoNarrating((prev) => !prev);
          }}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 ${
            isAutoNarrating
              ? 'bg-purple-600 text-white animate-pulse ring-2 ring-purple-300'
              : voiceSettings.enabled
              ? 'bg-pink-50 border border-pink-200 text-[#db2777] hover:bg-pink-100'
              : 'bg-slate-100 text-slate-400'
          }`}
          title={isAutoNarrating ? 'หยุดการพากย์เสียงต่อเนื่อง' : 'เปิดการพากย์เสียงบทสนทนาต่อเนื่อง'}
        >
          {isAutoNarrating ? (
            <Volume2 className="w-3.5 h-3.5 animate-bounce" />
          ) : voiceSettings.enabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{isAutoNarrating ? 'กำลังพากย์' : 'พากย์เสียง'}</span>
        </button>

        {/* Visual Progress Badge */}
        <div 
          className="px-2 py-1 bg-pink-50 rounded-xl border border-pink-200 text-[#db2777] font-black text-[11px] flex items-center gap-0.5 shadow-2xs"
          title={`อ่านถึง ${readingProgress}% ของตอนนี้`}
        >
          <span>{readingProgress}%</span>
        </div>

        {/* Settings Menu Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-pink-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
          title="เปิดเมนูปรับแต่งการอ่าน (ความเร็วสไลด์และเสียงพากย์)"
        >
          <Sliders className="w-4 h-4 text-slate-700" />
          <span className="hidden sm:inline">ปรับแต่ง</span>
        </button>
      </div>

      {/* 6. Floating Scroll-To-Top Circular Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-40 w-11 h-11 rounded-full bg-[#1e293b]/90 hover:bg-[#0f172a] text-white flex items-center justify-center shadow-2xl transition-all duration-200 active:scale-90"
          aria-label="Scroll to top"
          title="เลื่อนกลับด้านบนสุด"
        >
          <ChevronUp className="w-6 h-6 stroke-[3]" />
        </button>
      )}

      {/* Reader Customization Modal */}
      <ReaderSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={setVoiceSettings}
        slideSettings={slideSettings}
        onUpdateSlideSettings={setSlideSettings}
        selectedLang={selectedLang}
        onSelectLang={setSelectedLang}
        showBubbles={showBubbles}
        onToggleShowBubbles={setShowBubbles}
        isBgmActive={isBgmActive}
        onToggleBgm={handleToggleBgm}
        bgmPreset={bgmPreset}
        onSelectBgmPreset={handleSelectBgmPreset}
      />
    </div>
  );
};
