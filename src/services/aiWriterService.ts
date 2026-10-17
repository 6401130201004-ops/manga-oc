import { Comic, Chapter, ComicPage, DialogBubble } from '../types/comic';
import { generateWebtoonPanelSvg } from '../utils/comicPageGenerator';
import { getClonedImagesForComic } from '../data/clonedMangaPages';

const AI_LOGS_KEY = 'mangaoc_ai_writer_logs_v2';
const AI_CREDIT_RESET_KEY = 'mangaoc_ai_credit_cycle';

export interface AiWriterLog {
  id: string;
  comicId: string;
  comicTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  totalPages: number;
  createdAt: string;
  plotArc: string;
  summary: string;
  cliffhanger: string;
}

export function getAiWriterLogs(): AiWriterLog[] {
  try {
    const raw = localStorage.getItem(AI_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAiWriterLogs(logs: AiWriterLog[]): void {
  localStorage.setItem(AI_LOGS_KEY, JSON.stringify(logs));
}

// Track AI autonomous writer quota and reset countdown
export function getCreditResetStatus(): { nextResetTime: number; creditsAvailable: number } {
  try {
    const raw = localStorage.getItem(AI_CREDIT_RESET_KEY);
    const now = Date.now();
    if (raw) {
      const data = JSON.parse(raw);
      if (now < data.nextResetTime) {
        return data;
      }
    }
    // New cycle reset: sets next reset in 60 seconds (for lively live simulation) or 24h
    const nextCycle = {
      nextResetTime: now + 90000, // 90 seconds cycle for exciting live updates
      creditsAvailable: 100,
    };
    localStorage.setItem(AI_CREDIT_RESET_KEY, JSON.stringify(nextCycle));
    return nextCycle;
  } catch {
    return { nextResetTime: Date.now() + 90000, creditsAvailable: 100 };
  }
}

// Serialized Plot Engine: Professional multi-chapter continuity arcs
const PLOT_CONTINUITY_TEMPLATES: Record<string, {
  arcName: string;
  titles: string[];
  scenarios: { title: string; sfx: string; hero: string; rival: string; th: string }[][];
}> = {
  default: {
    arcName: 'มหากาพย์มหาสงครามข้ามมิติ',
    titles: [
      'ความลับที่ซ่อนอยู่ในเงามืด',
      'การปลุกพลังวิญญาณยุทธ์ขั้นที่สอง',
      'การประจันหน้ากับสี่ขุนพลทมิฬ',
      'ผนึกโบราณแตกสลาย',
      'การตื่นรู้ของมหาจักรพรรดิ',
      'บทตัดสินแห่งชะตากรรมสองภพ',
    ],
    scenarios: [
      // Chapter 2 scenario (9 sequential pages)
      [
        { title: 'ผลกระทบจากศึกก่อนหน้า ควันไฟยังไม่จางหาย', sfx: 'ครืนนน...', hero: 'ตัวเอก', rival: 'ผู้ตรวจการ', th: 'ความเสียหายจากคราวก่อนยังรุนแรงนัก... แต่ข้ารู้สึกได้ถึงคลื่นพลังใหม่ที่แผ่ซ่านอยู่ในกาย (หน้า 1)' },
        { title: 'การค้นพบศิลาจารึกโบราณใต้ซากวิหาร', sfx: 'แกร๊ก!', hero: 'ตัวเอก', rival: 'ศิลาวิญญาณ', th: 'อักษรโบราณนี้... มันคือบันทึกของผู้ครอบครองพลังคนก่อนเมื่อพันปีก่อนงั้นรึ?! (หน้า 2)' },
        { title: 'ผู้มาเยือนปริศนาจากเงามืด', sfx: 'ฟึ่บ!', hero: 'ตัวเอก', rival: 'นักฆ่าผ้าคลุมดำ', th: 'เจ้าเด็กน้อย... เจ้าไม่ควรมาแตะต้องความลับของดินแดนนี้ ถอยไปซะถ้ายังรักชีวิต! (หน้า 3)' },
        { title: 'การปะทะด้วยกระบวนท่ารวดเร็วดั่งสายฟ้า', sfx: 'ชิ้งงง!', hero: 'ตัวเอก', rival: 'นักฆ่าผ้าคลุมดำ', th: 'ถอยรึ? ในพจนานุกรมของข้าไม่เคยมีคำนี้อยู่แล้ว! จงรับมือ! (หน้า 4)' },
        { title: 'ระเบิดปราณหักล้างรุนแรงใจกลางป่า', sfx: 'ตู๊มมมม!!', hero: 'ตัวเอก', rival: 'นักฆ่าผ้าคลุมดำ', th: 'ผสานพลังเวทเข้ากับคมดาบ... เพลงดาบตัดมิติผ่าปฐพี! (หน้า 5)' },
        { title: 'ศัตรูถอยร่นด้วยความตื่นตระหนก', sfx: 'อึกก!', hero: 'ตัวเอก', rival: 'นักฆ่าผ้าคลุมดำ', th: 'เป็นไปไม่ได้... เพิ่งตื่นพลังได้ไม่นาน แต่พลังทำลายล้างกลับสูงถึงเพียงนี้?! (หน้า 6)' },
        { title: 'การเผยโฉมหน้าที่แท้จริงภายใต้หน้ากาก', sfx: 'เพล้งงง!', hero: 'ตัวเอก', rival: 'บุคคลคุ้นเคย', th: 'หน้ากากแตกออก... ท่านเองงั้นรึ?! คนทรยศที่อยู่เบื้องหลังทั้งหมดคือท่านเองหรือ?! (หน้า 7)' },
        { title: 'ความจริงอันดำมืดถูกเปิดโปง', sfx: 'ฮึ่มมม...', hero: 'ตัวเอก', rival: 'คนทรยศ', th: 'หึหึ... ใช่แล้ว! และนี่คือจุดเริ่มต้นของหายนะที่แท้จริงที่จะกลืนกินเมืองนี้! (หน้า 8)' },
        { title: 'ทิ้งปมสู่ศึกตัดสินครั้งใหญ่', sfx: 'ตึกตัก...', hero: 'ตัวเอก', rival: 'ตัวเอก', th: 'ข้าจะไม่ยอมให้แผนการชั่วร้ายของเจ้าสำเร็จ... เจอกันที่ลานประลองกลางเมือง! (หน้า 9)' },
      ],
      // Chapter 3 scenario (9 sequential pages)
      [
        { title: 'รุ่งอรุณแห่งวันประลองใหญ่ เสียงกลองศึกดังกึกก้อง', sfx: 'ตึงงง!', hero: 'ตัวเอก', rival: 'โฆษกสนาม', th: 'วันนี้คือวันที่ชะตาของเมืองจะเปลี่ยนไป ทุกสายตาต่างจับจ้องมาที่นี่ (หน้า 1)' },
        { title: 'การก้าวขึ้นสู่สังเวียนท่ามกลางเสียงเชียร์', sfx: 'เฮ้รรร!', hero: 'ตัวเอก', rival: 'กองเชียร์', th: 'ความเงียบสงบในจิตใจ... ข้าจะไม่ยอมให้สิ่งใดมาทำให้สมาธิสั่นคลอน (หน้า 2)' },
        { title: 'การเปิดตัวคู่ต่อสู้ระดับตำนาน', sfx: 'ตึก...ตึก...', hero: 'ตัวเอก', rival: 'จอมยุทธ์ไร้พ่าย', th: 'ในที่สุดก็ได้พบกัน... ข้าเฝ้ารอคอยคู่ต่อสู้ที่คู่ควรมานานแสนนานแล้ว (หน้า 3)' },
        { title: 'ชักอาวุธคู่กาย รังสีดาบแผ่ขยายปกคลุม', sfx: 'วึ้งงงง!', hero: 'ตัวเอก', rival: 'จอมยุทธ์ไร้พ่าย', th: 'จงแสดงพลังที่แท้จริงของเจ้าออกมา อย่าได้ออมมือเด็ดขาด! (หน้า 4)' },
        { title: 'การแลกหมัดด้วยความเร็วเหนือเสียง', sfx: 'เปรี้ยงงง!!', hero: 'ตัวเอก', rival: 'จอมยุทธ์ไร้พ่าย', th: 'เร็วมาก! แทบมองตามไม่ทัน แต่สัมผัสที่หกของข้าอ่านวิถีออกหมดแล้ว! (หน้า 5)' },
        { title: 'คลื่นกระแทกพัดทำลายอัฒจันทร์พังทลาย', sfx: 'โครมมม!', hero: 'ตัวเอก', rival: 'จอมยุทธ์ไร้พ่าย', th: 'วิชาป้องกันร่างทองคำ! ต้านทานการโจมตีอันหนักหน่วงไว้ได้! (หน้า 6)' },
        { title: 'การวิวัฒนาการขั้นที่สามของพลัง', sfx: 'วาบพา!', hero: 'ตัวเอก', rival: 'ตัวเอก', th: 'นี่คือร่างจุติที่แท้จริง... เปลวเพลิงสีครามแห่งการทำลายล้าง! (หน้า 7)' },
        { title: 'หมัดเผด็จศึกทะลวงเกราะศักดิ์สิทธิ์', sfx: 'ตู๊มมมม!!', hero: 'ตัวเอก', rival: 'จอมยุทธ์ไร้พ่าย', th: 'รับไปซะ! หมัดทลายจักรวาลไร้ขอบเขต! (หน้า 8)' },
        { title: 'เสียงเตือนภัยจากนอกกำแพงเมือง', sfx: 'หวูดดด!', hero: 'ตัวเอก', rival: 'ทหารยาม', th: 'รายงานด่วน! กองทัพอสูรนับแสนกำลังบุกประชิดประตูด้านทิศเหนือแล้ว! (หน้า 9)' },
      ],
    ],
  },
};

/**
 * Autonomous Professional AI Writer Engine
 * Writes continuous serialized chapters with 9 high-quality comic pages each.
 */
export function generateProfessionalContinuousChapter(comic: Comic): { updatedComic: Comic; newLog: AiWriterLog } {
  const highestChapter = Math.max(...comic.chapters.map((c) => c.chapterNumber), 0);
  const nextChapterNum = highestChapter > 0 ? highestChapter + 1 : 1;
  const chapterTitle = `ตอนที่ ${nextChapterNum}`;
  const continuity = PLOT_CONTINUITY_TEMPLATES.default;

  const scenarioSetIndex = Math.abs((nextChapterNum - 2) % continuity.scenarios.length);
  const scenarios = continuity.scenarios[scenarioSetIndex] || continuity.scenarios[0];

  const heroName = comic.title.split('(')[0].trim().split(' ')[0] || 'พระเอก';

  const realImages = getClonedImagesForComic(comic.slug, comic.genres);
  const newPages: ComicPage[] = [];

  for (let i = 1; i <= 9; i++) {
    const sc = scenarios[i - 1] || {
      title: `ฉากการต่อสู้เข้มข้น ตอนที่ ${nextChapterNum} หน้าที่ ${i}`,
      sfx: i % 2 === 0 ? 'ตู๊มมมม!!' : 'ชิ้งงง!!',
      hero: heroName,
      rival: 'ศัตรูผู้ท้าทาย',
      th: `การเดินทางของ ${heroName} กำลังเผชิญหน้ากับบททดสอบครั้งสำคัญ! (หน้า ${i})`,
    };

    const realImgUrl = realImages[(i - 1) % realImages.length];
    const proxiedImg = `/api/image-proxy?url=${encodeURIComponent(realImgUrl)}`;

    newPages.push({
      id: `p-${comic.slug}-ch${nextChapterNum}-${i}`,
      pageNumber: i,
      imageUrl: proxiedImg,
      ambientMood: sc.title,
      bgmPreset: i % 2 === 0 ? 'epic_battle' : 'dungeon_ambient',
      bubbles: [
        {
          id: `b-pro-ch${nextChapterNum}-${i}`,
          speaker: i % 2 === 1 ? heroName : sc.rival,
          gender: 'male',
          tone: i % 2 === 1 ? 'determined' : 'sinister',
          originalText: sc.th,
          th: sc.th,
          en: `Chapter ${nextChapterNum} Page ${i}: The continuous saga intensifies!`,
          ja: `第${nextChapterNum}話 第${i}ページ：物語はさらに加速する！`,
          ko: `제${nextChapterNum}화 ${i}페이지: 서사가 더욱 격렬해진다!`,
          x: i % 2 === 0 ? 12 : 56,
          y: i % 3 === 0 ? 18 : i % 3 === 1 ? 48 : 72,
          width: 32,
          height: 9,
        },
      ],
    });
  }

  const newChapter: Chapter = {
    id: `${comic.id}-ch-${nextChapterNum}`,
    chapterNumber: nextChapterNum,
    title: chapterTitle,
    publishedAt: 'เพิ่งเขียนเสร็จ (NEW)',
    pages: newPages,
  };

  const updatedComic: Comic = {
    ...comic,
    chapters: [newChapter, ...comic.chapters],
    isAiGenerated: true,
  };

  const newLog: AiWriterLog = {
    id: `log-${Date.now()}`,
    comicId: comic.id,
    comicTitle: comic.title,
    chapterNumber: nextChapterNum,
    chapterTitle,
    totalPages: 9,
    createdAt: new Date().toLocaleTimeString('th-TH'),
    plotArc: continuity.arcName,
    summary: `เขียนตอนที่ ${nextChapterNum} (9 หน้า) เนื้อเรื่องร้อยเรียงต่อเนื่อง สไตล์นักเขียนมืออาชีพ`,
    cliffhanger: 'ทิ้งปมปริศนากองทัพอสูรบุกเมืองใหญ่ รอการคลี่คลายในตอนต่อไป',
  };

  const existingLogs = getAiWriterLogs();
  saveAiWriterLogs([newLog, ...existingLogs]);

  // Update credit quota
  const currentCredit = getCreditResetStatus();
  localStorage.setItem(AI_CREDIT_RESET_KEY, JSON.stringify({
    ...currentCredit,
    creditsAvailable: Math.max(0, currentCredit.creditsAvailable - 10),
  }));

  return { updatedComic, newLog };
}
