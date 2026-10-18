import React from 'react';
import { Star, Flame, Clock } from 'lucide-react';
import { Comic } from '../types/comic';
import { isComicUpdatedToday } from '../utils/chapterGenerator';

interface ComicCardProps {
  comic: Comic;
  onSelect: (comic: Comic) => void;
  onStartReading: (comic: Comic) => void;
}

export const ComicCard: React.FC<ComicCardProps> = ({
  comic,
  onSelect,
}) => {
  const isQuarantined = comic.status === 'quarantined';
  const latestChapter = comic.chapters[0];
  const typeTag = comic.genres.includes('Manhua') ? 'MANHUA' 
    : comic.genres.includes('Manhwa') ? 'MANHWA' 
    : 'MANGA';
  const updatedToday = isComicUpdatedToday(comic);

  return (
    <div 
      onClick={() => onSelect(comic)}
      className="group flex flex-col cursor-pointer transition-transform duration-200 active:scale-[0.98]"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-pink-100 shadow-sm border border-pink-100">
        <img
          src={comic.coverImage}
          alt={comic.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top-Left Category Tag (Pastel Pink) */}
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-[#f472b6]/95 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow tracking-wider uppercase">
            {typeTag}
          </span>
        </div>

        {/* Top-Right Updated Today Badge */}
        {updatedToday && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white/40">
              <Flame className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300" />
              <span>อัปเดตวันนี้</span>
            </span>
          </div>
        )}

        {/* Bottom-Right Chapter Pill (Pastel Rose) */}
        {latestChapter && (
          <div className="absolute bottom-2 right-2 z-10">
            <span className="bg-[#db2777]/95 text-white font-bold text-[11px] px-2.5 py-0.5 rounded shadow">
              Chapter {latestChapter.chapterNumber}
            </span>
          </div>
        )}

        {/* DMCA Quarantine Banner */}
        {isQuarantined && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-2 text-center z-20">
            <span className="text-rose-400 font-bold text-xs bg-rose-950/80 px-2.5 py-1 rounded border border-rose-600">
              ระงับสิทธิ์ชั่วคราว
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="pt-2 flex flex-col gap-1">
        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#db2777] transition-colors line-clamp-2 leading-snug">
          {comic.title}
        </h3>

        {/* 5 Pastel Pink Stars + Rating Number */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center text-[#f472b6]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-[#f472b6] text-[#f472b6]"
              />
            ))}
          </div>
          <span className="text-slate-700 font-bold font-mono text-xs">{comic.rating}</span>
        </div>

        {/* Bottom Episode Strip */}
        {latestChapter && (
          <div className="flex flex-col gap-0.5 pt-0.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="bg-pink-50 text-[#db2777] border border-pink-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                ตอนที่ {latestChapter.chapterNumber}
              </span>
              <span className="bg-[#ef4444] text-white text-[9px] font-bold px-1 rounded uppercase tracking-wider">
                NEW
              </span>
            </div>
            {(comic.lastChapterUpdatedText || latestChapter.publishedAt) && (
              <span className="text-[10px] text-pink-600/90 font-medium truncate flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 flex-shrink-0 text-pink-400" />
                <span className="truncate">{comic.lastChapterUpdatedText || latestChapter.publishedAt}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
