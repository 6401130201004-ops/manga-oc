/**
 * Procedural Web Audio Engine & Multilingual Character TTS
 * Provides zero-dependency ambient scene BGM generated via Web Audio API
 * and expressive character voice TTS via Web Speech API.
 */

export interface VoiceSettings {
  enabled: boolean;
  speed: number;        // 0.7 to 1.6 (default 1.0)
  pitch: number;        // 0.8 to 1.4 (default 1.0)
  volume: number;       // 0 to 1.0 (default 1.0)
  autoReadOnScroll: boolean;
  pauseSlideWhileSpeaking: boolean;
  characterGenderTone: boolean;
}

export interface SlideSettings {
  enabled: boolean;
  speedMultiplier: number; // 0.5x, 1.0x, 1.5x, 2.0x, 3.0x
  pixelsPerSec: number;    // 15 to 120 px/sec
  autoNextChapter: boolean;
  pauseOnUserTouch: boolean;
}

export type BgmPresetKey = 'epic_battle' | 'dungeon_ambient' | 'romantic_waltz' | 'comic_fun' | 'mystery';

export const BGM_PRESET_LABELS: Record<BgmPresetKey, { label: string; icon: string; description: string }> = {
  epic_battle: { label: 'มหากาพย์การต่อสู้', icon: '⚔️', description: 'เสียงเบสกระหึ่มและคอร์ดเร้าใจสำหรับฉากบู๊' },
  dungeon_ambient: { label: 'ดันเจี้ยนและแฟนตาซี', icon: '🏰', description: 'เสียงสังเคราะห์ถ้ำลึก ดั่งโลกเวทมนตร์' },
  romantic_waltz: { label: 'โรแมนติกอบอุ่น', icon: '🌸', description: 'ท่วงทำนองอ่อนโยนสำหรับฉากรักหวานละมุน' },
  comic_fun: { label: 'สนุกสนานเฮฮา', icon: '🎉', description: 'จังหวะสดใสสำหรับฉากตลกและชีวิตประจำวัน' },
  mystery: { label: 'ปริศนาชวนระทึก', icon: '🔮', description: 'บรรยากาศระทึกขวัญชวนค้นหาความจริง' },
};

/**
 * Determine the appropriate BGM preset automatically based on comic genres or chapter mood
 */
