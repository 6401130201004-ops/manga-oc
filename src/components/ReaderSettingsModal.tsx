import React, { useState } from 'react';
import { 
  X, Volume2, VolumeX, Sliders, Play, Pause, FastForward, 
  Sparkles, Check, Globe, Eye, Music, Radio
} from 'lucide-react';
import { VoiceSettings, SlideSettings, audioEngine } from '../services/audioEngine';
import { Language } from '../types/comic';

interface ReaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: VoiceSettings) => void;
  slideSettings: SlideSettings;
  onUpdateSlideSettings: (settings: SlideSettings) => void;
  selectedLang: Language;
  onSelectLang: (lang: Language) => void;
  showBubbles: boolean;
  onToggleShowBubbles: (show: boolean) => void;
  isBgmActive: boolean;
  onToggleBgm: () => void;
  bgmPreset: string;
  onSelectBgmPreset: (preset: string) => void;
}

export const ReaderSettingsModal: React.FC<ReaderSettingsModalProps> = ({
  isOpen,
  onClose,
  voiceSettings,
  onUpdateVoiceSettings,
  slideSettings,
  onUpdateSlideSettings,
  selectedLang,
  onSelectLang,
  showBubbles,
  onToggleShowBubbles,
  isBgmActive,
  onToggleBgm,
  bgmPreset,
  onSelectBgmPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'slide' | 'display'>('voice');
  const [testSpeechStatus, setTestSpeechStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleTestVoice = async () => {
    setTestSpeechStatus('กำลังทดสอบเสียงอ่าน...');
    await audioEngine.speakCharacterVoice(
      'ยินดีต้อนรับสู่ manga-oc ระบบอ่านการ์ตูนด้วยเสียงอัจฉริยะพร้อมสไลด์ยาวต่อเนื่องค่ะ',
      selectedLang === 'raw' ? 'th' : selectedLang,
      'female',
      'cheerful',
      voiceSettings
    );
    setTestSpeechStatus('ทดสอบเสร็จสิ้น!');
    setTimeout(() => setTestSpeechStatus(''), 2500);
  };

  const speedPresets = [
    { label: '🐢 ช้ามาก', value: 20 },
    { label: '🚶 พอดีอ่าน', value: 35 },
    { label: '⚡ มาตรฐาน', value: 50 },
    { label: '🚀 เร็ว', value: 75 },
    { label: '🏎️ สปีดรัน', value: 100 },
  ];

  const voiceRatePresets = [
    { label: '0.8x ช้า', value: 0.8 },
    { label: '1.0x ปกติ', value: 1.0 },
    { label: '1.25x ปานกลาง', value: 1.25 },
    { label: '1.5x กระชับ', value: 1.5 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-pink-200 shadow-2xl flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                เมนูปรับแต่งการอ่าน (เสียง & สไลด์)
              </h2>
              <p className="text-[11px] text-pink-100">
                ตั้งค่าระบบอ่านด้วยเสียงและสไลด์อัตโนมัติตามความต้องการของคุณ
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

        {/* Tab Navigation */}
        <div className="flex border-b border-pink-100 bg-pink-50/50 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'voice'
                ? 'bg-white text-[#db2777] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>🎙️ เสียงพากย์</span>
          </button>

          <button
            onClick={() => setActiveTab('slide')}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'slide'
                ? 'bg-white text-[#db2777] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FastForward className="w-4 h-4" />
            <span>📜 สไลด์อัตโนมัติ</span>
          </button>

          <button
            onClick={() => setActiveTab('display')}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'display'
                ? 'bg-white text-[#db2777] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>🌐 ภาษา & บทพูด</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-5 text-xs text-slate-700">
          {/* TAB 1: VOICE SETTINGS */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              {/* Master Voice Switch */}
              <div className="flex items-center justify-between p-3.5 bg-pink-50/70 rounded-2xl border border-pink-200">
                <div>
                  <span className="font-bold text-slate-800 text-sm block">เปิดระบบอ่านด้วยเสียงพากย์ (TTS)</span>
                  <span className="text-[11px] text-slate-500">พากย์เสียงบทสนทนาภาษาไทยและต่างประเทศอย่างมีอารมณ์</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceSettings.enabled}
                    onChange={(e) => onUpdateVoiceSettings({ ...voiceSettings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#db2777]"></div>
                </label>
              </div>

              {/* Voice Speed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">ความเร็วเสียงอ่าน: <span className="text-[#db2777]">{voiceSettings.speed}x</span></label>
                  <span className="text-[11px] text-slate-400">ปรับความเร็วคำพูด</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {voiceRatePresets.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => onUpdateVoiceSettings({ ...voiceSettings, speed: p.value })}
                      className={`py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
                        voiceSettings.speed === p.value
                          ? 'bg-[#db2777] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.6"
                  step="0.05"
                  value={voiceSettings.speed}
                  onChange={(e) => onUpdateVoiceSettings({ ...voiceSettings, speed: parseFloat(e.target.value) })}
                  className="w-full accent-[#db2777] cursor-pointer"
                />
              </div>

              {/* Voice Volume */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">ระดับเสียงพากย์: <span className="text-[#db2777]">{Math.round(voiceSettings.volume * 100)}%</span></label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={voiceSettings.volume}
                  onChange={(e) => onUpdateVoiceSettings({ ...voiceSettings, volume: parseFloat(e.target.value) })}
                  className="w-full accent-[#db2777] cursor-pointer"
                />
              </div>

              {/* Character Gender & Tone Modulation */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-pink-100">
                <div>
                  <span className="font-bold text-slate-800 block">ปรับโทนเสียงตามเพศตัวละคร (ชาย/หญิง)</span>
                  <span className="text-[11px] text-slate-500">ปรับระดับเสียงทุ้ม/แหลมตามเพศและอารมณ์ของตัวละคร</span>
                </div>
                <input
                  type="checkbox"
                  checked={voiceSettings.characterGenderTone}
                  onChange={(e) => onUpdateVoiceSettings({ ...voiceSettings, characterGenderTone: e.target.checked })}
                  className="w-4 h-4 accent-[#db2777] cursor-pointer rounded"
                />
              </div>

              {/* Auto Read on Scroll */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-pink-100">
                <div>
                  <span className="font-bold text-slate-800 block">อ่านอัตโนมัติเมื่อเลื่อนผ่านกรอบคำพูด</span>
                  <span className="text-[11px] text-slate-500">เมื่อสไลด์ถึงบทสนทนา ระบบจะพากย์เสียงให้อัตโนมัติ</span>
                </div>
                <input
                  type="checkbox"
                  checked={voiceSettings.autoReadOnScroll}
                  onChange={(e) => onUpdateVoiceSettings({ ...voiceSettings, autoReadOnScroll: e.target.checked })}
                  className="w-4 h-4 accent-[#db2777] cursor-pointer rounded"
                />
              </div>

              {/* Ambient BGM Controls */}
              <div className="p-3.5 bg-pink-50/50 rounded-2xl border border-pink-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#db2777]" />
                    <span className="font-bold text-slate-800">เสียงเพลงบรรยากาศ (Ambient BGM)</span>
                  </div>
                  <button
                    onClick={onToggleBgm}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isBgmActive ? 'bg-[#db2777] text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isBgmActive ? 'เปิดอยู่' : 'ปิด'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {[
                    { id: 'dungeon_ambient', name: '🏰 ดันเจี้ยนลึกลับ' },
                    { id: 'epic_battle', name: '⚔️ มหาสงคราม' },
                    { id: 'romantic_waltz', name: '🌸 อบอุ่นโรแมนติก' },
                    { id: 'mystery', name: '🔮 ลึกลับระทึกขวัญ' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onSelectBgmPreset(p.id)}
                      className={`p-2 rounded-xl text-left font-semibold text-[11px] transition-all ${
                        bgmPreset === p.id && isBgmActive
                          ? 'bg-[#db2777] text-white font-bold shadow-xs'
                          : 'bg-white hover:bg-pink-100/60 border border-pink-100 text-slate-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Voice Button */}
              <div className="pt-1">
                <button
                  onClick={handleTestVoice}
                  className="w-full py-2.5 px-4 rounded-xl bg-pink-100 hover:bg-pink-200 text-[#db2777] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>ทดสอบเสียงอ่านตัวอย่าง (คลิกฟังเสียง)</span>
                </button>
                {testSpeechStatus && (
                  <p className="text-[11px] text-emerald-600 font-bold text-center mt-1 animate-pulse">
                    {testSpeechStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SLIDE / AUTO-SCROLL SETTINGS */}
          {activeTab === 'slide' && (
            <div className="space-y-4">
              {/* Master Slide Switch */}
              <div className="flex items-center justify-between p-3.5 bg-pink-50/70 rounded-2xl border border-pink-200">
                <div>
                  <span className="font-bold text-slate-800 text-sm block">เปิดระบบสไลด์อัตโนมัติ (Auto-Slide)</span>
                  <span className="text-[11px] text-slate-500">เลื่อนหน้าจอลงอย่างนุ่มนวล ไม่ต้องใช้นิ้วปาดหน้าจอ</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slideSettings.enabled}
                    onChange={(e) => onUpdateSlideSettings({ ...slideSettings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#db2777]"></div>
                </label>
              </div>

              {/* Slide Speed Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    ความเร็วในการสไลด์: <span className="text-[#db2777]">{slideSettings.pixelsPerSec} พิกเซล/วินาที</span>
                  </label>
                  <span className="text-[11px] text-slate-400">เลือกความเร็วที่สบายตาที่สุด</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {speedPresets.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => onUpdateSlideSettings({ ...slideSettings, pixelsPerSec: p.value })}
                      className={`py-2 px-2.5 rounded-xl font-bold text-center transition-all ${
                        slideSettings.pixelsPerSec === p.value
                          ? 'bg-[#db2777] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={slideSettings.pixelsPerSec}
                  onChange={(e) => onUpdateSlideSettings({ ...slideSettings, pixelsPerSec: parseInt(e.target.value) })}
                  className="w-full accent-[#db2777] cursor-pointer mt-1"
                />
              </div>

              {/* Smart Feature: Pause slide while speaking */}
              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-pink-100">
                <div>
                  <span className="font-bold text-slate-800 block">✨ หยุดสไลด์ชั่วคราวขณะเสียงพากย์กำลังอ่าน</span>
                  <span className="text-[11px] text-slate-500">ระบบจะหยุดหน้าจอให้ฟังบทพูดจนจบ แล้วสไลด์ต่อให้อัตโนมัติ</span>
                </div>
                <input
                  type="checkbox"
                  checked={voiceSettings.pauseSlideWhileSpeaking}
                  onChange={(e) => onUpdateVoiceSettings({ ...voiceSettings, pauseSlideWhileSpeaking: e.target.checked })}
                  className="w-4 h-4 accent-[#db2777] cursor-pointer rounded"
                />
              </div>

              {/* Smart Feature: Pause on user touch */}
              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-pink-100">
                <div>
                  <span className="font-bold text-slate-800 block">หยุดชั่วคราวเมื่อนิ้วแตะหรือเลื่อนหน้าจอเอง</span>
                  <span className="text-[11px] text-slate-500">เมื่อคุณแตะจอ สไลด์จะหยุดชั่วขณะและเริ่มใหม่เมื่อปล่อยมือ</span>
                </div>
                <input
                  type="checkbox"
                  checked={slideSettings.pauseOnUserTouch}
                  onChange={(e) => onUpdateSlideSettings({ ...slideSettings, pauseOnUserTouch: e.target.checked })}
                  className="w-4 h-4 accent-[#db2777] cursor-pointer rounded"
                />
              </div>

              {/* Auto Advance to next chapter */}
              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-pink-100">
                <div>
                  <span className="font-bold text-slate-800 block">เปลี่ยนตอนถัดไปอัตโนมัติเมื่ออ่านจบตอน</span>
                  <span className="text-[11px] text-slate-500">เมื่อสไลด์ถึงท้ายเรื่อง จะเปิดตอนถัดไปให้อัตโนมัติ</span>
                </div>
                <input
                  type="checkbox"
                  checked={slideSettings.autoNextChapter}
                  onChange={(e) => onUpdateSlideSettings({ ...slideSettings, autoNextChapter: e.target.checked })}
                  className="w-4 h-4 accent-[#db2777] cursor-pointer rounded"
                />
              </div>
            </div>
          )}

          {/* TAB 3: LANGUAGE & DISPLAY SETTINGS */}
          {activeTab === 'display' && (
            <div className="space-y-4">
              {/* Language Selection */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">เลือกภาษาแปลของบทสนทนา:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'th', label: 'ภาษาไทย (แปลลื่นไหล)', flag: '🇹🇭' },
                    { id: 'en', label: 'English (ต้นฉบับอังกฤษ)', flag: '🇬🇧' },
                    { id: 'ja', label: '日本語 (ภาษาญี่ปุ่น)', flag: '🇯🇵' },
                    { id: 'ko', label: '한국어 (ภาษาเกาหลี)', flag: '🇰🇷' },
                    { id: 'raw', label: 'ต้นฉบับดั้งเดิม (Raw)', flag: '📄' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelectLang(item.id as Language)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        selectedLang === item.id
                          ? 'border-[#db2777] bg-pink-50 text-[#db2777] font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-pink-50/50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.flag}</span>
                        <span>{item.label}</span>
                      </div>
                      {selectedLang === item.id && <Check className="w-4 h-4 text-[#db2777]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show / Hide Dialog Bubbles */}
              <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-pink-200">
                <div>
                  <span className="font-bold text-slate-800 block">แสดงกล่องข้อความบทสนทนา (Dialog Bubbles)</span>
                  <span className="text-[11px] text-slate-500">แสดงกล่องแปลคำพูดลอยบนภาพการ์ตูน แตะเพื่อฟังเสียงได้</span>
                </div>
                <input
                  type="checkbox"
                  checked={showBubbles}
                  onChange={(e) => onToggleShowBubbles(e.target.checked)}
                  className="w-4 h-4 accent-[#db2777] cursor-pointer rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-pink-50/60 border-t border-pink-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">บันทึกการตั้งค่าอัตโนมัติ</span>
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-[#db2777] hover:bg-[#be185d] text-white font-bold text-xs shadow-md transition-transform active:scale-95"
          >
            ตกลงและเริ่มอ่าน
          </button>
        </div>
      </div>
    </div>
  );
};
