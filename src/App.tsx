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
import { subscribeToRealtimeMangaUpdates } from './services/realtimeSyncService';
import { deduplicateComics, deduplicateChapters, getComicUpdateTimestamp, isComicUpdatedToday, getCanonicalStoryKey } from './utils/chapterGenerator';
import { Lock, Sparkles, Coffee, Megaphone, Clock, Play, Flame, ArrowUpDown } from 'lucide-react';

const COMICS_STORAGE_KEY = 'mangaoc_comics_v9_canonical';

export default function App() {
  const [comics, setComics] = useState<Comic[]>(() => {
    try {
      const saved = localStorage.getItem(COMICS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge any saved chapters strictly into the 20 canonical INITIAL_COMICS
          const merged = INITIAL_COMICS.map((canonicalComic) => {
            const canonKey = getCanonicalStoryKey(canonicalComic);
            const matched = parsed.find((p: Comic) => getCanonicalStoryKey(p) === canonKey);
            if (matched) {
              return {
                ...canonicalComic,
                updatedAt: matched.updatedAt || canonicalComic.updatedAt,
                lastChapterUpdatedText: matched.lastChapterUpdatedText || canonicalComic.lastChapterUpdatedText,
                chapters: deduplicateChapters([...(matched.chapters || []), ...(canonicalComic.chapters || [])]),
              };
            }
            return canonicalComic;
          });
          return deduplicateComics(merged);
        }
      }
    } catch {}
    return deduplicateComics(INITIAL_COMICS);
  });

  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [activeReading, setActiveReading] = useState<{ comic: Comic; chapter: Chapter } | null>(null);

  // Modals, Navigation & Sorting
  const [currentTab, setCurrentTab] = useState<'home' | 'reader' | 'pipeline' | 'dmca' | 'monetization'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest_update' | 'rating' | 'views' | 'chapters' | 'title'>('latest_update');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isDmcaOpen, setIsDmcaOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Continue Reading State (resumes exact chapter & scroll)
  const [continueReading, setContinueReading] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('mangaoc_last_read_comic');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mangaoc_last_read_comic');
      if (raw) {
        setContinueReading(JSON.parse(raw));
      }
    } catch (e) {}
  }, [activeReading]);

  const handleResumeReading = () => {
    if (!continueReading) return;
    const targetComic = comics.find(
      (c) => c.slug === continueReading.comicSlug || c.id === continueReading.comicId
    );
    if (!targetComic) return;
    const targetChapter = targetComic.chapters.find(
      (ch) => ch.chapterNumber === continueReading.chapterNumber
    ) || targetComic.chapters[0];

    if (targetChapter) {
      setActiveReading({ comic: targetComic, chapter: targetChapter });
    }
  };

  const handleChapterAdded = (comicSlug: string, newChapter: Chapter) => {
    setComics((prevComics) => {
      const canonKey = getCanonicalStoryKey({ slug: comicSlug });
      const target = prevComics.find((c) => getCanonicalStoryKey(c) === canonKey);
      if (!target) return prevComics;

      const chapters = deduplicateChapters([newChapter, ...(target.chapters || [])]);
      const updated: Comic = {
        ...target,
        chapters,
        updatedAt: new Date().toISOString(),
        lastChapterUpdatedText: `เพิ่งอัปเดต (${newChapter.title})`,
        viewCount: target.viewCount + 100,
      };

      const remaining = prevComics.filter((c) => getCanonicalStoryKey(c) !== canonKey);
      return deduplicateComics([updated, ...remaining]);
    });
  };

  // Gmail User State
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatar: string } | null>(() => {
    const saved = localStorage.getItem('mangaoc_user');
    return saved ? JSON.parse(saved) : null;
  });

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

  // Silent Autonomous Background Development & Chapter Publishing
  const executeAiAutoWrite = () => {
    setComics((prevComics) => {
      if (!prevComics || prevComics.length === 0) return prevComics;
      const targetIndex = Math.floor(Math.random() * prevComics.length);
      const targetComic = prevComics[targetIndex];
      const { updatedComic, newLog } = generateProfessionalContinuousChapter(targetComic);

      const enhancedComic: Comic = {
        ...updatedComic,
        updatedAt: new Date().toISOString(),
        lastChapterUpdatedText: `เพิ่งอัปเดต (ตอนที่ ${newLog.chapterNumber})`,
      };

      const canonKey = getCanonicalStoryKey(targetComic);
      const remaining = prevComics.filter((c) => getCanonicalStoryKey(c) !== canonKey);
      return deduplicateComics([enhancedComic, ...remaining]);
    });
  };

  useEffect(() => {
    // Runs autonomously in the background every 60s
    const timer = setInterval(() => {
      executeAiAutoWrite();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Silent Realtime Sync: Receives new chapters and updates canonically in background
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeMangaUpdates(
      (event) => {
        setComics((prevComics) => {
          const eventCanon = getCanonicalStoryKey({ id: event.comicId, slug: event.comicId, title: event.comicTitle });
          const target = prevComics.find((c) => getCanonicalStoryKey(c) === eventCanon);
          if (!target) return prevComics;

          // Check if chapter already exists
          const exists = target.chapters.some((ch) => ch.chapterNumber === event.chapter.chapterNumber);
          if (exists) return prevComics;

          const updated: Comic = {
            ...target,
            chapters: deduplicateChapters([event.chapter, ...target.chapters]),
            updatedAt: new Date().toISOString(),
            lastChapterUpdatedText: `เพิ่งอัปเดต (${event.chapter.title})`,
            viewCount: target.viewCount + 150,
          };

          const remaining = prevComics.filter((c) => getCanonicalStoryKey(c) !== eventCanon);
          return deduplicateComics([updated, ...remaining]);
        });
      }
    );

    return () => unsubscribe();
  }, []);


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

  // Sort comics based on user selection or default latest update (วันนี้/ตอนใหม่ล่าสุด)
  const sortedAndFilteredComics = [...filteredComics].sort((a, b) => {
    if (sortBy === 'latest_update') {
      return getComicUpdateTimestamp(b) - getComicUpdateTimestamp(a);
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'views') {
      return b.viewCount - a.viewCount;
    }
    if (sortBy === 'chapters') {
      return (b.chapters?.length || 0) - (a.chapters?.length || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title, 'th');
    }
    return 0;
  });

  const updatedTodayCount = comics.filter(isComicUpdatedToday).length;

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

        {/* Continue Reading Banner (อ่านต่อจากที่ค้างไว้) */}
        {continueReading && (
          <div className="p-3.5 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-2xl border-2 border-pink-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              {continueReading.coverImage && (
                <img
                  src={continueReading.coverImage}
                  alt={continueReading.comicTitle}
                  className="w-11 h-15 object-cover rounded-xl shadow-xs border border-pink-200 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=60';
                  }}
                />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#db2777] font-black text-[10px] uppercase">
                    อ่านต่อจากจุดเดิม
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold">
                    อ่านแล้ว {continueReading.progressPercent}%
                  </span>
                </div>
                <h3 className="font-black text-slate-800 text-sm line-clamp-1">
                  {continueReading.comicTitle}
                </h3>
                <p className="text-[11px] text-slate-600 font-medium">
                  {continueReading.chapterTitle} • เลื่อนลงถึงตำแหน่งเดิมอัตโนมัติ
                </p>
                <div className="w-44 sm:w-56 h-1.5 bg-pink-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-full" 
                    style={{ width: `${continueReading.progressPercent || 15}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleResumeReading}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 flex-shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>อ่านต่อทันที ({continueReading.progressPercent}%)</span>
            </button>
          </div>
        )}

        {/* Catalog Section Header & Sorting Bar */}
        <div className="space-y-3">
          {/* Announcement of today's updates - Home page is Updated Today */}
          <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 border border-pink-200/90 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-xs">
                <Flame className="w-4 h-4 fill-white" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-xs sm:text-sm text-slate-800">
                    หน้าแรก • อัปเดตใหม่วันนี้ ({updatedTodayCount} เรื่องล่าสุด)
                  </span>
                  <span className="bg-rose-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    UPDATED TODAY
                  </span>
                </div>
                <span className="text-[11px] text-pink-700/80 block sm:inline font-medium">
                  เรียงลำดับตามการอัปตอนใหม่ล่าสุดให้อัตโนมัติ (เรื่องที่มีตอนใหม่จะอยู่บนสุดทันที)
                </span>
              </div>
            </div>
          </div>

          {/* Catalog Title + Sorting Selector */}
          <div className="border-b border-pink-200 pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-wide flex items-center gap-2 flex-wrap">
              <span>
                {selectedCategory === 'all' 
                  ? 'อัปเดตใหม่วันนี้ • การ์ตูน มังงะ มังฮวา' 
                  : `หมวดหมู่ ${selectedCategory}`} ({sortedAndFilteredComics.length} เรื่อง)
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-pink-100 text-[#db2777] font-bold">
                {sortBy === 'latest_update' ? '🔥 ตอนใหม่ล่าสุดอยู่บนสุด' : 'จัดเรียงตามที่เลือก'}
              </span>
            </h1>

            {/* Sort Control Dropdown */}
            <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-pink-500" />
                <span>จัดเรียง:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border-2 border-pink-200 hover:border-pink-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-2xs cursor-pointer"
              >
                <option value="latest_update">🔥 อัปเดตตอนใหม่ล่าสุด (วันนี้)</option>
                <option value="rating">⭐ คะแนนเรตติ้งสูงสุด</option>
                <option value="views">👁️ ยอดเข้าชมมากที่สุด</option>
                <option value="chapters">📚 จำนวนตอนมากที่สุด</option>
                <option value="title">🔤 ชื่อเรื่อง (ก-ฮ / A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comic Grid (2 columns on mobile, expanding up to 5 on desktop) */}
        {sortedAndFilteredComics.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-pink-200 p-6 space-y-3">
            <p className="text-sm font-bold text-slate-600">ไม่พบการ์ตูนในหมวดหมู่นี้</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-1.5 bg-[#db2777] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#be185d]"
            >
              แสดงทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-1">
            {sortedAndFilteredComics.map((comic) => (
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
        )}
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
