import React from 'react';
import { Star, Eye, BookOpen, Lock, Sparkles, Volume2, Music, ArrowRight } from 'lucide-react';
import { Comic, Chapter } from '../types/comic';

interface ComicDetailModalProps {
  comic: Comic | null;
  onClose: () => void;
  onSelectChapter: (comic: Comic, chapter: Chapter) => void;
  userCoins: number;
  onOpenCoinModal: () => void;
}

export const ComicDetailModal: React.FC<ComicDetailModalProps> = ({
  comic,
  onClose,
  onSelectChapter,
  userCoins,
  onOpenCoinModal,
}) => {
  if (!comic) return null;

  const isQuarantined = comic.status === 'quarantined';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cover Header Split */}
        <div className="relative p-6 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800 flex flex-col sm:flex-row gap-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors z-10"
          >
            ✕
          </button>

          {/* Cover Art */}
          <img
            src={comic.coverImage}
            alt={comic.title}
            className="w-28 sm:w-36 aspect-[3/4] object-cover rounded-xl shadow-lg border border-slate-800 shrink-0 mx-auto sm:mx-0"
          />

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>{comic.genres.join(' · ')}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-amber-300 font-mono">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {comic.rating}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                {comic.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{comic.originalTitle}</p>

              <p className="text-xs text-slate-300 mt-2.5 line-clamp-3 leading-relaxed">
                {comic.synopsis}
              </p>
            </div>

            {/* AI Features Badge Bar */}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded text-rose-300">
                <Sparkles className="w-3 h-3 text-rose-400" /> แปลไทยอัตโนมัติ 5 ภาษา
              </span>
              <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded text-amber-300">
                <Volume2 className="w-3 h-3 text-amber-400" /> พากย์เสียงตัวละครตามอารมณ์
              </span>
              <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded text-emerald-300">
                <Music className="w-3 h-3 text-emerald-400" /> ดนตรีประกอบสดตามฉาก
              </span>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              รายการตอนทั้งหมด ({comic.chapters.length} ตอน)
            </h3>
            {isQuarantined && (
              <span className="text-xs text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                เนื้อหาถูกระงับชั่วคราวตามมาตรการ DMCA
              </span>
            )}
          </div>

          {isQuarantined ? (
            <div className="p-6 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
              <p className="text-sm font-semibold text-rose-300">เรื่องนี้ถูกระงับการเข้าถึงชั่วคราว</p>
              <p className="text-xs text-slate-500 mt-1">
                เนื่องจากอยู่ระหว่างการตรวจสอบหนังสือแจ้งเตือนลิขสิทธิ์จากผู้ถือสิทธิ์ตามกฎหมายไทย
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {comic.chapters.map((ch) => {
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      onSelectChapter(comic, ch);
                    }}
                    className="p-3.5 rounded-xl border border-pink-200 bg-white hover:bg-pink-50 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-[#db2777] transition-colors flex items-center gap-2">
                        <span>{ch.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{ch.publishedAt}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="px-3.5 py-1.5 rounded-lg bg-[#f472b6] hover:bg-[#db2777] text-white text-xs font-semibold flex items-center gap-1 shadow transition-colors">
                        <BookOpen className="w-3 h-3" />
                        <span>อ่านฟรี</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
