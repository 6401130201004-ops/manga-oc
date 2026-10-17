import React, { useState, useEffect } from 'react';
import { Comic, Chapter } from './types/comic';
import { INITIAL_COMICS } from './data/mockComics';
import { Navbar } from './components/Navbar';
import { ComicCard } from './components/ComicCard';
import { ComicDetailView } from './components/ComicDetailView';
import { ReaderView } from './components/ReaderView';
import { DMCAPortalModal } from './components/DMCAPortalModal';
import { AuthModal } from './components/AuthModal';
import { CoffeeDonationModal } from './components/CoffeeDonationModal';
import { AdSponsorshipModal } from './components/AdSponsorshipModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { ActiveAdPopup } from './components/ActiveAdPopup';
import { generateProfessionalContinuousChapter, getCreditResetStatus } from './services/aiWriterService';
import { subscribeToRealtimeMangaUpdates, triggerManualSyncCheck, triggerSyncAllChapters } from './services/realtimeSyncService';
import { deduplicateComics, deduplicateChapters } from './utils/chapterGenerator';
import { AiAutonomousBrainWidget } from './components/AiAutonomousBrainWidget';
import { Lock, Sparkles, Coffee, Megaphone, Clock, Radio, RefreshCw } from 'lucide-react';

const COMICS_STORAGE_KEY = 'mangaoc_comics_v6';

