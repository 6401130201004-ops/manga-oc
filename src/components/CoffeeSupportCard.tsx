import React, { useState, useEffect } from 'react';
import { Coffee, Download, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import { generatePromptPayPayload } from '../utils/promptpay';

interface CoffeeSupportCardProps {
  comicTitle?: string;
  chapterNumber?: number;
}

export const CoffeeSupportCard: React.FC<CoffeeSupportCardProps> = ({
  comicTitle,
  chapterNumber,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate open-amount PromptPay QR code (ตามศรัทธา - ผู้สแกนระบุยอดเงินเองในแอปธนาคาร)
    const payload = generatePromptPayPayload('0891234567');
    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate coffee QR:', err));
  }, []);

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `manga-oc-coffee-tip-qr.png`;
    a.click();
  };

  return (
    <div className="w-full max-w-md mx-auto my-8 p-6 sm:p-7 bg-gradient-to-b from-white via-pink-50/50 to-pink-50/80 border-2 border-pink-200 rounded-3xl shadow-lg flex flex-col items-center text-center space-y-4">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100 text-[#db2777] text-xs font-bold shadow-sm">
        <Coffee className="w-4 h-4 text-[#db2777]" />
        <span>manga-oc • อ่านฟรีทุกเรื่อง</span>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-800">
          ☕ สนับสนุนค่ากาแฟตามศรัทธา
        </h3>
        <p className="text-xs text-slate-600 mt-1.5 max-w-sm leading-relaxed">
          {comicTitle ? `ชอบ ${comicTitle} ตอนที่ ${chapterNumber} นี้ไหม? ` : ''}
          ร่วมเป็นกำลังใจให้ทีมงานและนักแปล ด้วยการสนับสนุนค่ากาแฟตามศรัทธา
        </p>
      </div>

      {/* Real PromptPay QR Code Display */}
      <div className="relative p-4 bg-white rounded-2xl border-2 border-pink-200 shadow-md">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="Thai PromptPay QR Code"
            className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl"
          />
        ) : (
          <div className="w-52 h-52 flex items-center justify-center bg-pink-50 rounded-xl">
            <span className="text-xs text-pink-400 font-bold animate-pulse">กำลังสร้าง QR Code...</span>
          </div>
        )}

        <div className="mt-2.5 pt-2 border-t border-pink-100 flex items-center justify-center gap-1.5 text-xs text-[#db2777] font-bold">
          <Smartphone className="w-4 h-4" />
          <span>สแกนผ่านแอปธนาคารได้ทุกธนาคาร</span>
        </div>
      </div>

      {/* Simple Note (No price options - purely according to faith) */}
      <div className="space-y-1 text-xs text-slate-600">
        <p className="font-bold text-slate-800 text-sm">
          สนับสนุนค่ากาแฟตามศรัทธา
        </p>
        <p className="text-[11px] text-slate-400 max-w-xs">
          สามารถระบุจำนวนเงินที่ต้องการสนับสนุนได้เองโดยตรงในแอปธนาคาร
        </p>
      </div>

      {/* Download QR Button */}
      <button
        onClick={handleDownloadQr}
        className="w-full max-w-xs py-2.5 px-4 rounded-xl bg-white hover:bg-pink-50 border border-pink-300 text-xs font-bold text-[#db2777] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        <span>บันทึกรูป QR Code ลงเครื่อง</span>
      </button>

      <p className="text-[10px] text-slate-400">
        ขอบพระคุณทุกกำลังใจที่ร่วมสนับสนุนผลงานของ manga-oc ค่ะ 💕
      </p>
    </div>
  );
};
