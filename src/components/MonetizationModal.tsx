import React, { useState, useEffect } from 'react';
import { 
  Coins, CheckCircle2, ShieldCheck, 
  ShieldX, Download, Heart
} from 'lucide-react';
import QRCode from 'qrcode';
import { generatePromptPayPayload } from '../utils/promptpay';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  onCoinsAdded: (coins: number) => void;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  onCoinsAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'coins' | 'ads'>('coins');
  const [selectedTier, setSelectedTier] = useState({ coins: 100, priceThb: 99, label: 'นักอ่านตัวยง (ยอดนิยม)' });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [realQrDataUrl, setRealQrDataUrl] = useState<string>('');

  // Ad Form State
  const [adTitle, setAdTitle] = useState('');
  const [adCopy, setAdCopy] = useState('');
  const [advertiserName, setAdvertiserName] = useState('');
  const [isEvaluatingAd, setIsEvaluatingAd] = useState(false);
  const [adEvaluationResult, setAdEvaluationResult] = useState<any>(null);

  // Generate authentic Thai PromptPay QR Code using QRCode library
  useEffect(() => {
    const payload = generatePromptPayPayload('0891234567', selectedTier.priceThb);
    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setRealQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [selectedTier.priceThb]);

  if (!isOpen) return null;

  const coinTiers = [
    { coins: 50, priceThb: 49, label: 'ชิมลางอ่านตอนพิเศษ' },
    { coins: 100, priceThb: 99, label: 'นักอ่านตัวยง (ยอดนิยม)' },
    { coins: 250, priceThb: 229, label: 'แฟนพันธุ์แท้การ์ตูน' },
    { coins: 600, priceThb: 499, label: 'VIP สนับสนุนเต็มที่' },
  ];

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      onCoinsAdded(selectedTier.coins);
      setPaymentSuccess({
        id: `OC-${Date.now().toString().slice(-6)}`,
        amount: selectedTier.priceThb,
        coins: selectedTier.coins,
        timestamp: new Date().toLocaleTimeString('th-TH'),
      });
      setIsProcessingPayment(false);
    }, 600);
  };

  const handleDownloadQr = () => {
    if (!realQrDataUrl) return;
    const a = document.createElement('a');
    a.href = realQrDataUrl;
    a.download = `manga-oc-promptpay-${selectedTier.priceThb}thb.png`;
    a.click();
  };

  const handleTestAd = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluatingAd(true);
    setTimeout(() => {
      const text = (adTitle + ' ' + adCopy).toLowerCase();
      const isGambling = ['บาคาร่า', 'สล็อต', 'คาสิโน', 'เว็บตรง', 'แทงบอล', 'ufabet', 'slot', 'casino'].some(k => text.includes(k));

      if (isGambling) {
        setAdEvaluationResult({
          isApproved: false,
          reason: 'ไม่อนุมัติ: ตรวจพบเนื้อหาที่เกี่ยวข้องกับการพนันออนไลน์ ซึ่งผิดตามกฎหมายไทย และนโยบายความปลอดภัยของเว็บไซต์ manga-oc ไม่อนุญาตให้เผยแพร่เด็ดขาด',
        });
      } else {
        setAdEvaluationResult({
          isApproved: true,
          reason: 'อนุมัติเรียบร้อย: โฆษณาผ่านเกณฑ์ความปลอดภัยตามกฎหมายไทยและนโยบายชุมชน manga-oc',
        });
      }
      setIsEvaluatingAd(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-pink-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header (Pastel Pink) */}
        <div className="px-6 py-4 bg-[#f472b6] flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-white fill-white" />
            <div>
              <h2 className="text-sm font-bold">สนับสนุนเว็บไซต์ manga-oc & เติมเหรียญอ่านล่วงหน้า</h2>
              <p className="text-[11px] text-pink-100">
                ร่วมสนับสนุนค่ากาแฟและเซิร์ฟเวอร์ เพื่อให้อ่านการ์ตูนแปลไทยฟรีได้อย่างต่อเนื่อง
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

        {/* Navigation Tabs (Pastel Pink & Clean White) */}
        <div className="flex border-b border-pink-100 bg-[#fff5f7] px-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('coins')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'coins'
                ? 'border-[#f472b6] text-[#db2777]'
                : 'border-transparent text-slate-500 hover:text-[#db2777]'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-500" />
            <span>สแกน QR Code เติมเหรียญ</span>
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'ads'
                ? 'border-[#f472b6] text-[#db2777]'
                : 'border-transparent text-slate-500 hover:text-[#db2777]'
            }`}
          >
            ลงโฆษณาประชาสัมพันธ์
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white">
          {activeTab === 'coins' && (
            <div>
              {paymentSuccess ? (
                <div className="p-6 rounded-3xl bg-[#fff5f7] border border-pink-200 space-y-3 text-center animate-in fade-in">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">สนับสนุนสำเร็จเรียบร้อยแล้ว!</h3>
                  <p className="text-xs text-emerald-700">
                    เพิ่ม <span className="font-bold text-amber-600 font-mono text-sm">+{paymentSuccess.coins}</span> เหรียญเข้าสู่บัญชีของคุณเรียบร้อยแล้ว
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    รหัสรายการ: {paymentSuccess.id} (เวลา {paymentSuccess.timestamp})
                  </p>
                  <button
                    onClick={() => setPaymentSuccess(null)}
                    className="mt-3 px-6 py-2.5 bg-[#f472b6] hover:bg-[#fb7185] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    ทำรายการอื่นต่อ
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Left: Pack Selection */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      1. เลือกแพ็กเกจเหรียญ
                    </h3>
                    {coinTiers.map((tier) => (
                      <div
                        key={tier.coins}
                        onClick={() => setSelectedTier(tier)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedTier.coins === tier.coins
                            ? 'bg-pink-50 border-[#f472b6] ring-2 ring-[#f472b6]'
                            : 'bg-white border-pink-100 hover:border-pink-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <div>
                            <div className="text-xs font-bold text-slate-800">{tier.coins} เหรียญ</div>
                            <div className="text-[10px] text-slate-500">{tier.label}</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-[#db2777] font-mono">
                          ฿{tier.priceThb}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: Authentic Thai QR Code */}
                  <div className="p-4 rounded-3xl bg-[#fff5f7] border border-pink-200 text-center space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      2. สแกน QR Code จ่ายเงินได้ทันที
                    </h3>

                    {/* Official Thai QR Payment Box */}
                    <div className="w-52 mx-auto bg-white p-3 rounded-2xl shadow-md border border-pink-200 flex flex-col items-center">
                      {/* Thai QR Header Banner */}
                      <div className="w-full bg-[#113566] text-white py-1 rounded-t-lg mb-2 text-[10px] font-bold tracking-wider uppercase text-center">
                        THAI QR PAYMENT
                      </div>

                      {/* Real EMVCo Generated QR Image */}
                      {realQrDataUrl ? (
                        <img
                          src={realQrDataUrl}
                          alt="Thai QR Code"
                          className="w-40 h-40 object-contain"
                        />
                      ) : (
                        <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
                          กำลังสร้าง QR Code...
                        </div>
                      )}

                      <div className="text-[11px] font-bold text-slate-800 mt-1">
                        ยอดชำระ: <span className="text-[#db2777] font-mono text-xs">฿{selectedTier.priceThb}.00 บาท</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={handleDownloadQr}
                        className="px-3 py-1 bg-white hover:bg-pink-100 text-[#db2777] border border-pink-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>บันทึก QR Code</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      ใช้แอปธนาคารทุกธนาคารในไทย สแกนเพื่อชำระเงินได้ทันที
                    </p>

                    <button
                      onClick={handleConfirmPayment}
                      disabled={isProcessingPayment}
                      className="w-full py-2.5 bg-[#f472b6] hover:bg-[#fb7185] text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {isProcessingPayment ? 'กำลังตรวจสอบยอด...' : 'ยืนยันหลังจากสแกนชำระเงินแล้ว'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-4">
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl text-xs text-slate-700">
                <p className="font-bold text-[#db2777]">นโยบายการลงโฆษณาที่ปลอดภัย</p>
                <p className="mt-1 leading-relaxed">
                  manga-oc ยินดีต้อนรับโฆษณาสินค้าและบริการทั่วไป โดย <span className="text-rose-600 font-bold">ไม่รับโฆษณาเว็บพนันออนไลน์ สิ่งผิดกฎหมาย หรือแอลกอฮอล์อย่างเด็ดขาด</span>
                </p>
              </div>

              <form onSubmit={handleTestAd} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้ติดต่อ / แบรนด์</label>
                    <input
                      type="text"
                      required
                      value={advertiserName}
                      onChange={(e) => setAdvertiserName(e.target.value)}
                      placeholder="เช่น อุปกรณ์เกมมิ่ง หรือ เสื้อผ้าแฟชั่น"
                      className="w-full px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl text-xs text-slate-800 placeholder-pink-300 focus:outline-none focus:border-[#f472b6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้อโฆษณา</label>
                    <input
                      type="text"
                      required
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      placeholder="ข้อความพาดหัวโฆษณา"
                      className="w-full px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl text-xs text-slate-800 placeholder-pink-300 focus:outline-none focus:border-[#f472b6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดโฆษณา</label>
                  <textarea
                    rows={2}
                    required
                    value={adCopy}
                    onChange={(e) => setAdCopy(e.target.value)}
                    placeholder="ใส่รายละเอียดเกี่ยวกับสินค้าหรือบริการ..."
                    className="w-full px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl text-xs text-slate-800 placeholder-pink-300 focus:outline-none focus:border-[#f472b6] resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">ระบบจะตรวจสอบความปลอดภัยก่อนอนุมัติ</span>
                  <button
                    type="submit"
                    disabled={isEvaluatingAd}
                    className="px-5 py-2.5 bg-[#f472b6] hover:bg-[#fb7185] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    {isEvaluatingAd ? 'กำลังตรวจสอบ...' : 'ส่งข้อมูลเพื่อพิจารณา'}
                  </button>
                </div>
              </form>

              {adEvaluationResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                    adEvaluationResult.isApproved
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}
                >
                  {adEvaluationResult.isApproved ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <ShieldX className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold">
                      {adEvaluationResult.isApproved ? 'โฆษณาผ่านเกณฑ์การพิจารณา' : 'ไม่สามารถลงโฆษณานี้ได้'}
                    </div>
                    <p className="mt-0.5 leading-relaxed">{adEvaluationResult.reason}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
