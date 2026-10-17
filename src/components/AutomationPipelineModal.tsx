import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Clock, Play, BookOpen, RefreshCw } from 'lucide-react';
import { PipelineJob } from '../types/comic';

interface AutomationPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerPublish: (newChapter: any) => void;
}

export const AutomationPipelineModal: React.FC<AutomationPipelineModalProps> = ({
  isOpen,
  onClose,
  onTriggerPublish,
}) => {
  const [pipelineJobs, setPipelineJobs] = useState<PipelineJob[]>([
    {
      id: 'pipe-01',
      comicTitle: 'Overlord of Insects (ราชาแมลงผู้เรียกภัยพิบัติจากธรรมชาติ)',
      chapterNum: 113,
      source: 'คลาวด์การ์ตูนความเร็วสูง (ไร้โฆษณาแทรก)',
      status: 'published',
      ocrConfidence: 99.2,
      translatedBubbles: 28,
      timestamp: 'เพิ่งอัปเดตอัตโนมัติ',
    },
    {
      id: 'pipe-02',
      comicTitle: 'Isekai kara Elf-san ga Ochite Kita no desu ga!',
      chapterNum: 3,
      source: 'ระบบสตรีมมิ่งอัตโนมัติ 24 ชม.',
      status: 'published',
      ocrConfidence: 98.7,
      translatedBubbles: 24,
      timestamp: '5 นาทีที่แล้ว',
    },
    {
      id: 'pipe-03',
      comicTitle: 'Shadow Monarch (그림자 군주)',
      chapterNum: 48,
      source: 'ระบบคัดกรองการ์ตูนแท้ 100%',
      status: 'published',
      ocrConfidence: 98.4,
      translatedBubbles: 32,
      timestamp: '18 นาทีที่แล้ว',
    },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [stats] = useState({
    totalChapters: 184,
    filteredDuplicates: 142,
    activeSources: 'ระบบสแกนและคัดกรองภาพการ์ตูนแท้ความละเอียดสูง (ไร้โฆษณาแทรก 100%)',
  });

  if (!isOpen) return null;

  const handleSimulateSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const newJob: PipelineJob = {
        id: `pipe-${Date.now().toString().slice(-4)}`,
        comicTitle: 'Overlord of Insects (ราชาแมลงผู้เรียกภัยพิบัติจากธรรมชาติ)',
        chapterNum: 114,
        source: 'คลาวด์การ์ตูนความเร็วสูง (ไร้โฆษณาแทรก)',
        status: 'published',
        ocrConfidence: 99.5,
        translatedBubbles: 30,
        timestamp: 'เพิ่งอัปเดต (ระบบอัตโนมัติ)',
      };
      setPipelineJobs((prev) => [newJob, ...prev]);
      onTriggerPublish(newJob);
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#1a1a1a] border border-purple-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#52227d] flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-sm font-bold">ระบบค้นหาและอัปเดตการ์ตูนอัตโนมัติ 24 ชั่วโมง</h2>
              <p className="text-[11px] text-purple-200">
                ทำงานตลอดเวลาโดยไม่ต้องรอคำสั่ง พร้อมระบบกรองตอนที่ซ้ำกันอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Real-time Status Card */}
          <div className="p-4 rounded-xl bg-[#241b35] border border-purple-900/60 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">สถานะการทำงาน: กำลังอัปเดตอัตโนมัติ (Auto-Pilot)</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                ตรวจจับตอนใหม่จาก: <span className="text-purple-300">{stats.activeSources}</span>
              </p>
            </div>
            <button
              onClick={handleSimulateSyncNow}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังดึงตอนใหม่...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>ดึงตอนใหม่ทันที</span>
                </>
              )}
            </button>
          </div>

          {/* Deduplication Metric */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-[#161616] border border-slate-800 rounded-xl">
              <div className="text-[11px] text-slate-400">ตอนทั้งหมดที่อัปเดตแล้ว</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">{stats.totalChapters} ตอน</div>
            </div>
            <div className="p-3 bg-[#161616] border border-purple-900/40 rounded-xl">
              <div className="text-[11px] text-purple-300">กรองตอนที่ซ้ำกันออก</div>
              <div className="text-xl font-bold text-purple-400 font-mono mt-0.5">{stats.filteredDuplicates} ตอน</div>
            </div>
          </div>

          {/* List of Recent Automatic Updates */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              รายการตอนล่าสุดที่ระบบแปลและลงให้อัตโนมัติ
            </h3>
            <div className="space-y-2">
              {pipelineJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-xl bg-[#161616] border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{job.comicTitle}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ตอนที่ {job.chapterNum} · ต้นทาง: {job.source}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{job.timestamp}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                      พร้อมอ่าน
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#141414] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
