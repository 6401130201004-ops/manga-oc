import React, { useState } from 'react';
import { 
  X, UploadCloud, Globe, Sparkles, CheckCircle2, AlertCircle, 
  BookOpen, DownloadCloud, Image as ImageIcon, RefreshCw, Layers
} from 'lucide-react';
import { Comic, Chapter } from '../types/comic';
import { 
  importChapterFromExternalUrl, 
  uploadCustomChapter, 
  cacheFavoriteComicsOffline,
  getFavoriteComicIds 
} from '../services/uploadedChapterService';

interface ChapterUploadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comics: Comic[];
  onChapterAdded: (comicSlug: string, newChapter: Chapter) => void;
  onComicAdded?: (newComic: Comic) => void;
}

export const ChapterUploadPanel: React.FC<ChapterUploadPanelProps> = ({
  isOpen,
  onClose,
  comics,
  onChapterAdded,
  onComicAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'upload' | 'offline'>('import');

  // Import State
  const [importUrl, setImportUrl] = useState('');
  const [importChapterNum, setImportChapterNum] = useState(1);
  const [importCustomTitle, setImportCustomTitle] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Upload State
  const [selectedComicSlug, setSelectedComicSlug] = useState(comics[0]?.slug || 'solo-leveling');
  const [uploadChapterNum, setUploadChapterNum] = useState(1);
  const [uploadChapterTitle, setUploadChapterTitle] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Offline Cache State
  const [offlineStatus, setOfflineStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) return;

    setIsImporting(true);
    setImportStatus(null);

    const result = await importChapterFromExternalUrl(
      importUrl.trim(),
      importChapterNum,
      importCustomTitle.trim() || undefined
    );

    setIsImporting(false);
    if (result.success && result.pages && result.comicSlug) {
      const newCh: Chapter = {
        id: `${result.comicSlug}-ch-${result.chapterNumber || importChapterNum}`,
        chapterNumber: result.chapterNumber || importChapterNum,
        title: result.chapterTitle || `ตอนที่ ${result.chapterNumber || importChapterNum}`,
        publishedAt: 'เพิ่งนำเข้า (AI แปลไทย)',
        pages: result.pages,
      };

      onChapterAdded(result.comicSlug, newCh);
      setImportStatus({
        success: true,
        message: `✅ นำเข้าและครอบทับแปลภาษา AI สำเร็จ! ดึงภาพได้ ${result.pageCount || result.pages.length} หน้า ไร้โฆษณาแทรก 100%`,
      });
      setImportUrl('');
    } else {
      setImportStatus({
        success: false,
        message: result.message || 'ไม่สามารถดึงข้อมูลจากเว็บต้นทางได้ โปรดตรวจสอบ URL หรือลองเรื่องอื่น',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const readers = fileList.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((base64Images) => {
      setUploadedImages((prev) => [...prev, ...base64Images]);
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0) return;

    setIsUploading(true);
    setUploadStatus(null);

    const targetComic = comics.find((c) => c.slug === selectedComicSlug);
    const result = await uploadCustomChapter({
      comicSlug: selectedComicSlug,
      comicTitle: targetComic?.title || selectedComicSlug,
      chapterNumber: uploadChapterNum,
      title: uploadChapterTitle.trim() || `ตอนที่ ${uploadChapterNum}`,
      images: uploadedImages,
      autoAiTranslate: true,
    });

    setIsUploading(false);
    if (result.success && result.pages) {
      const newCh: Chapter = {
        id: `${selectedComicSlug}-ch-${uploadChapterNum}`,
        chapterNumber: uploadChapterNum,
        title: uploadChapterTitle.trim() || `ตอนที่ ${uploadChapterNum}`,
        publishedAt: 'อัปโหลดล่าสุด',
        pages: result.pages,
      };

      onChapterAdded(selectedComicSlug, newCh);
      setUploadStatus({
        success: true,
        message: `✅ อัปโหลดสำเร็จ (${uploadedImages.length} หน้า) พร้อมครอบทับระบบแปลไทยด้วย AI เรียบร้อย!`,
      });
      setUploadedImages([]);
      setUploadChapterTitle('');
    } else {
      setUploadStatus({
        success: false,
        message: result.message || 'เกิดข้อผิดพลาดในการบันทึกตอนการ์ตูน',
      });
    }
  };

  const handleCacheFavorites = () => {
    const favIds = getFavoriteComicIds();
    const favComics = comics.filter((c) => favIds.includes(c.id));
    if (favComics.length === 0) {
      setOfflineStatus('ยังไม่มีการ์ตูนในรายการโปรด โปรดกดหัวใจที่การ์ตูนเรื่องที่ชอบก่อนบันทึก');
      return;
    }
    const { cachedCount } = cacheFavoriteComicsOffline(favComics);
    setOfflineStatus(`บันทึก 5 ตอนล่าสุดของ ${favComics.length} เรื่องโปรดสำเร็จ (${cachedCount} ตอนพร้อมอ่านออฟไลน์ 100%)`);
    setTimeout(() => setOfflineStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border-2 border-pink-200 shadow-2xl flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                ดึงการ์ตูน & อัปโหลดตอนใหม่ (AI แปลภาษา)
              </h2>
              <p className="text-[11px] text-pink-100">
                รองรับ mgeko.cc, manhuaus.com, อัปโหลดไฟล์ภาพ และอ่านแบบออฟไลน์
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

        {/* Tab Selector */}
        <div className="flex border-b border-pink-100 bg-pink-50/50 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-white text-[#db2777] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>ดึงจากเว็บ (AI แปลไทย)</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-[#db2777] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>อัปโหลดภาพตอนเอง</span>
          </button>

          <button
            onClick={() => setActiveTab('offline')}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'offline'
                ? 'bg-white text-[#db2777] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DownloadCloud className="w-4 h-4" />
            <span>อ่านออฟไลน์ (5 ตอน)</span>
          </button>
        </div>

        {/* Tab 1: Import from external with AI Overlay Translation */}
        {activeTab === 'import' && (
          <form onSubmit={handleImportSubmit} className="p-5 space-y-4 text-xs">
            <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-3.5 space-y-1.5">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#db2777]" />
                ระบบดึงและครอบทับแปลภาษาด้วย AI อัตโนมัติ
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                นำเข้าการ์ตูนจาก <strong className="text-pink-600">https://www.mgeko.cc/</strong> หรือ <strong className="text-pink-600">https://manhuaus.com/</strong> กรองโฆษณาออก 100% พร้อมสร้างกรอบคำพูดแปลภาษาไทยให้อัตโนมัติด้วย AI
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                URL หรือชื่อเรื่อง (Slug / Link จาก mgeko.cc หรือ manhuaus.com):
              </label>
              <input
                type="text"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="เช่น https://www.mgeko.cc/manga/solo-leveling/ หรือ solo-leveling"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">ลำดับตอนที่ต้องการดึง:</label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={importChapterNum}
                  onChange={(e) => setImportChapterNum(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">ชื่อเรื่องภาษาไทย (ไม่ระบุก็ได้):</label>
                <input
                  type="text"
                  value={importCustomTitle}
                  onChange={(e) => setImportCustomTitle(e.target.value)}
                  placeholder="เช่น จุติใหม่ราชันย์เงา"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-xs"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500">เรื่องยอดนิยมดึงได้ทันที:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Solo Leveling (ตอนที่ 1)', slug: 'solo-leveling', ch: 1 },
                  { label: 'Eleceed (ตอนที่ 1)', slug: 'eleceed', ch: 1 },
                  { label: 'Nano Machine (ตอนที่ 1)', slug: 'nano-machine', ch: 1 },
                  { label: 'Magic Emperor (ตอนที่ 1)', slug: 'magic-emperor', ch: 1 },
                  { label: 'The Beginning After The End', slug: 'the-beginning-after-the-end', ch: 1 },
                ].map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => {
                      setImportUrl(`https://www.mgeko.cc/manga/${item.slug}/`);
                      setImportChapterNum(item.ch);
                    }}
                    className="px-2 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-[#db2777] font-semibold text-[11px] transition-colors border border-pink-200"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded-xl flex items-start gap-2 ${
                  importStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {importStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{importStatus.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isImporting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังดึงภาพและใช้ AI ครอบทับแปลภาษา...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>ดึงภาพและสร้างกรอบแปลไทยด้วย AI ทันที</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Upload custom image panels */}
        {activeTab === 'upload' && (
          <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">เลือกเรื่องที่ต้องการเพิ่มตอน:</label>
              <select
                value={selectedComicSlug}
                onChange={(e) => setSelectedComicSlug(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-pink-400 outline-none text-xs bg-white"
              >
                {comics.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">เลขตอน:</label>
                <input
                  type="number"
                  min="1"
                  value={uploadChapterNum}
                  onChange={(e) => setUploadChapterNum(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-pink-400 outline-none text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">ชื่อตอน:</label>
                <input
                  type="text"
                  value={uploadChapterTitle}
                  onChange={(e) => setUploadChapterTitle(e.target.value)}
                  placeholder={`ตอนที่ ${uploadChapterNum}`}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-pink-400 outline-none text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-700">เลือกไฟล์รูปภาพการ์ตูน (JPG, PNG, WebP):</label>
              <div className="border-2 border-dashed border-pink-200 hover:border-pink-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-pink-50/40">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full h-full opacity-0 absolute cursor-pointer"
                />
                <ImageIcon className="w-8 h-8 text-pink-400" />
                <p className="text-xs font-bold text-slate-700">
                  คลิกเพื่อเลือกไฟล์ หรือลากรูปภาพมาวางที่นี่
                </p>
                <span className="text-[11px] text-slate-400">
                  เลือกได้พร้อมกันหลายภาพ (หน้า 1, หน้า 2, ...)
                </span>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>เลือกแล้ว {uploadedImages.length} ภาพ</span>
                  <button
                    type="button"
                    onClick={() => setUploadedImages([])}
                    className="text-rose-500 font-bold hover:underline"
                  >
                    ล้างทั้งหมด
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {uploadedImages.slice(0, 6).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`preview ${idx}`}
                      className="w-14 h-20 object-cover rounded-lg border border-slate-300"
                    />
                  ))}
                  {uploadedImages.length > 6 && (
                    <div className="w-14 h-20 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0">
                      +{uploadedImages.length - 6}
                    </div>
                  )}
                </div>
              </div>
            )}

            {uploadStatus && (
              <div
                className={`p-3 rounded-xl flex items-start gap-2 ${
                  uploadStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {uploadStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{uploadStatus.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || uploadedImages.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-[#f472b6] hover:bg-[#fb7185] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังประมวลผลอัปโหลด...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>บันทึกและสร้างตอนใหม่ ({uploadedImages.length} หน้า)</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 3: Offline Reading Access */}
        {activeTab === 'offline' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
                <DownloadCloud className="w-4 h-4 text-purple-600" />
                ระบบบันทึกอ่านออฟไลน์ 100% ไร้เน็ต
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                บันทึก 5 ตอนล่าสุดของการ์ตูนที่คุณกด 'ชื่นชอบ' (Favorite) ลงในเครื่องของคุณทันที เพื่อให้อ่านได้ตลอดเวลาแม้ไม่มีสัญญาณอินเทอร์เน็ต
              </p>
            </div>

            <button
              onClick={handleCacheFavorites}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>บันทึก 5 ตอนล่าสุดของเรื่องโปรดทั้งหมด</span>
            </button>

            {offlineStatus && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{offlineStatus}</span>
              </div>
            )}

            <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2 bg-slate-50/50">
              <span className="font-bold text-slate-700 block">สถานะการเก็บข้อมูลในเครื่อง:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">เรื่องโปรด</span>
                  <span className="font-bold text-slate-800">{getFavoriteComicIds().length} เรื่อง</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">โหมดออฟไลน์</span>
                  <span className="font-bold text-emerald-600">พร้อมใช้งาน</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