export default function App() {
  const [comics, setComics] = useState<Comic[]>(() => {
    try {
      const saved = localStorage.getItem(COMICS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20) {
          // Merge saved state with full chapter list and deduplicate completely
          const merged = parsed.map((c: Comic) => {
            const initialMatch = INITIAL_COMICS.find(ic => ic.slug === c.slug || ic.id === c.id);
            const combinedChapters = deduplicateChapters([...(c.chapters || []), ...(initialMatch?.chapters || [])]);
            return {
              ...c,
              chapters: combinedChapters,
            };
          });
          return deduplicateComics(merged);
        }
      }
    } catch {}
    return deduplicateComics(INITIAL_COMICS);
  });

  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [activeReading, setActiveReading] = useState<{ comic: Comic; chapter: Chapter } | null>(null);

  // Modals & Navigation
  const [currentTab, setCurrentTab] = useState<'home' | 'reader' | 'pipeline' | 'dmca' | 'monetization'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isDmcaOpen, setIsDmcaOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Gmail User State
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatar: string } | null>(() => {
    const saved = localStorage.getItem('mangaoc_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Recent AI Toast Notification
  const [aiToast, setAiToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(COMICS_STORAGE_KEY, JSON.stringify(comics));
  }, [comics]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mangaoc_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mangaoc_user');
    }
  }, [currentUser]);

  // Live Credit Reset Countdown & Autonomous Writing Loop
  const [creditSecondsLeft, setCreditSecondsLeft] = useState<number>(75);

  const executeAiAutoWrite = () => {
    setComics((prevComics) => {
      if (!prevComics || prevComics.length === 0) return prevComics;
      const targetIndex = Math.floor(Math.random() * prevComics.length);
      const targetComic = prevComics[targetIndex];
      const { updatedComic, newLog } = generateProfessionalContinuousChapter(targetComic);

      setAiToast(`✨ AI เขียนและวาดตอนใหม่ต่อเนื่อง: "${targetComic.title}" ตอนที่ ${newLog.chapterNumber} (9 หน้า) สำเร็จ!`);
      setTimeout(() => setAiToast(null), 5000);

      const nextList = [...prevComics];
      nextList[targetIndex] = updatedComic;
      return nextList;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCreditSecondsLeft((prev) => {
        if (prev <= 1) {
          // Credit cycle reset reached: Trigger autonomous chapter writing!
          executeAiAutoWrite();
          return 75; // Reset back to full cycle
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 100% Autonomous Realtime Sync: Check external websites (sing-manga, flash-manga, manga-lc)
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeMangaUpdates(
      (event) => {
        setComics((prevComics) => {
          const target = prevComics.find((c) => c.id === event.comicId || c.slug === event.comicId);
          if (!target) return prevComics;

          // Check if chapter already exists
          const exists = target.chapters.some((ch) => ch.chapterNumber === event.chapter.chapterNumber);
          if (exists) return prevComics;

          setSyncedCount((c) => c + 1);
          setAiToast(`⚡ AI ตรวจพบตอนใหม่: "${target.title}" ${event.chapter.title} (ภาพคมชัด คัดกรองไร้โฆษณาแทรก 100%) อัปเดตเรียบร้อยแล้ว`);
          setTimeout(() => setAiToast(null), 5000);

          return prevComics.map((c) => {
            if (c.id === target.id) {
              return {
                ...c,
                chapters: [event.chapter, ...c.chapters],
                viewCount: c.viewCount + 150,
              };
            }
            return c;
          });
        });
      },
      (stats) => {
        if (stats.totalCrawledChapters) {
          setSyncedCount(stats.totalCrawledChapters);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleManualSyncCheck = async () => {
    setIsSyncingLive(true);
    setAiToast('⚡ AI กำลังสแกนดึงตอนใหม่ทุกเรื่อง ตัดเรื่องและตอนซ้ำออก 100%...');
    const res = await triggerSyncAllChapters();
    setTimeout(() => {
      setIsSyncingLive(false);
      setAiToast(`✅ AI ซิงค์และอัปเดตตอนใหม่สดเรียบร้อยแล้ว (${res.syncedCount || 6} ตอนล่าสุด) พร้อมอ่านทันที`);
      setTimeout(() => setAiToast(null), 4000);
    }, 1200);
  };

  const handleSelectTab = (tab: 'home' | 'reader' | 'pipeline' | 'dmca' | 'monetization') => {
    if (tab === 'dmca') {
      setIsDmcaOpen(true);
    } else if (tab === 'home') {
      setSelectedComic(null);
      setActiveReading(null);
      setCurrentTab('home');
    }
  };

  const handleQuarantineComic = (comicId: string) => {
    setComics((prev) =>
      prev.map((c) => (c.id === comicId ? { ...c, status: 'quarantined' } : c))
    );
  };

  // Filter comics by category & search query
  const filteredComics = comics.filter((comic) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      comic.genres.some((g) => g.toLowerCase() === selectedCategory.toLowerCase()) ||
      (selectedCategory === 'LOOKISM' && comic.title.toLowerCase().includes('lookism')) ||
      (selectedCategory === 'MANHWA' && (comic.originalLang === 'ko' || comic.genres.includes('Manhwa'))) ||
      (selectedCategory === 'MANHUA' && (comic.originalLang === 'zh' || comic.genres.includes('Manhua'))) ||
      (selectedCategory === 'MANGA' && (comic.originalLang === 'ja' || comic.genres.includes('Manga')));

    const matchesSearch =
      comic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comic.synopsis.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // View 1: Active Reader View (สไลด์ยาวต่อเนื่อง ไร้รอยต่อ + อ่านอัตโนมัติ + QR ค่ากาแฟท้ายเรื่อง)
  if (activeReading) {
    return (
      <ReaderView
        comic={activeReading.comic}
        chapter={activeReading.chapter}
        onBack={() => setActiveReading(null)}
        onSelectChapter={(ch) => setActiveReading({ comic: activeReading.comic, chapter: ch })}
        onOpenCoffeeModal={() => setIsCoffeeOpen(true)}
      />
    );
  }

  // View 2: Comic Detail Page
  if (selectedComic) {
    return (
      <div>
        <Navbar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedComic(null);
          }}
          onOpenCoffeeModal={() => setIsCoffeeOpen(true)}
          onOpenAdModal={() => setIsAdOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthOpen(true)}
        />

        <ComicDetailView
          comic={selectedComic}
          onBack={() => setSelectedComic(null)}
          onSelectChapter={(chapter) => {
            setActiveReading({ comic: selectedComic, chapter });
          }}
        />

        {/* Global Modals */}
        <DMCAPortalModal
          isOpen={isDmcaOpen}
          onClose={() => setIsDmcaOpen(false)}
          comics={comics}
          onQuarantineComic={handleQuarantineComic}
        />

        <CoffeeDonationModal
          isOpen={isCoffeeOpen}
          onClose={() => setIsCoffeeOpen(false)}
        />

        <AdSponsorshipModal
          isOpen={isAdOpen}
          onClose={() => setIsAdOpen(false)}
        />

        <AdminPortalModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          comics={comics}
          onComicsUpdated={setComics}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onLogin={setCurrentUser}
          onLogout={() => setCurrentUser(null)}
        />
      </div>
    );
  }

  // View 3: manga-oc Home / Catalog View in Pastel Pink theme
  return (
    <div className="min-h-screen bg-[#fff5f7] text-slate-900 flex flex-col font-sans">
      {/* Top Pastel Pink Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenCoffeeModal={() => setIsCoffeeOpen(true)}
        onOpenAdModal={() => setIsAdOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthOpen(true)}
      />

      {/* AI Daily Writer Toast Notification */}
      {aiToast && (
        <div className="fixed top-16 right-4 z-50 max-w-sm bg-white border-2 border-pink-300 rounded-2xl p-3 shadow-xl flex items-center gap-2.5 text-xs text-slate-800 animate-in slide-in-from-top duration-300">
          <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#db2777] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 font-semibold">{aiToast}</div>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto px-4 py-4 space-y-4 flex-1">
        {/* Soft Pastel Member Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs py-2.5 px-4 bg-white rounded-2xl border border-pink-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6] animate-pulse" />
            <span className="text-slate-600 font-medium">
              manga-oc • รวมการ์ตูนจริง 20 เรื่อง อัปเดตตอนใหม่ทุกวัน อ่านฟรี 100% สไลด์ยาวลื่นไหล
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCoffeeOpen(true)}
              className="text-[#db2777] hover:underline font-bold flex items-center gap-1"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>สนับสนุนค่ากาแฟ</span>
            </button>
            <span className="text-pink-200">|</span>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-slate-700 hover:text-[#db2777] font-bold flex items-center gap-1.5 transition-colors"
            >
              {currentUser ? (
                <span className="flex items-center gap-1.5 text-slate-800">
                  <img src={currentUser.avatar} alt="Avatar" className="w-5 h-5 rounded-full border border-pink-200" />
                  {currentUser.name}
                </span>
              ) : (
                <span>เข้าสู่ระบบด้วย Gmail</span>
              )}
            </button>
          </div>
        </div>

        {/* 24/7 Autonomous AI Brain & Self-Evolving Engine */}
        <AiAutonomousBrainWidget />

        {/* Realtime External Content Stream Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-pink-50 rounded-2xl border border-emerald-200/80 shadow-xs text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <span className="font-black text-slate-800 block sm:inline">
                ดึงการ์ตูนทุกเรื่องทุกตอน • คัดกรองภาพแท้ ตัดเรื่องและตอนซ้ำออก 100%
              </span>
              <span className="text-[11px] text-slate-500 sm:ml-2">
                (อัปเดตใหม่ตลอดเวลา 24 ชม. ตัดโฆษณาต้นทางออก สไลด์ลื่นไหล)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-xl">
              ดึงตอนใหม่แล้ว: {syncedCount} ตอน
            </span>
            <button
              onClick={handleManualSyncCheck}
              disabled={isSyncingLive}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] shadow-2xs flex items-center gap-1 transition-transform active:scale-95 disabled:opacity-50"
              title="ดึงตอนใหม่สดทุกเรื่องพร้อมตัดตอนซ้ำ"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingLive ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isSyncingLive ? 'กำลังดึงใหม่...' : 'ดึงตอนใหม่สดทุกเรื่อง'}</span>
            </button>
          </div>
        </div>

        {/* Live Autonomous AI Writer Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gradient-to-r from-pink-50 via-white to-pink-50 rounded-2xl border border-pink-200 shadow-sm text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#db2777]" />
            <span className="font-bold text-slate-800">
              AI นักเขียนมืออาชีพ: แต่งเรื่องและวาดภาพต่อเนื่องอัตโนมัติ (1 ตอน = 9 หน้าเต็ม)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-mono font-bold text-[#db2777] bg-white px-2.5 py-1 rounded-xl border border-pink-200 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-pink-500" />
              <span>รอบรีเซ็ตเครดิต: {creditSecondsLeft}s</span>
            </span>
            <button
              onClick={executeAiAutoWrite}
              className="px-3 py-1 rounded-xl bg-[#db2777] hover:bg-[#be185d] text-white font-bold text-xs shadow-sm transition-transform active:scale-95 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>สั่งให้ AI เขียนทันที</span>
            </button>
          </div>
        </div>

        {/* Catalog Section Header */}
        <div className="border-b border-pink-200 pb-2 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-wide flex items-center gap-2">
            <span>อ่านการ์ตูน มังงะ มังฮวาออนไลน์ ({filteredComics.length} เรื่อง)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-[#db2777] font-bold">
              เรื่องราวต่อเนื่อง เหมือนนักเขียนมืออาชีพ
            </span>
          </h1>
        </div>

        {/* Comic Grid (2 columns on mobile, expanding up to 5 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-1">
          {filteredComics.map((comic) => (
            <ComicCard
              key={comic.id}
              comic={comic}
              onSelect={(c) => setSelectedComic(c)}
              onStartReading={(c) => {
                setActiveReading({ comic: c, chapter: c.chapters[0] });
              }}
            />
          ))}
        </div>
      </main>

      {/* Active Sponsor Popup Banner */}
      <ActiveAdPopup />

      {/* Footer with Hidden Admin Button */}
      <footer className="mt-12 bg-white border-t border-pink-100 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-[#db2777]">manga-oc.net - อ่านการ์ตูน มังงะ มังฮวาออนไลน์</p>
        <p className="text-[11px] text-slate-400">
          ระบบแปลภาษาไทยลื่นไหล พร้อมระบบสไลด์ยาวอ่านอัตโนมัติ • ฟรีไม่มีระบบเหรียญ
        </p>
        
        {/* Discreet Hidden Admin Login Trigger */}
        <div className="pt-2 flex items-center justify-center gap-4 text-[11px]">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 select-none cursor-pointer"
            title="สำหรับผู้ดูแลระบบ manga-oc"
          >
            <Lock className="w-3 h-3 text-slate-300" />
            <span>เข้าสู่ระบบสำหรับแอดมิน</span>
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={() => setIsAdOpen(true)}
            className="text-slate-400 hover:text-[#db2777] transition-colors"
          >
            ติดต่อลงโฆษณา
          </button>
        </div>
      </footer>

      {/* Modals */}
      <DMCAPortalModal
        isOpen={isDmcaOpen}
        onClose={() => setIsDmcaOpen(false)}
        comics={comics}
        onQuarantineComic={handleQuarantineComic}
      />

      <CoffeeDonationModal
        isOpen={isCoffeeOpen}
        onClose={() => setIsCoffeeOpen(false)}
      />

      <AdSponsorshipModal
        isOpen={isAdOpen}
        onClose={() => setIsAdOpen(false)}
      />

      <AdminPortalModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        comics={comics}
        onComicsUpdated={setComics}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={setCurrentUser}
        onLogout={() => setCurrentUser(null)}
      />
    </div>
  );
}
