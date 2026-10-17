import React, { useState } from 'react';
import { User, LogOut, CheckCircle2, Bookmark, Clock, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    email: string;
    avatar: string;
  } | null;
  onLogin: (user: { name: string; email: string; avatar: string }) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = (emailChoice?: string) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      const email = emailChoice || customEmail || 'reader.manga@gmail.com';
      const name = email.split('@')[0];
      onLogin({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
      });
      setIsLoggingIn(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-pink-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#f472b6] flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-white" />
            <h2 className="text-sm font-bold">
              {currentUser ? 'โปรไฟล์สมาชิก manga-oc' : 'เข้าสู่ระบบ / สมัครสมาชิก'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 bg-white">
          {currentUser ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-[#fff5f7] border border-pink-200 flex items-center gap-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-full bg-pink-100 border-2 border-[#f472b6] shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900">{currentUser.name}</h3>
                  <p className="text-xs text-pink-700 font-sans">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>สมาชิกพรีเมียม (อ่านฟรีตลอดชีพ)</span>
                  </div>
                </div>
              </div>

              {/* Account Benefits */}
              <div className="space-y-2 text-xs text-slate-600 bg-pink-50/50 p-3.5 rounded-2xl border border-pink-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>บันทึกประวัติการอ่านการ์ตูนอัตโนมัติ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ซิงค์รายการคั่นหน้า (Bookmarks) ทุกอุปกรณ์</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>เปิดอ่านตอนใหม่ทันทีเมื่อ AI อัปเดต</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-pink-50 hover:bg-pink-100 text-rose-600 border border-pink-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  ยินดีต้อนรับสู่ manga-oc
                </h3>
                <p className="text-xs text-slate-500">
                  เข้าสู่ระบบด้วยบัญชี Gmail เพื่อบันทึกประวัติและอ่านต่อได้ทันที
                </p>
              </div>

              {/* One-Click Google Auth */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleGoogleLogin('reader.manga@gmail.com')}
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 bg-white hover:bg-pink-50 border-2 border-pink-200 hover:border-[#f472b6] text-slate-700 font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Gmail ทันที'}</span>
                </button>

                {/* Secondary Gmail options */}
                <div className="pt-2 text-center">
                  <span className="text-[11px] text-slate-400">หรือระบุอีเมล Gmail ของคุณ</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="your.name@gmail.com"
                    className="flex-1 px-3.5 py-2 bg-[#fff5f7] border border-pink-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#f472b6]"
                  />
                  <button
                    onClick={() => handleGoogleLogin()}
                    className="px-4 py-2 bg-[#f472b6] hover:bg-[#db2777] text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>

              {/* Privacy Footer */}
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                ข้อมูลส่วนบุคคลของคุณได้รับการปกป้องอย่างปลอดภัย ตามนโยบายความเป็นส่วนตัวของ manga-oc
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
