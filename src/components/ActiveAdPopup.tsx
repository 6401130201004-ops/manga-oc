import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Sparkles, Clock } from 'lucide-react';
import { AdCampaign } from '../types/comic';
import { getActiveAds } from '../services/adService';

export const ActiveAdPopup: React.FC = () => {
  const [activeAd, setActiveAd] = useState<AdCampaign | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const ads = getActiveAds();
    if (ads.length > 0) {
      // Pick the most recently activated ad
      setActiveAd(ads[0]);
    }
  }, []);

  if (!activeAd || isDismissed) return null;

  // Calculate days remaining
  const calculateDaysLeft = () => {
    if (!activeAd.expiresAt) return activeAd.durationDays || 7;
    const diff = new Date(activeAd.expiresAt).getTime() - Date.now();
    return Math.max(1, Math.ceil(diff / 86400000));
  };

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-xs sm:max-w-sm w-[90%] bg-white/95 backdrop-blur-md rounded-2xl border-2 border-pink-300 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
      {/* Top Banner Header */}
      <div className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>สปอนเซอร์แนะนำ</span>
          <span className="text-[10px] font-normal opacity-90">
            (เหลืออีก {calculateDaysLeft()} วัน)
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-white/80 hover:text-white transition-colors"
          title="ปิดชั่วคราว"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Ad Image / Popup Content */}
      <div className="p-2.5 space-y-2">
        <a
          href={activeAd.targetUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          {activeAd.popupImage ? (
            <img
              src={activeAd.popupImage}
              alt={activeAd.jobName}
              className="w-full h-auto max-h-40 object-cover rounded-xl border border-pink-100 group-hover:opacity-95 transition-opacity"
            />
          ) : (
            <div className="p-4 bg-pink-50 rounded-xl text-center">
              <p className="text-xs font-black text-slate-800">{activeAd.jobName}</p>
            </div>
          )}
        </a>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span className="truncate max-w-[180px] font-medium">{activeAd.jobName}</span>
          <a
            href={activeAd.targetUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#db2777] hover:underline font-bold flex items-center gap-0.5"
          >
            <span>ดูข้อมูล</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
