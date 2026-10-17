import React, { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, ChevronDown, ChevronUp, ShieldCheck, 
  Cpu, Activity, Zap, Layers, CheckCircle2
} from 'lucide-react';
import { aiAutonomousBrain, AiBrainLog } from '../services/aiAutonomousBrain';

export const AiAutonomousBrainWidget: React.FC = () => {
  const [logs, setLogs] = useState<AiBrainLog[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = aiAutonomousBrain.subscribe((updatedLogs) => {
      setLogs([...updatedLogs]);
    });
    return () => unsubscribe();
  }, []);

  const latestLog = logs[0] || {
    category: 'development',
    action: 'AI กำลังทำงานอัตโนมัติ 24 ชั่วโมง',
    detail: 'คัดกรองเฉพาะหน้าการ์ตูนแท้ ไร้โฆษณาแทรก 100% พร้อมครอบทับระบบสไลด์และเสียงอ่านอัจฉริยะ',
    timestamp: 'กำลังดำเนินการ',
  };

  const getCategoryBadge = (cat: AiBrainLog['category']) => {
    switch (cat) {
      case 'analysis':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">📊 วิเคราะห์ความนิยม</span>;
      case 'development':
        return <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">⚡ พัฒนาเว็บไซต์</span>;
      case 'content':
        return <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#db2777] font-bold text-[10px]">📖 จัดการเนื้อหา</span>;
      case 'security':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">🛡️ คัดกรองปลอดภัย</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px]">🧠 วางแผนล่วงหน้า</span>;
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-purple-50 via-white to-pink-50 rounded-2xl border-2 border-purple-200/80 shadow-sm p-3.5 space-y-2 text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Brain className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800 text-sm">
                AI Autonomous Brain 24 ชั่วโมง
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>กำลังคิดและพัฒนาเว็บอัตโนมัติ</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              ไม่ต้องรอคำสั่ง • วิเคราะห์ผู้อ่าน คัดกรองเฉพาะหน้าการ์ตูนแท้ ตัดโฆษณาต้นทางออก 100%
            </p>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            Active Intelligence Engine
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 font-bold text-[11px] flex items-center gap-1 transition-all shadow-2xs"
          >
            <span>{isExpanded ? 'ย่อบันทึก' : 'ดูสิ่งที่ AI กำลังคิด'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Active Thought Ticker */}
      <div className="p-2.5 bg-white/90 rounded-xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          {getCategoryBadge(latestLog.category)}
          <span className="font-bold text-slate-800 truncate">
            {latestLog.action}:
          </span>
          <span className="text-slate-600 truncate text-[11px]">
            {latestLog.detail}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
          {latestLog.timestamp}
        </span>
      </div>

      {/* Expanded Thought Log */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-purple-100 space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
            <span>ประวัติการคิด วิเคราะห์ และพัฒนาเว็บของ AI (ทำงานต่อเนื่อง):</span>
            <span className="text-purple-600">{logs.length} การกระทำล่าสุด</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-2 bg-white rounded-lg border border-purple-50 flex items-center justify-between gap-2 text-[11px]"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {getCategoryBadge(log.category)}
                  <span className="font-semibold text-slate-800 truncate">
                    {log.action}
                  </span>
                  <span className="text-slate-500 truncate hidden sm:inline">
                    - {log.detail}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0 font-mono">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
