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

  public isSpeaking(): boolean {
    return this.isSpeakingNow;
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeakingNow = false;
    }
  }

  /**
   * Speak character dialogue using Web Speech API with pitch, rate, and gender adaptation
   */
  public async speakCharacterVoice(
    text: string,
    lang: string = 'th',
    gender: 'male' | 'female' | 'unknown' = 'female',
    tone: string = 'neutral',
    customSettings?: Partial<VoiceSettings>
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser.');
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Stop any pending speech
      this.isSpeakingNow = true;

      const utterance = new SpeechSynthesisUtterance(text);

      // Select matching language code
      if (lang === 'th') utterance.lang = 'th-TH';
      else if (lang === 'ja') utterance.lang = 'ja-JP';
      else if (lang === 'ko') utterance.lang = 'ko-KR';
      else if (lang === 'zh') utterance.lang = 'zh-CN';
      else utterance.lang = 'en-US';

      // Pick matching browser voice if available
      try {
        const voices = window.speechSynthesis.getVoices();
        const prefix = lang === 'th' ? 'th' : lang === 'ja' ? 'ja' : lang === 'ko' ? 'ko' : 'en';
        const matchingVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));

        if (matchingVoices.length > 0) {
          if (gender === 'female') {
            const femaleVoice = matchingVoices.find(
              (v) =>
                v.name.toLowerCase().includes('female') ||
                v.name.toLowerCase().includes('woman') ||
                v.name.includes('Siri') ||
                v.name.includes('Google')
            );
            utterance.voice = femaleVoice || matchingVoices[0];
          } else if (gender === 'male') {
            const maleVoice = matchingVoices.find(
              (v) =>
                v.name.toLowerCase().includes('male') ||
                v.name.toLowerCase().includes('man')
            );
            utterance.voice = maleVoice || matchingVoices[0];
          } else {
            utterance.voice = matchingVoices[0];
          }
        }
      } catch (e) {}

      // Base rate and pitch
      const rateMultiplier = customSettings?.speed || 1.0;
      const pitchMultiplier = customSettings?.pitch || 1.0;
      const volumeLevel = customSettings?.volume !== undefined ? customSettings.volume : 1.0;

      utterance.volume = Math.max(0, Math.min(1, volumeLevel));

      // Character profile tone modulation
      if (customSettings?.characterGenderTone !== false) {
        if (gender === 'male') {
          const malePitchBase = tone === 'brave' || tone === 'determined' ? 0.78 : 0.88;
          utterance.pitch = malePitchBase * pitchMultiplier;
          utterance.rate = (tone === 'angry' ? 1.08 : 0.96) * rateMultiplier;
        } else if (gender === 'female') {
          const femalePitchBase = tone === 'cheerful' ? 1.28 : 1.15;
          utterance.pitch = femalePitchBase * pitchMultiplier;
          utterance.rate = 1.0 * rateMultiplier;
        } else {
          utterance.pitch = 1.0 * pitchMultiplier;
          utterance.rate = 1.0 * rateMultiplier;
        }
      } else {
        utterance.pitch = 1.0 * pitchMultiplier;
        utterance.rate = 1.0 * rateMultiplier;
      }

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