export function mapGenreOrMoodToBgmPreset(genres: string[] = [], mood: string = ''): BgmPresetKey {
  const text = (genres.join(' ') + ' ' + mood).toLowerCase();
  if (text.includes('action') || text.includes('murim') || text.includes('shounen') || text.includes('ต่อสู้') || text.includes('battle') || text.includes('เข้มข้น')) {
    return 'epic_battle';
  }
  if (text.includes('romance') || text.includes('หวาน') || text.includes('รัก') || text.includes('โรแมนติก')) {
    return 'romantic_waltz';
  }
  if (text.includes('comedy') || text.includes('ตลก') || text.includes('ป่วน') || text.includes('fun') || text.includes('ฮา')) {
    return 'comic_fun';
  }
  if (text.includes('mystery') || text.includes('suspense') || text.includes('ระทึก') || text.includes('ลึกลับ') || text.includes('horror') || text.includes('จิตวิทยา')) {
    return 'mystery';
  }
  return 'dungeon_ambient';
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isBgmPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmNodes: OscillatorNode[] = [];
  private currentPreset: BgmPresetKey = 'dungeon_ambient';
  private bgmVolumeLevel: number = 0.18;
  private isSpeakingNow: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolumeLevel, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setPreset(preset: string) {
    const validPreset = (preset in BGM_PRESET_LABELS ? preset : 'dungeon_ambient') as BgmPresetKey;
    if (this.currentPreset !== validPreset && this.isBgmPlaying) {
      this.currentPreset = validPreset;
      this.stopBGM();
      this.playBGM(validPreset);
    } else {
      this.currentPreset = validPreset;
    }
  }

  public setBgmVolume(level: number) {
    this.bgmVolumeLevel = Math.max(0, Math.min(1, level));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolumeLevel, this.ctx.currentTime);
    }
  }

  /**
   * Procedurally generate ambient chord drones and textural pads based on the preset
   */
  public playBGM(preset: string = 'dungeon_ambient') {
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;
    this.stopBGM();
    this.isBgmPlaying = true;
    const validPreset = (preset in BGM_PRESET_LABELS ? preset : 'dungeon_ambient') as BgmPresetKey;
    this.currentPreset = validPreset;

    // Harmonically tuned frequencies for atmospheric mood
    let notes = [130.81, 196.00, 261.63, 311.13]; // C minor / Dungeon cavern
    let waveType: OscillatorType = 'sine';

    if (validPreset === 'epic_battle') {
      notes = [110.00, 164.81, 220.00, 277.18]; // A minor aggressive drive
      waveType = 'sawtooth';
    } else if (validPreset === 'romantic_waltz') {
      notes = [174.61, 220.00, 261.63, 329.63]; // F major gentle warm
      waveType = 'triangle';
    } else if (validPreset === 'comic_fun') {
      notes = [196.00, 246.94, 293.66, 392.00]; // G major pentatonic cheerful
      waveType = 'triangle';
    } else if (validPreset === 'mystery') {
      notes = [146.83, 174.61, 220.00, 293.66]; // D diminished suspense
      waveType = 'sine';
    }

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.bgmGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Low frequency modulation (LFO) for breathing, natural organic atmosphere
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.12 + idx * 0.06;
      lfoGain.gain.value = waveType === 'sawtooth' ? 4 : 6;
      lfo.connect(osc.frequency);
      lfo.start();

      // Soft volume envelope
      const baseVol = waveType === 'sawtooth' ? 0.022 : 0.065;
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(baseVol / (idx + 1), this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start();

      this.bgmNodes.push(osc);
    });
  }

  public stopBGM() {
    this.bgmNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.bgmNodes = [];
    this.isBgmPlaying = false;
  }

  public toggleBGM(preset?: string): boolean {
    if (this.isBgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.playBGM(preset || this.currentPreset);
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public getCurrentPreset(): BgmPresetKey {
    return this.currentPreset;
  }

  private currentAudioElement: HTMLAudioElement | null = null;

  public isSpeaking(): boolean {
    return this.isSpeakingNow;
  }

  public stopSpeaking() {
    this.isSpeakingNow = false;
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {}
      this.currentAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Speak character dialogue using real high-quality Gemini TTS AI voice first,
   * with natural, pleasant human prosody fallback via Web Speech API.
   */
  public async speakCharacterVoice(
    text: string,
    lang: string = 'th',
    gender: 'male' | 'female' | 'unknown' = 'female',
    tone: string = 'neutral',
    customSettings?: Partial<VoiceSettings>
  ): Promise<void> {
    // Strip meta tags like (หน้า 1) to guarantee clean dialogue
    const cleanText = text.replace(/\s*\((?:หน้า|page)\s*\d+\)/gi, '').trim();
    if (!cleanText) return;

    this.stopSpeaking();
    this.isSpeakingNow = true;

    // 1. Try Gemini AI Neural TTS for studio-grade human natural voice
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          lang: lang === 'raw' ? 'th' : lang,
          gender: gender === 'male' ? 'male' : 'female',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.audio) {
          return new Promise<void>((resolve) => {
            const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audio}`);
            this.currentAudioElement = audio;

            const vol = customSettings?.volume !== undefined ? customSettings.volume : 1.0;
            audio.volume = Math.max(0, Math.min(1, vol));

            audio.onended = () => {
              this.isSpeakingNow = false;
              this.currentAudioElement = null;
              resolve();
            };

            audio.onerror = () => {
              this.isSpeakingNow = false;
              this.currentAudioElement = null;
              resolve();
            };

            audio.play().catch(() => {
              // Fallback to speech synthesis if autoplay blocked
              this.fallbackSpeechSynthesis(cleanText, lang, gender, tone, customSettings)
                .then(resolve);
            });
          });
        }
      }
    } catch (e) {
      // Network or API failure -> seamlessly fallback
    }

    // 2. Pleasant Natural Voice Fallback (Web Speech API)
    return this.fallbackSpeechSynthesis(cleanText, lang, gender, tone, customSettings);
  }

  private fallbackSpeechSynthesis(
    text: string,
    lang: string,
    gender: 'male' | 'female' | 'unknown',
    _tone: string,
    customSettings?: Partial<VoiceSettings>
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        this.isSpeakingNow = false;
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      this.isSpeakingNow = true;

      const utterance = new SpeechSynthesisUtterance(text);

      // Select matching language code
      if (lang === 'th') utterance.lang = 'th-TH';
      else if (lang === 'ja') utterance.lang = 'ja-JP';
      else if (lang === 'ko') utterance.lang = 'ko-KR';
      else if (lang === 'zh') utterance.lang = 'zh-CN';
      else utterance.lang = 'en-US';

      // Pick the best natural human voice
      try {
        const voices = window.speechSynthesis.getVoices();
        const prefix = lang === 'th' ? 'th' : lang === 'ja' ? 'ja' : lang === 'ko' ? 'ko' : 'en';
        const matchingVoices = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix));

        if (matchingVoices.length > 0) {
          // Priority to high quality neural voices
          const preferredVoice = matchingVoices.find(
            (v) =>
              v.name.includes('Google') ||
              v.name.includes('Siri') ||
              v.name.includes('Premwadee') ||
              v.name.includes('Narisa') ||
              v.name.includes('Natural')
          );
          utterance.voice = preferredVoice || matchingVoices[0];
        }
      } catch (e) {}

      // Natural, pleasant Thai prosody: pitch 1.0 (never 0.78 or 1.28!), gentle rate 0.96-1.0
      const rateMultiplier = customSettings?.speed || 1.0;
      const volumeLevel = customSettings?.volume !== undefined ? customSettings.volume : 1.0;

      utterance.volume = Math.max(0, Math.min(1, volumeLevel));
      // Tonal language natural pitch: stay very close to 1.0 for authentic Thai tones
      utterance.pitch = gender === 'male' ? 0.98 : 1.03;
      utterance.rate = 0.98 * rateMultiplier;

      utterance.onend = () => {
        this.isSpeakingNow = false;
        resolve();
      };
      utterance.onerror = () => {
        this.isSpeakingNow = false;
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }
}

export const audioEngine = new AudioEngine();
