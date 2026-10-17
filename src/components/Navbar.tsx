import React, { useState } from 'react';
import { Search, Menu, X, Coffee, Megaphone, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'reader' | 'pipeline' | 'dmca' | 'monetization';
  onSelectTab: (tab: 'home' | 'reader' | 'pipeline' | 'dmca' | 'monetization') => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenCoffeeModal: () => void;
  onOpenAdModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser: { name: string; email: string; avatar: string } | null;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectTab,
  selectedCategory,
  onSelectCategory,
  onOpenCoffeeModal,
  onOpenAdModal,
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenAuthModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'หน้าแรก' },
    { id: 'MANHWA', label: 'MANHWA' },
    { id: 'MANHUA', label: 'MANHUA' },
    { id: 'MANGA', label: 'MANGA' },
    { id: 'LOOKISM', label: 'LOOKISM' },
    { id: 'ACTION', label: 'แอคชั่น' },
    { id: 'ROMANCE', label: 'โรแมนติก' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f472b6] text-white shadow-md">
      {/* Main Top Bar in Pastel Pink */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Left: manga-oc Brand Logo */}
        <div 
          onClick={() => {
            onSelectTab('home');
            onSelectCategory('all');
          }}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          {/* Logo Icon */}
          <div className="w-8 h-8 rounded-xl bg-white text-[#f472b6] flex items-center justify-center font-extrabold shadow-sm">
            <span className="text-base lowercase font-black">oc</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl font-black tracking-tight text-white font-sans lowercase">manga-oc</span>
            <span className="text-[10px] font-mono text-pink-100">.net</span>
          </div>
        </div>

        {/* Right Controls (Zero Coins - Replaced by Coffee & Ads & Gmail) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Coffee Support Trigger Button */}
          <button
            onClick={onOpenCoffeeModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-pink-50 text-[#db2777] font-bold text-xs rounded-full shadow-sm transition-transform active:scale-95"
            title="สนับสนุนค่ากาแฟทีมงาน (พร้อมเพย์ QR)"
          >
            <Coffee className="w-3.5 h-3.5 text-[#db2777]" />
            <span>เลี้ยงกาแฟ</span>
          </button>

          {/* Ad Sponsorship Contact Button */}
          <button
            onClick={onOpenAdModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-full border border-white/30 transition-transform active:scale-95"
            title="ลงโฆษณา / สปอนเซอร์ป๊อบอัพ"
          >
            <Megaphone className="w-3.5 h-3.5 text-pink-100" />
            <span>ติดต่อโฆษณา</span>
          </button>

          {/* Gmail / Google User Account Button */}
          {currentUser ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold text-white transition-colors border border-white/30"
              title={`เข้าสู่ระบบด้วย: ${currentUser.email}`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full bg-white"
              />
              <span className="hidden md:inline text-xs font-medium max-w-[100px] truncate">
                {currentUser.name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1 bg-white text-[#db2777] hover:bg-pink-50 rounded-full text-xs font-bold shadow-sm transition-transform active:scale-95"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="hidden sm:inline">เข้าสู่ระบบด้วย Gmail</span>
              <span className="sm:hidden">Gmail</span>
            </button>
          )}

          {/* Search Trigger Circle Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="w-9 h-9 rounded-full bg-white text-[#f472b6] flex items-center justify-center hover:bg-pink-50 transition-colors shadow-sm"
            aria-label="Search"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-white transition-colors lg:hidden"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Input Row */}
      {isSearchOpen && (
        <div className="bg-[#fb7185] px-4 py-2 border-t border-pink-300 animate-in fade-in">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <Search className="w-4 h-4 text-white" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ค้นหาชื่อการ์ตูน เช่น Overlord of Insects, Elf-san, Lookism, Solo Leveling..."
              className="w-full bg-transparent text-sm text-white placeholder-pink-200 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="text-xs text-white hover:underline"
              >
                ล้าง
              </button>
            )}
          </div>
        </div>
      )}

      {/* Secondary Horizontal Category Navigation Strip */}
      <div className="bg-white text-slate-800 border-b border-pink-100 overflow-x-auto shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-5 sm:gap-6 h-11 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onSelectTab('home');
              }}
              className={`h-full flex items-center border-b-2 transition-colors px-1 ${
                selectedCategory === cat.id
                  ? 'border-[#f472b6] text-[#db2777]'
                  : 'border-transparent text-slate-600 hover:text-[#db2777]'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="text-pink-200">|</span>
          <button
            onClick={onOpenCoffeeModal}
            className="text-[#db2777] hover:text-[#be185d] font-bold flex items-center gap-1"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>สนับสนุนค่ากาแฟ</span>
          </button>
          <button
            onClick={onOpenAdModal}
            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>ลงโฆษณา / ป๊อบอัพ</span>
          </button>
          <button
            onClick={() => onSelectTab('dmca')}
            className="text-slate-500 hover:text-slate-800 font-semibold text-[11px]"
          >
            แจ้งเรื่องลิขสิทธิ์
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="bg-[#fb7185] border-t border-pink-300 p-4 space-y-3 lg:hidden text-sm">
          <button
            onClick={() => {
              onOpenCoffeeModal();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 py-2 text-white font-bold"
          >
            <Coffee className="w-4 h-4 text-pink-200" />
            <span>☕ สนับสนุนค่ากาแฟทีมงาน (QR PromptPay)</span>
          </button>

          <button
            onClick={() => {
              onOpenAdModal();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 py-2 text-white font-bold border-t border-pink-400/60"
          >
            <Megaphone className="w-4 h-4 text-pink-200" />
            <span>📢 ติดต่อลงโฆษณา / ป๊อบอัพ</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('dmca');
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between py-2 text-pink-100 hover:text-white border-t border-pink-400/60"
          >
            <span>ศูนย์รับแจ้งเรื่องลิขสิทธิ์</span>
          </button>
        </div>
      )}
    </header>
  );
};
