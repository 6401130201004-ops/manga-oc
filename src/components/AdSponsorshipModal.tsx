import React, { useState } from 'react';
import { 
  X, Sparkles, ShieldCheck, CheckCircle2, 
  Send, Image as ImageIcon, Clock, Megaphone
} from 'lucide-react';
import { generateAiPopupBanner, submitAndAutoScheduleAd } from '../services/adService';
import { AdCampaign } from '../types/comic';

interface AdSponsorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdSubmitted?: (ad: AdCampaign) => void;
}

export const AdSponsorshipModal: React.FC<AdSponsorshipModalProps> = ({
  isOpen,
  onClose,
  onAdSubmitted,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');

  // Form fields as requested: Normal proposal, no rigid budget requirement
  const [jobName, setJobName] = useState('');
  const [advertiserName, setAdvertiserName] = useState('');
  const [advertiserContact, setAdvertiserContact] = useState('');
  const [popupImage, setPopupImage] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [proposedOffer, setProposedOffer] = useState('');

  // AI Generation State
  const [isGeneratingAiPopup, setIsGeneratingAiPopup] = useState(false);
  const [aiTagline, setAiTagline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAdInfo, setSubmittedAdInfo] = useState<any>(null);

  if (!isOpen) return null;

  // Handle AI Auto-generation of Popup Banner
  const handleGenerateAiPopup = () => {
    if (!jobName.trim()) {
      alert('กรุณากรอก "ชื่องาน" ก่อน เพื่อให้ AI สร้างป๊อบอัพที่ตรงกับสินค้าหรือบริการของคุณ');
      return;
    }
    setIsGeneratingAiPopup(true);
    setTimeout(() => {
      const generatedSvg = generateAiPopupBanner(
        jobName, 
        aiTagline || 'ข้อเสนอพิเศษสุดสำหรับแฟนมังงะบน manga-oc'
      );
      setPopupImage(generatedSvg);
      setIsGeneratingAiPopup(false);
    }, 500);
  };

  const handleSubmitAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim()) {
      alert('กรุณาระบุชื่องานโฆษณา');
      return;
    }

    setIsSubmitting(true);

    // If no popup banner provided, automatically have AI create one
    let finalPopup = popupImage;
    if (!finalPopup) {
      finalPopup = generateAiPopupBanner(jobName, proposedOffer || 'โปรโมชั่นสุดพิเศษเฉพาะที่ manga-oc');
      setPopupImage(finalPopup);
    }

    setTimeout(() => {
      const result = submitAndAutoScheduleAd({
        jobName,
        advertiserName: advertiserName || 'ผู้เสนอโฆษณา',
        advertiserContact: advertiserContact || 'ไม่ได้ระบุ',
        popupImage: finalPopup,
        targetUrl: targetUrl || 'https://manga-oc.net',
        proposedOffer: proposedOffer || 'ข้อเสนอตามปกติ',
      });

      setIsSubmitting(false);

      if (!result.success) {
        alert(result.message);
        return;
      }

      setSubmittedAdInfo(result);
      if (onAdSubmitted) onAdSubmitted(result.ad);
      setStep('success');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-pink-200 shadow-2xl flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                เสนอโฆษณา / สปอนเซอร์ป๊อบอัพ
              </h2>
              <p className="text-xs text-pink-100 font-medium">
                AI คัดกรองและลงโฆษณาอัตโนมัติทันที • ไม่ต้องรอการอนุมัติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {step === 'form' && (
            <form onSubmit={handleSubmitAd} className="space-y-4">
              {/* Feature Highlights Badge */}
              <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-2xl border border-pink-200 text-xs text-[#db2777]">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">
                  เสนอโฆษณาตามปกติ AI จะคัดกรองเนื้อหา จัดสรรระยะเวลาเผยแพร่ และนำขึ้นแสดงผลในคิวอัตโนมัติ
                </span>
              </div>

              {/* 1. ชื่องาน (Job Name) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. ชื่องาน / หัวข้อแคมเปญโฆษณา <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  placeholder="เช่น โปรโมทร้านกาแฟมังงะ, คอร์สสอนวาดการ์ตูน, สินค้าไลฟ์สไตล์..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f472b6] bg-pink-50/20"
                />
              </div>

              {/* 2. ป๊อบอัพโฆษณา (Popup Banner) */}
              <div className="p-4 rounded-2xl border border-pink-200 bg-pink-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#db2777]" />
                    <span>2. ป๊อบอัพโฆษณา (รูปภาพแบนเนอร์)</span>
                  </label>
                  <span className="text-[11px] text-[#db2777] font-semibold">
                    หากไม่มีรูป ให้ AI สร้างให้อัตโนมัติ ✨
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={popupImage.startsWith('data:') ? '' : popupImage}
                    onChange={(e) => setPopupImage(e.target.value)}
                    placeholder="วางลิงก์รูปภาพป๊อบอัพ (ถ้ามี) หรือกดปุ่มให้ AI สร้างด้านล่าง"
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#f472b6]"
                  />

                  {/* AI Generator Button */}
                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <input
                      type="text"
                      value={aiTagline}
                      onChange={(e) => setAiTagline(e.target.value)}
                      placeholder="คำโปรย เช่น ส่วนลด 20%, ส่งฟรี, กาแฟรสเด็ด"
                      className="w-full sm:flex-1 px-3 py-2 rounded-xl border border-pink-200 text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateAiPopup}
                      disabled={isGeneratingAiPopup}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGeneratingAiPopup ? 'AI กำลังวาดป๊อบอัพ...' : 'ให้ AI สร้างป๊อบอัพให้อัตโนมัติ'}</span>
                    </button>
                  </div>
                </div>

                {/* Popup Preview */}
                {popupImage && (
                  <div className="mt-3 p-2 bg-white rounded-xl border border-pink-200">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">พรีวิวป๊อบอัพที่จะแสดงบนเว็บ:</span>
                      <button
                        type="button"
                        onClick={() => setPopupImage('')}
                        className="text-[10px] text-rose-500 hover:underline font-bold"
                      >
                        ลบรูป
                      </button>
                    </div>
                    <img
                      src={popupImage}
                      alt="Ad Preview"
                      className="w-full max-h-48 object-contain rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* 3. ผู้เสนอโฆษณา & ข้อมูลติดต่อ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อผู้เสนอโฆษณา / แบรนด์
                  </label>
                  <input
                    type="text"
                    value={advertiserName}
                    onChange={(e) => setAdvertiserName(e.target.value)}
                    placeholder="เช่น คุณธนพล (Manga Station)"
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#f472b6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เบอร์โทรติดต่อ / LINE ID
                  </label>
                  <input
                    type="text"
                    value={advertiserContact}
                    onChange={(e) => setAdvertiserContact(e.target.value)}
                    placeholder="เช่น 089-xxx-xxxx หรือ @lineid"
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#f472b6]"
                  />
                </div>
              </div>

              {/* 4. ลิงก์ปลายทาง */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ลิงก์ปลายทางเมื่อคลิก (Target URL)
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://yourwebsite.com หรือลิงก์เพจ/ไลน์ของคุณ"
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#f472b6]"
                />
              </div>

              {/* 5. ข้อเสนอ / รายละเอียดความต้องการ (เสนอตามปกติ ไม่ต้องตั้งงบประมาณตายตัว) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ข้อเสนอ / รายละเอียดเพิ่มเติม (เสนอตามความประสงค์)
                </label>
                <textarea
                  rows={2}
                  value={proposedOffer}
                  onChange={(e) => setProposedOffer(e.target.value)}
                  placeholder="ระบุข้อเสนอหรือความต้องการ เช่น สปอนเซอร์เพื่อโปรโมทร้าน, โฆษณาเปิดตัวสินค้าใหม่ ฯลฯ"
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#f472b6]"
                />
              </div>

              {/* Submit Button (Direct AI Screening & Instant Publishing) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-2xl bg-[#db2777] hover:bg-[#be185d] text-white font-black text-sm shadow-md transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'AI กำลังคัดกรองและจัดคิว...' : 'ส่งข้อเสนอ & ให้ AI ลงโฆษณาอัตโนมัติทันที'}</span>
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  ระบบ AI จะประเมินและจัดคิวการแสดงผลพร้อมกำหนดเวลาสิ้นสุดให้อัตโนมัติ โดยไม่ต้องรอการอนุมัติ
                </p>
              </div>
            </form>
          )}

          {/* Success Step: Direct AI Approval Confirmation */}
          {step === 'success' && submittedAdInfo && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800">
                  AI ลงโฆษณาเรียบร้อยแล้ว!
                </h3>
                <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ผ่านการคัดกรองความปลอดภัยโดย AI 100%</span>
                </p>
              </div>

              <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-200 text-left space-y-2 text-xs text-slate-700 max-w-md mx-auto">
                <div>ชื่องาน: <b className="text-slate-900">{submittedAdInfo.ad.jobName}</b></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#db2777]" />
                  <span>ระยะเวลาแสดงผลที่ AI จัดสรร: <b>{submittedAdInfo.ad.durationDays} วัน</b></span>
                </div>
                <div>สถานะคิว: <span className="font-bold text-emerald-600">ขึ้นแสดงผลบนเว็บไซต์ทันที</span></div>
                <div className="text-[11px] text-slate-400">
                  * เมื่อครบกำหนดเวลา ระบบ AI จะปลดโฆษณาออกโดยอัตโนมัติ
                </div>
              </div>

              {submittedAdInfo.ad.popupImage && (
                <div className="max-w-xs mx-auto p-2 bg-white rounded-xl border border-pink-200 shadow-sm">
                  <img
                    src={submittedAdInfo.ad.popupImage}
                    alt="Ad Banner"
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-2xl bg-[#db2777] hover:bg-[#be185d] text-white font-bold text-xs shadow-md"
                >
                  เรียบร้อย ปิดหน้าต่าง
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
