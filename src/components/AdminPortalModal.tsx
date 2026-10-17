import React, { useState, useEffect } from 'react';
import { 
  X, Lock, ShieldCheck, CheckCircle2, Clock, 
  Trash2, Play, Sparkles, AlertCircle, Megaphone, Coffee, RefreshCw
} from 'lucide-react';
import { AdCampaign, Comic } from '../types/comic';
import { getStoredAdCampaigns, saveAdCampaigns } from '../services/adService';
import { generateProfessionalContinuousChapter, getAiWriterLogs, getCreditResetStatus, AiWriterLog } from '../services/aiWriterService';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  comics: Comic[];
  onComicsUpdated: (comics: Comic[]) => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  comics,
  onComicsUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('mangaoc_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard Data
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>([]);
  const [aiLogs, setAiLogs] = useState<AiWriterLog[]>([]);
  const [selectedComicForAi, setSelectedComicForAi] = useState<string>(comics[0]?.id || '');
  const [aiStatusMessage, setAiStatusMessage] = useState<string>('');
  const [isAiWriting, setIsAiWriting] = useState<boolean>(false);
  const [creditSecondsLeft, setCreditSecondsLeft] = useState<number>(90);

  // Load campaigns, logs, and credit timer
  useEffect(() => {
    if (isOpen) {
      setAdCampaigns(getStoredAdCampaigns());
      setAiLogs(getAiWriterLogs());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    const interval = setInterval(() => {
      const status = getCreditResetStatus();
      const diff = Math.max(0, Math.floor((status.nextResetTime - Date.now()) / 1000));
      setCreditSecondsLeft(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  // Handle Login with Admin281239
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Admin281239') {
      setIsAuthenticated(true);
      sessionStorage.setItem('mangaoc_admin_auth', 'true');
      setAuthError('');
      setAdCampaigns(getStoredAdCampaigns());
      setAiLogs(getAiWriterLogs());
    } else {
      setAuthError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mangaoc_admin_auth');
    setPasswordInput('');
  };

  // Remove / Unpublish Ad
  const handleRemoveAd = (adId: string) => {
    const updated = adCampaigns.map((ad) => {
      if (ad.id === adId) {
        return { ...ad, status: 'expired' as const };
      }
      return ad;
    });
    setAdCampaigns(updated);
    saveAdCampaigns(updated);
  };

  // Trigger AI Daily Writer for chosen comic
  const handleTriggerAiWriter = () => {
    const targetComic = comics.find((c) => c.id === selectedComicForAi) || comics[0];
    if (!targetComic) return;

    setIsAiWriting(true);
    setAiStatusMessage(`AI กำลังสร้างสรรค์และวาดตอนใหม่ต่อเนื่องสำหรับ "${targetComic.title}" (จำนวน 9 หน้า)...`);

    setTimeout(() => {
      const { updatedComic, newLog } = generateProfessionalContinuousChapter(targetComic);
      const updatedComicsList = comics.map((c) => (c.id === updatedComic.id ? updatedComic : c));
      onComicsUpdated(updatedComicsList);
      setAiLogs([newLog, ...aiLogs]);
      setIsAiWriting(false);
      setAiStatusMessage(`✨ สำเร็จ! AI เขียน "${newLog.chapterTitle}" (9 หน้า) เผยแพร่แล้ว`);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border-2 border-pink-200 shadow-2xl flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold text-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                ระบบจัดการผู้ดูแลระบบ (Admin Portal)
              </h2>
              <p className="text-[11px] text-pink-300">
                manga-oc • ติดตาม AI จัดการโฆษณาอัตโนมัติ & ควบคุม AI เขียนตอนต่อเนื่อง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {!isAuthenticated ? (
            /* Login Form with Secret Admin281239 Password */
            <div className="max-w-sm mx-auto text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-pink-100 text-[#db2777] mx-auto flex items-center justify-center shadow-sm">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">
                  เข้าสู่ระบบแอดมิน manga-oc
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  กรุณากรอกรหัสผ่านผู้ดูแลระบบ
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3 pt-2 text-left">
                <div>
                  <input
                    type="password"
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="รหัสผ่านแอดมิน (Admin...)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f472b6] bg-pink-50/20"
                  />
                  {authError && (
                    <p className="text-xs text-rose-500 font-bold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{authError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#db2777] hover:bg-[#be185d] text-white font-bold text-xs shadow-md transition-transform active:scale-95"
                >
                  เข้าสู่ระบบ
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Dashboard */
            <div className="space-y-6">
              {/* Top Admin Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-pink-50/80 rounded-2xl border border-pink-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-700">
                    สถานะแอดมิน: <span className="text-[#db2777]">ยืนยันตัวตนเรียบร้อย</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600">
                    โฆษณาในคิว AI: <b className="text-slate-900">{adCampaigns.length}</b> รายการ
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </div>

              {/* Section 1: AI Autonomous Daily Writer Status & Controls */}
              <div className="p-4 rounded-2xl border border-pink-200 bg-gradient-to-b from-white to-pink-50/60 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#db2777]" />
                    <span>ระบบ AI เขียนการ์ตูนมืออาชีพต่อเนื่อง (เขียน 1 ตอน = 9 หน้าเต็ม)</span>
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>รีเซ็ตเครดิตใน: {creditSecondsLeft} วินาที</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  AI ทำงานอัตโนมัติตลอดเวลา: สร้างพล็อตเรื่องเอง วาดภาพสไตล์มังงะโคลน แต่งบทพูดภาษาไทย พร้อมแปล 4 ภาษา และเขียนตอนใหม่ทุกครั้งที่เครดิตรีเซ็ตอย่างต่อเนื่อง
                </p>

                {/* Instant Trigger for Admin */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <select
                    value={selectedComicForAi}
                    onChange={(e) => setSelectedComicForAi(e.target.value)}
                    className="w-full sm:flex-1 py-2 px-3 rounded-xl border border-pink-200 text-xs bg-white font-semibold text-slate-800"
                  >
                    {comics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (ปัจจุบันมี {c.chapters.length} ตอน)
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleTriggerAiWriter}
                    disabled={isAiWriting}
                    className="w-full sm:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isAiWriting ? 'กำลังเขียนและวาด...' : 'ให้ AI เขียนตอนใหม่ต่อเนื่องทันที (9 หน้า)'}</span>
                  </button>
                </div>

                {aiStatusMessage && (
                  <div className="p-2.5 rounded-xl bg-pink-100/70 text-xs text-[#db2777] font-semibold animate-in fade-in">
                    {aiStatusMessage}
                  </div>
                )}

                {/* Recent AI Generation Logs */}
                {aiLogs.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-pink-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ประวัติการเขียนตอนต่อเนื่องของ AI:</span>
                    <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] text-slate-600">
                      {aiLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="p-1.5 bg-white rounded-lg border border-pink-100 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800">{log.comicTitle}</span>
                            <span className="text-pink-600 font-semibold ml-1.5">{log.chapterTitle}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{log.createdAt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: AI Autonomous Ad Queue Monitor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-pink-200 pb-2">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#db2777]" />
                    <span>คิวโฆษณาที่ AI จัดการอัตโนมัติ (ไม่ต้องรออนุมัติ)</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-[#db2777]">
                      {adCampaigns.filter((a) => a.status === 'active').length} งานกำลังแสดงผล
                    </span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {adCampaigns.map((ad) => {
                    const isActive = ad.status === 'active';
                    return (
                      <div
                        key={ad.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isActive
                            ? 'border-emerald-300 bg-emerald-50/30 shadow-sm'
                            : 'border-slate-200 bg-slate-50 opacity-70'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="space-y-1 max-w-md">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isActive ? '🟢 AI เปิดแสดงผลอยู่' : '⚪ ครบกำหนดเวลาแล้ว'}
                              </span>
                              <span className="text-xs font-black text-slate-800 truncate">
                                {ad.jobName}
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 space-y-0.5">
                              <div>ผู้เสนอ: <b>{ad.advertiserName}</b> ({ad.advertiserContact})</div>
                              <div>ระยะเวลาเผยแพร่ที่ AI จัดสรร: <b>{ad.durationDays} วัน</b></div>
                              {ad.aiScreeningNotes && (
                                <div className="text-[11px] text-emerald-700 font-semibold">
                                  {ad.aiScreeningNotes}
                                </div>
                              )}
                              {ad.expiresAt && isActive && (
                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>ปลดออกอัตโนมัติวันที่: {new Date(ad.expiresAt).toLocaleDateString('th-TH')}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Thumbnail & Actions */}
                          <div className="flex items-center gap-2">
                            {ad.popupImage && (
                              <img
                                src={ad.popupImage}
                                alt="Popup"
                                className="w-16 h-12 object-cover rounded-lg border border-pink-200"
                              />
                            )}
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5">
                              <button
                                onClick={() => {
                                  const updated = adCampaigns.map((a) => {
                                    if (a.id === ad.id) {
                                      return {
                                        ...a,
                                        status: 'active' as const,
                                        expiresAt: new Date(Date.now() + (a.durationDays || 7) * 86400000).toISOString(),
                                      };
                                    }
                                    return a;
                                  });
                                  setAdCampaigns(updated);
                                  saveAdCampaigns(updated);
                                  alert(`ยืนยันค่าจ้าง "${ad.jobName}" เรียบร้อยแล้ว ดำเนินการเผยแพร่ต่อเนื่องทันที`);
                                }}
                                className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-95 whitespace-nowrap"
                                title="กดยืนยันค่าจ้างและดำเนินการต่อ"
                              >
                                กดยืนยันค่าจ้าง และดำเนินการต่อ
                              </button>
                              {isActive && (
                                <button
                                  onClick={() => handleRemoveAd(ad.id)}
                                  className="py-1.5 px-3 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold"
                                  title="ปลดโฆษณานี้ออกทันที"
                                >
                                  ปลดออก
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Reader Coffee Support Tips Overview */}
              <div className="p-3.5 bg-pink-50 rounded-2xl border border-pink-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#db2777]">
                  <Coffee className="w-4 h-4" />
                  <span>ระบบรับเงินสนับสนุนค่ากาแฟ (PromptPay QR Code ท้ายเรื่อง)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  นักอ่านสแกน PromptPay QR Code ท้ายเรื่องการ์ตูนทุกตอนโดยตรง ไม่มีการแสดงหมายเลขโทรศัพท์ บัญชี หรือภาษาโปรแกรมเมอร์ในระบบ
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
