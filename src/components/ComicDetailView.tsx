import React, { useState } from 'react';
import { Star, MessageSquare, Bookmark, ArrowUpDown, ArrowLeft } from 'lucide-react';
import { Comic, Chapter } from '../types/comic';

interface ComicDetailViewProps {
  comic: Comic;
  onBack: () => void;
  onSelectChapter: (chapter: Chapter) => void;
}

export const ComicDetailView: React.FC<ComicDetailViewProps> = ({
  comic,
  onBack,
  onSelectChapter,
}) => {
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [isSeasonOpen, setIsSeasonOpen] = useState(true);
  const [isAscending, setIsAscending] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentCount, setCommentCount] = useState(12);
  const [chapterFilter, setChapterFilter] = useState('');

  const sortedChapters = [...comic.chapters]
    .filter((ch) => {
      if (!chapterFilter.trim()) return true;
      const q = chapterFilter.trim().toLowerCase();
      return ch.title.toLowerCase().includes(q) || String(ch.chapterNumber).includes(q);
    })
    .sort((a, b) => {
      return isAscending
        ? a.chapterNumber - b.chapterNumber
        : b.chapterNumber - a.chapterNumber;
    });

  const firstChapter = [...comic.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber)[0];
  const lastChapter = [...comic.chapters].sort((a, b) => b.chapterNumber - a.chapterNumber)[0];

  return (
    <div className="min-h-screen bg-[#fff5f7] text-slate-800 pb-20">
      {/* 1. Breadcrumbs Strip */}
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-2 text-xs text-pink-700/80 flex items-center gap-1.5 flex-wrap">
        <button onClick={onBack} className="hover:text-[#db2777] font-semibold transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>หน้าแรก</span>
        </button>
        <span>/</span>
        <span className="hover:text-[#db2777] cursor-pointer">การ์ตูนทั้งหมด</span>
        <span>/</span>
        <span className="hover:text-[#db2777] cursor-pointer">{comic.genres[0]}</span>
        <span>/</span>
        <span className="text-slate-800 font-bold truncate max-w-[200px]">{comic.title.split('(')[0]}</span>
      </div>

      {/* 2. Top Title Curved Pill Banner */}
      <div className="max-w-3xl mx-auto px-4 my-2">
        <div className="w-full bg-white border border-pink-200 text-[#db2777] font-extrabold text-center py-2.5 px-4 rounded-full shadow-sm text-base sm:text-lg tracking-wide truncate">
          {comic.title.split('(')[0]}
        </div>
      </div>

      {/* 3. Blurred Cover Backdrop and Poster Section */}
      <div className="relative overflow-hidden pt-4 pb-6">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 blur-2xl scale-125"
          style={{ backgroundImage: `url(${comic.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff5f7]/60 via-[#fff5f7]/80 to-[#fff5f7]" />

        <div className="relative max-w-3xl mx-auto px-4 flex flex-col items-center">
          <div className="w-48 sm:w-56 aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-pink-100">
            <img
              src={comic.coverImage}
              alt={comic.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 4. Metadata Details Card */}
      <div className="max-w-3xl mx-auto px-4 space-y-5">
        {/* Star Rating Row (Pastel Pink Stars) */}
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <div className="flex text-[#f472b6]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-6 h-6 fill-[#f472b6] text-[#f472b6]"
              />
            ))}
          </div>
          <span className="text-xl font-bold font-mono text-slate-800">{comic.rating}</span>
        </div>

        {/* Info Rows */}
        <div className="space-y-1.5 text-xs text-slate-700 bg-white p-4 rounded-2xl border border-pink-200 shadow-sm">
          <div>
            <span className="font-bold text-slate-900 block sm:inline">คะแนนความนิยม</span>
            <span className="sm:ml-2 text-pink-700 font-semibold">{comic.rating} / 5.0 (ยอดเยี่ยม)</span>
          </div>

          <div>
            <span className="font-bold text-slate-900 block sm:inline">หมวดหมู่</span>
            <span className="sm:ml-2 text-slate-600">{comic.genres.join(', ')}</span>
          </div>

          <div>
            <span className="font-bold text-slate-900 block sm:inline">สถานะ</span>
            <span className="sm:ml-2 text-emerald-600 font-bold">{comic.status === 'ongoing' ? 'กำลังเผยแพร่ (OnGoing)' : 'จบแล้ว (Completed)'}</span>
          </div>

          <div>
            <span className="font-bold text-slate-900 block sm:inline">แปลและจัดทำโดย</span>
            <span className="sm:ml-2 text-slate-600">{comic.author}</span>
          </div>
        </div>

        {/* Comments & Bookmark Stats */}
        <div className="grid grid-cols-2 gap-4 py-3 bg-white p-3 rounded-2xl border border-pink-200 text-xs shadow-sm">
          <button 
            onClick={() => setCommentCount(c => c + 1)}
            className="flex flex-col items-center gap-1 text-slate-600 hover:text-[#db2777] transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-[#f472b6]" />
            <span className="font-semibold">{commentCount} ความคิดเห็น</span>
          </button>

          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="flex flex-col items-center gap-1 transition-colors text-slate-600 hover:text-[#db2777]"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-[#f472b6] text-[#f472b6]' : 'text-[#f472b6]'}`} />
            <span className="font-semibold">{isBookmarked ? 'บันทึกแล้ว (6 คน)' : 'คั่นหน้านี้ไว้ (5 คน)'}</span>
          </button>
        </div>

        {/* Read First & Read Last Buttons (Pastel Pink Theme) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => firstChapter && onSelectChapter(firstChapter)}
            className="py-3 px-4 bg-white border border-pink-300 hover:bg-pink-50 text-[#db2777] font-bold text-sm rounded-2xl shadow-sm transition-all text-center active:scale-95"
          >
            อ่านตอนแรก
          </button>

          <button
            onClick={() => lastChapter && onSelectChapter(lastChapter)}
            className="py-3 px-4 bg-[#f472b6] hover:bg-[#fb7185] text-white font-bold text-sm rounded-2xl shadow-md transition-all text-center active:scale-95"
          >
            อ่านตอนล่าสุด
          </button>
        </div>

        {/* 5. SUMMARY Section */}
        <section className="pt-2">
          <div className="flex items-center gap-2 border-b border-pink-200 pb-2 mb-3">
            <span className="text-[#f472b6] font-bold">★</span>
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-900">เรื่องย่อ (SUMMARY)</h2>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-pink-200 shadow-sm">
            <p className={showFullSummary ? '' : 'line-clamp-3'}>
              {comic.synopsis}
            </p>
            <button
              onClick={() => setShowFullSummary(!showFullSummary)}
              className="mt-2 text-xs text-[#db2777] hover:text-[#be185d] font-bold flex items-center gap-1 mx-auto"
            >
              <span>{showFullSummary ? 'ย่อเรื่องย่อ ▲' : 'อ่านเรื่องย่อฉบับเต็ม ▼'}</span>
            </button>
          </div>
        </section>

        {/* 6. LATEST MANGA RELEASES Section */}
        <section className="pt-4">
          <div className="flex items-center justify-between border-b border-pink-200 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#f472b6] font-bold">★</span>
              <h2 className="text-sm font-bold tracking-wider uppercase text-slate-900">รายชื่อตอนทั้งหมด (CHAPTER LIST)</h2>
            </div>
            <button
              onClick={() => setIsAscending(!isAscending)}
              className="text-[#db2777] hover:text-[#be185d] p-1 flex items-center gap-1 text-xs font-semibold"
              title="สลับลำดับตอน"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>{isAscending ? 'ตอนเก่าสุดก่อน' : 'ตอนล่าสุดก่อน'}</span>
            </button>
          </div>

          {/* Season Accordion Bar with Search Box */}
          <div className="bg-white border border-pink-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-pink-50 border-b border-pink-200">
              <button
                onClick={() => setIsSeasonOpen(!isSeasonOpen)}
                className="flex items-center justify-between sm:justify-start gap-2 text-xs font-bold text-slate-900"
              >
                <span>ซีซั่น 1 (รวม {comic.chapters.length} ตอน • ไร้ตอนซ้ำ)</span>
                <span className="text-pink-600 font-bold">{isSeasonOpen ? '—' : '+'}</span>
              </button>

              {/* Quick Chapter Search Box */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={chapterFilter}
                  onChange={(e) => setChapterFilter(e.target.value)}
                  placeholder="ค้นหาตอน เช่น 1, 50, 320..."
                  className="px-2.5 py-1 text-xs bg-white border border-pink-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 w-44"
                />
                {chapterFilter && (
                  <button
                    onClick={() => setChapterFilter('')}
                    className="text-[10px] text-pink-600 font-bold hover:underline"
                  >
                    ล้าง
                  </button>
                )}
              </div>
            </div>

            {isSeasonOpen && (
              <div className="divide-y divide-pink-100 max-h-[500px] overflow-y-auto">
                {sortedChapters.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    ไม่พบตอนที่ตรงกับ "{chapterFilter}"
                  </div>
                ) : (
                  sortedChapters.map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => onSelectChapter(ch)}
                    className="px-4 py-3 hover:bg-pink-50/60 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-[#db2777] transition-colors">
                        {ch.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {ch.publishedAt}
                      </div>
                    </div>

                    {(ch.publishedAt.includes('NEW') || ch.publishedAt.includes('อัปเดต') || ch.chapterNumber >= 100) && (
                      <span className="bg-[#ef4444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        NEW
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          </div>
        </section>

        {/* 7. MANGA DISCUSSION Section */}
        <section className="pt-4 pb-16">
          <div className="flex items-center gap-2 border-b border-pink-200 pb-2 mb-3">
            <span className="text-[#f472b6] font-bold">★</span>
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-900">ความคิดเห็นนักอ่าน (DISCUSSION)</h2>
          </div>

          <div className="bg-white border border-pink-200 rounded-2xl p-4 text-center text-xs text-slate-600 shadow-sm">
            <p>ร่วมพูดคุย แสดงความคิดเห็นเกี่ยวกับเรื่องนี้</p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="เขียนความคิดเห็นของคุณ..."
                className="flex-1 px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#f472b6]"
              />
              <button 
                onClick={() => setCommentCount(c => c + 1)}
                className="px-5 py-2 bg-[#f472b6] hover:bg-[#fb7185] text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                ส่ง
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
