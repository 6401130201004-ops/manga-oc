import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Lock, EyeOff, Send } from 'lucide-react';
import { Comic } from '../types/comic';

interface DMCAPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  comics: Comic[];
  onQuarantineComic: (comicId: string) => void;
}

export const DMCAPortalModal: React.FC<DMCAPortalModalProps> = ({
  isOpen,
  onClose,
  comics,
  onQuarantineComic,
}) => {
  const [complainantName, setComplainantName] = useState('');
  const [complainantEmail, setComplainantEmail] = useState('');
  const [selectedComicId, setSelectedComicId] = useState(comics[0]?.id || '');
  const [workTitle, setWorkTitle] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [statement, setStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedComic = comics.find((c) => c.id === selectedComicId);

    try {
      const response = await fetch('/api/dmca/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complainantName,
          complainantEmail,
          comicId: selectedComicId,
          comicTitle: selectedComic?.title || 'Unknown Comic',
          workTitle,
          evidenceUrl,
          statement,
        }),
      });
      const data = await response.json();
      setResult(data.report);
      onQuarantineComic(selectedComicId);
    } catch (err) {
      // Fallback local instant takedown
      const mockReport = {
        id: `DMCA-${Date.now().toString().slice(-6)}`,
        comicTitle: selectedComic?.title,
        actionTaken: 'ซ่อนเนื้อหาและระงับการเข้าถึงชั่วคราวเรียบร้อยแล้ว ตามขั้นตอนการคุ้มครองลิขสิทธิ์',
        legalSummaryTh: `รับแจ้งเรื่องจาก ${complainantName} ได้ดำเนินการปิดกั้นการเข้าถึงตอนการ์ตูน "${selectedComic?.title}" เรียบร้อยแล้ว`,
        replyLetterTh: `เรียน คุณ ${complainantName},\n\nศูนย์รับเรื่องลิขสิทธิ์ manga-oc ได้รับหนังสือแจ้งเตือนเรื่องการละเมิดลิขสิทธิ์ในผลงาน "${workTitle}" ของท่านเรียบร้อยแล้ว และได้ดำเนินการระงับการเผยแพร่ออกจากระบบทันที\n\nสถานะ: ปิดกั้นเนื้อหาเรียบร้อยแล้ว`,
      };
      setResult(mockReport);
      onQuarantineComic(selectedComicId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-pink-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header (Pastel Pink) */}
        <div className="px-6 py-4 bg-[#f472b6] flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ศูนย์รับแจ้งเรื่องลิขสิทธิ์ manga-oc</h2>
              <p className="text-xs text-pink-100">
                เคารพในสิทธิ์ของเจ้าของผลงาน และระงับการเผยแพร่อย่างรวดเร็ว
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white text-slate-800">
          {result ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">ระงับการเผยแพร่เนื้อหาเรียบร้อยแล้ว</h4>
                  <p className="text-xs text-emerald-700 mt-1">{result.actionTaken}</p>
                </div>
              </div>

              {/* Confirmation notice box */}
              <div className="p-4 rounded-2xl bg-[#fff5f7] border border-pink-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 border-b border-pink-200 pb-2">
                  <span className="font-semibold text-slate-800">บันทึกข้อความตอบกลับถึงเจ้าของลิขสิทธิ์</span>
                  <span className="font-mono text-[#db2777] font-bold">ID: {result.id}</span>
                </div>
                <pre className="text-xs font-sans whitespace-pre-wrap text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-pink-100">
                  {result.replyLetterTh}
                </pre>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#db2777] text-xs font-semibold rounded-xl border border-pink-200 transition-colors"
                >
                  ยื่นคำร้องฉบับใหม่
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-[#f472b6] hover:bg-[#fb7185] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 bg-pink-50 border border-pink-200 rounded-2xl text-xs text-slate-700 flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-[#db2777] shrink-0" />
                <span>
                  manga-oc ให้ความสำคัญและเคารพในทรัพย์สินทางปัญญา เมื่อได้รับข้อมูลที่มีมูล ระบบจะซ่อนเนื้อหาออกจากแพลตฟอร์มทันที
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล / บริษัทเจ้าของลิขสิทธิ์ *
                  </label>
                  <input
                    type="text"
                    required
                    value={complainantName}
                    onChange={(e) => setComplainantName(e.target.value)}
                    placeholder="เช่น สำนักพิมพ์ หรือ ผู้ถือครองลิขสิทธิ์"
                    className="w-full px-3.5 py-2.5 bg-pink-50/30 border border-pink-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#f472b6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมลติดต่อกลับสำหรับรับหนังสือยืนยัน *
                  </label>
                  <input
                    type="email"
                    required
                    value={complainantEmail}
                    onChange={(e) => setComplainantEmail(e.target.value)}
                    placeholder="legal@rightsholder.com"
                    className="w-full px-3.5 py-2.5 bg-pink-50/30 border border-pink-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#f472b6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลือกเรื่องที่ต้องการให้ระงับการเผยแพร่ *
                  </label>
                  <select
                    value={selectedComicId}
                    onChange={(e) => setSelectedComicId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-pink-50/30 border border-pink-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#f472b6]"
                  >
                    {comics.map((comic) => (
                      <option key={comic.id} value={comic.id}>
                        {comic.title} {comic.status === 'quarantined' ? '(ระงับอยู่แล้ว)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อผลงานต้นฉบับที่มีลิขสิทธิ์ถูกต้อง *
                  </label>
                  <input
                    type="text"
                    required
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                    placeholder="ชื่อผลงานต้นฉบับ"
                    className="w-full px-3.5 py-2.5 bg-pink-50/30 border border-pink-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#f472b6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ลิงก์หลักฐานการเป็นเจ้าของลิขสิทธิ์ / ลิงก์ต้นฉบับ *
                </label>
                <input
                  type="url"
                  required
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://... ลิงก์หน้าผลงานทางการ หรือ เอกสารสิทธิ์"
                  className="w-full px-3.5 py-2.5 bg-pink-50/30 border border-pink-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำประกาศยืนยัน *
                </label>
                <textarea
                  rows={3}
                  required
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="ข้าพเจ้าขอรับรองว่าเป็นเจ้าของลิขสิทธิ์หรือตัวแทนที่ได้รับมอบอำนาจอย่างถูกต้อง..."
                  className="w-full px-3.5 py-2.5 bg-pink-50/30 border border-pink-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#f472b6] resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                  <span>ระบบจะสั่งซ่อนเนื้อหาทันทีเพื่อคุ้มครองสิทธิ์</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#f472b6] hover:bg-[#fb7185] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'กำลังดำเนินการ...' : 'ส่งคำร้องแจ้งระงับเนื้อหา'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
