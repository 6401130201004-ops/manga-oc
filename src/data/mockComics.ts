import { Comic, ComicPage } from '../types/comic';
import { generateWebtoonPanelSvg } from '../utils/comicPageGenerator';
import { getClonedImagesForComic } from './clonedMangaPages';
import { buildComprehensiveChapterList, deduplicateComics } from '../utils/chapterGenerator';

// Helper to construct at least 9 high quality pages per chapter using REAL CLONED MANGA IMAGES
function createNinePagesForChapter(
  comicTitle: string,
  chapterNumber: number,
  theme: 'fantasy' | 'action' | 'murim' | 'scifi' | 'mystery' | 'romance',
  heroName: string,
  rivalName: string,
  dialogueScript: { th: string; en: string; original: string }[],
  comicSlug: string = ''
): ComicPage[] {
  const pages: ComicPage[] = [];
  const slugKey = comicSlug || comicTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const realImages = getClonedImagesForComic(slugKey, [theme]);

  const defaultScenes = [
    { mood: 'จุดเริ่มต้นบทใหม่ บรรยากาศเริ่มตึงเครียด', sfx: 'ครืนนน...', speaker: heroName, tone: 'cautious' as const },
    { mood: 'การเผชิญหน้าระหว่างสองขั้วอำนาจ', sfx: 'ฟึ่บ!', speaker: rivalName, tone: 'sinister' as const },
    { mood: 'ปลดปล่อยพลังขั้นแรก คลื่นพลังเริ่มสั่นสะเทือน', sfx: 'เปรี๊ยะ!', speaker: heroName, tone: 'determined' as const },
    { mood: 'แผนการที่ซ่อนไว้ถูกเปิดเผย', sfx: 'หึหึ...', speaker: rivalName, tone: 'sinister' as const },
    { mood: 'การปะทะครั้งใหญ่ระเบิดขึ้นใจกลางสมรภูมิ', sfx: 'ตู๊มมมม!!', speaker: heroName, tone: 'brave' as const },
    { mood: 'การตอบโต้ด้วยความเร็วเหนือเสียง', sfx: 'ฟิ้ววว!!', speaker: rivalName, tone: 'cautious' as const },
    { mood: 'การตื่นรู้ของพลังลับที่หลับใหล', sfx: 'วาบพา!', speaker: heroName, tone: 'brave' as const },
    { mood: 'วิชาไม้ตายขั้นสูงสุดเข้าหักล้าง', sfx: 'ชิ้งงงง!!', speaker: rivalName, tone: 'sinister' as const },
    { mood: 'บทสรุปและเงื่อนงำทิ้งท้ายสุดระทึก', sfx: 'ตึกตัก...', speaker: heroName, tone: 'determined' as const },
  ];

  for (let i = 1; i <= 9; i++) {
    const scene = defaultScenes[i - 1];
    const script = dialogueScript[i - 1] || {
      th: `พลังนี้... มันยังไม่ใช่จุดจบของการต่อสู้! (หน้า ${i})`,
      en: `This power... this is far from over! (Page ${i})`,
      original: `This is page ${i} dialogue.`,
    };

    // Use authentic cloned manga image from real sites
    const realImgUrl = realImages[(i - 1) % realImages.length];
    const proxiedImg = `/api/image-proxy?url=${encodeURIComponent(realImgUrl)}`;

    pages.push({
      id: `p-${slugKey}-ch${chapterNumber}-${i}`,
      pageNumber: i,
      imageUrl: proxiedImg,
      ambientMood: scene.mood,
      bgmPreset: i % 2 === 0 ? 'epic_battle' : 'dungeon_ambient',
      bubbles: [
        {
          id: `b-${chapterNumber}-${i}-1`,
          speaker: scene.speaker,
          gender: 'male',
          tone: scene.tone,
          originalText: script.original,
          th: script.th,
          en: script.en,
          ja: 'この戦いはまだ終わっていない！',
          ko: '이 싸움은 아직 끝나지 않았다!',
          x: i % 2 === 0 ? 12 : 56,
          y: i % 3 === 0 ? 18 : i % 3 === 1 ? 48 : 72,
          width: 32,
          height: 9,
        },
      ],
    });
  }

  return pages;
}

const RAW_INITIAL_COMICS: Comic[] = [
  // 1. Overlord of Insects
  {
    id: 'comic-overlord-insects',
    title: 'Overlord of Insects (ราชาแมลงผู้เรียกภัยพิบัติจากธรรมชาติ)',
    originalTitle: 'Overlord of Insects – 天灾级虫族之主',
    slug: 'overlord-of-insects',
    author: 'Kondog Manga',
    artist: 'Kyoung-Min Studio',
    genres: ['Action', 'Drama', 'Fantasy', 'Manhua', 'Shounen'],
    synopsis: 'ในโลกที่ทุกคนสามารถเปลี่ยนอาชีพได้ เจียงเฉินได้ตื่นขึ้นมาพร้อมกับระบบราชาแมลง กองทัพแมลงนับล้านตัวพร้อมพัฒนาและกลืนกินทุกสิ่ง กลายเป็นภัยพิบัติระดับวันสิ้นโลก',
    coverImage: '/src/assets/images/cover_overlord_insects_1792065720410.jpg',
    rating: 4.8,
    viewCount: 428900,
    status: 'ongoing',
    originalLang: 'zh',
    chapters: [
      {
        id: 'oi-ch-1',
        chapterNumber: 99,
        title: 'ตอนที่ 99',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Overlord of Insects', 99, 'fantasy', 'เจียงเฉิน', 'กิลด์มาสเตอร์',
          [
            { th: 'พวกเจ้าคิดว่าแค่บาเรียกระจอกๆ นี่จะหยุดฝูงแมลงทมิฬของข้าได้งั้นรึ? ไร้เดียงสาเกินไปแล้ว!', en: 'Did you think a flimsy barrier could stop my swarm? Naive!', original: '你们以为区区结界就能挡住我的虫群吗？' },
            { th: 'บ้าน่า! สัตว์อสูรแมลงพวกนี้มันไม่มีอยู่ในสารบบข้อมูลเลยนี่หว่า!', en: 'Impossible! These insects are completely unranked in the guild database!', original: '不可能！这些虫兽根本不在公会数据库里！' },
            { th: 'กลืนกินพวกมันซะ... จงเพิ่มจำนวนขึ้นเรื่อยๆ จนบดบังท้องฟ้า!', en: 'Devour them all... Multiply until the heavens themselves are eclipsed!', original: '吞噬他们……无限繁殖吧！' },
            { th: 'รายงานด่วน! ฝูงแมลงระดับมหากาฬกำลังล้อมฐานทัพทิศเหนือไว้หมดแล้ว!', en: 'Emergency dispatch! The dark swarm has completely surrounded Sector 4!', original: '紧急求援！黑潮虫群已经彻底包围第四区！' },
            { th: 'นี่คือบทลงโทษของคนที่กล้าแตะต้องคนของข้า... ตายซะ!', en: 'This is retribution for touching those under my protection... Perish!', original: '敢动我的人，这就是你们的下场……受死吧！' },
            { th: 'อ้ากกก! ปราณป้องกันแตกเป็นเสี่ยงๆ แล้ว ถอยเร็วเข้า!', en: 'Aargh! My core barrier has shattered! Fall back immediately!', original: '啊啊啊！我的护体真元碎了！快撤退！' },
            { th: 'สายเกินไปแล้ว... ทั้งพื้นที่นี้กลายเป็นรังแมลงของข้าไปเรียบร้อย', en: 'Too late... This whole valley has already become my hunting nest.', original: '太迟了……这整座峡谷早已成为我的巢穴。' },
            { th: 'บอสใหญ่ปรากฏตัวแล้วหรือ? กลิ่นอายความตายนี้มันระดับลอร์ด!', en: 'Has the brood lord awakened? This murderous aura is tyrannical!', original: '虫母现身了？这股杀戮之气简直令人窒息！' },
            { th: 'การปฏิวัติแห่งยุคสมัยเริ่มต้นขึ้นแล้ว... โลกใบนี้จะต้องสยบต่อข้า!', en: 'The revolution of this era has begun... This world shall bow to the Swarm!', original: '属于我的时代开始了……世界将对我俯首称臣！' },
          ]
        ),
      },
    ],
  },

  // 2. Isekai Kara Elf-san
  {
    id: 'comic-elf-isekai',
    title: 'Isekai Kara Elf-san ga Ochite Kita no Desu ga (เอลฟ์สาวตกมาจากต่างโลก)',
    originalTitle: 'Isekai Kara Elf-san ga Ochite Kita no Desu ga',
    slug: 'isekai-kara-elf-san-ga-ochite-kita-no-desu-ga',
    author: 'Haruto Yagami',
    artist: 'Mifuyu Studio',
    genres: ['Comedy', 'Fantasy', 'Isekai', 'Romance', 'Manga'],
    synopsis: 'เรื่องราวของหนุ่มพนักงานออฟฟิศธรรมดาที่วันหนึ่งมีสาวเอลฟ์แสนสวยตกลงมาจากฟากฟ้าทะลุหลังคาห้องเช่า การใช้ชีวิตร่วมกันในโลกปัจจุบันจึงเริ่มขึ้นพร้อมความป่วนและหวานละมุน',
    coverImage: '/src/assets/images/cover_elf_isekai_1792065720024.jpg',
    rating: 4.7,
    viewCount: 312400,
    status: 'ongoing',
    originalLang: 'ja',
    chapters: [
      {
        id: 'elf-ch-1',
        chapterNumber: 28,
        title: 'ตอนที่ 28',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Elf-san ga Ochite Kita', 28, 'romance', 'คาซึมะ', 'ลูเมียร่า (เอลฟ์)',
          [
            { th: 'กรี๊ดดด! ที่นี่มันที่ไหนกันคะเนี่ย?! แล้วทำไมท้องฟ้าถึงกลายเป็นเพดานปูนไปได้?!', en: 'Kyaaa! Where is this place?! Why is the sky made of concrete?!', original: 'きゃー！ここは一体どこですか？！' },
            { th: 'เฮ้ยยย! หลังคาห้องผมทะลุเป็นรูเลย แล้วคุณเป็นใครกันเนี่ย มีหูแหลมๆ ด้วย?!', en: 'Whoa! My apartment ceiling is destroyed! And who are you with those pointy ears?!', original: 'うわぁぁ！天井に大穴が？！君は誰なんだ？！' },
            { th: 'ขะ...ขออภัยด้วยค่ะ! ข้าคือนักเวทแห่งป่าพฤกษา ลูเมียร่า บังเอิญเกิดความผิดพลาดในวงเวทเคลื่อนย้ายค่ะ', en: 'I-I am so sorry! I am Lumiera, mage of the forest, there was a spatial teleport mishap!', original: 'も、申し訳ありません！私はエルフの魔導士ルミエラと申します！' },
            { th: 'เวทมนตร์อะไรกัน... นี่ยุคเรวะแล้วนะคุณ! ค่าซ่อมหลังคาใครจะจ่ายล่ะเนี่ย?!', en: 'Magic? This is modern Tokyo! Who is going to pay for this ceiling?!', original: '魔法って…現代東京ですよ？！修理代はどうするんですか？！' },
            { th: 'มะ...ไม่มีเงินของโลกนี้เลยค่ะ แต่ถ้าเป็นมนตราเสกดอกไม้บานพอจะใช้แทนได้ไหมคะ?', en: 'I have no currency of this realm, but could my flower bloom spell suffice?', original: 'こ、この世界のお金はありませんが、花を咲かせる魔法なら…！' },
            { th: 'ใช้ไม่ได้โว้ยยย! แต่เอาเถอะ หิวข้าวใช่ไหมเนี่ย เสียงท้องร้องดังลั่นเชียว', en: 'Of course not! But fine... are you starving? Your stomach just growled loudly.', original: 'ダメに決まってるだろ！でも…お腹が空いてるのか？' },
            { th: 'งั่ม! อร่อยยย! สิ่งที่เรียกว่า "บะหมี่กึ่งสำเร็จรูป" นี่มันอาหารระดับทิพย์สวรรค์ชัดๆ!', en: 'Munch! Delicious!! Is this instant ramen food of the gods?!', original: '美味しいー！カップ麺ってこんなに美味しいのですか？！' },
            { th: 'แค่บะหมี่ซองละ 7 บาทเองนะ... ท่าทางชีวิตนับจากนี้ของผมจะไม่ธรรมดาซะแล้วสิ', en: 'It is just a 70-yen noodle cup... My ordinary days are definitely over.', original: 'たったの70円なんだけどな…これから大変なことになりそうだ。' },
            { th: 'ได้โปรดให้ข้าพักที่นี่ชั่วคราวนะคะท่านคาซึมะ! ข้าสัญญาว่าจะช่วยทำความสะอาดห้องให้ค่ะ!', en: 'Please let me stay here, Kazuma-san! I promise to clean the apartment!', original: 'どうかここに置いてください、カズマ様！一生懸命お掃除します！' },
          ]
        ),
      },
    ],
  },

  // 3. Solo Leveling
  {
    id: 'comic-solo-leveling',
    title: 'Solo Leveling: Ragnarok (จุติใหม่ราชันย์เงา)',
    originalTitle: '나 혼자만 레벨업 : 라그나로크',
    slug: 'solo-leveling',
    author: 'Chugong & Redice Studio',
    artist: 'DISCIPLES',
    genres: ['Action', 'Fantasy', 'Manhwa', 'Shounen'],
    synopsis: 'เมื่อภัยพิบัติครั้งใหม่จากนอกจักรวาลคืบคลานเข้าสู่โลก ซองซูโฮ บุตรชายแห่งราชันย์เงาซองจินอู ได้ตื่นขึ้นพร้อมพลังสืบทอด และเผชิญหน้ากับเควสต์แห่งชะตากรรม',
    coverImage: '/src/assets/images/cover_solo_leveler_1792064406068.jpg',
    rating: 4.9,
    viewCount: 890400,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'sl-ch-1',
        chapterNumber: 24,
        title: 'ตอนที่ 24',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Solo Leveling Ragnarok', 24, 'action', 'ซองซูโฮ', 'ราชามอนสเตอร์',
          [
            { th: '[ระบบ: ยินดีต้อนรับ ผู้สืบทอดบัลลังก์แห่งเงา]', en: '[System: Welcome, Heir to the Shadow Monarch]', original: '[시스템: 그림자 군주의 계승자여, 환영합니다]' },
            { th: 'หน้าต่างเควสต์สีฟ้า... เหมือนกับที่คุณพ่อเคยเล่าให้ฟังเป๊ะเลย!', en: 'A blue floating quest window... Just like father used to describe!', original: '파란색 퀘스트 창... 아버지가 말씀하시던 그대로야!' },
            { th: 'จงตื่นขึ้น... กองทัพเงาของข้า!', en: 'Arise... Soldiers of the Shadow!', original: '일어나라... 나의 그림자들이여!' },
            { th: 'โฮกกก! มอนสเตอร์ระดับบอสกำลังบุกทะลวงเกทออกมาแล้ว!', en: 'Roaaar! The dungeon boss is breaking through the spatial gate!', original: '크아악! 던전 보스가 게이트를 뚫고 나오고 있다!' },
            { th: 'สกัดกั้นมันไว้! ฉันจะไม่ยอมให้ใครในเมืองนี้ต้องเป็นอันตรายเด็ดขาด!', en: 'Hold the frontline! I won’t let anyone in this city get harmed!', original: '막아서라! 이 도시의 누구도 다치게 두지 않는다!' },
            { th: 'ความเร็วระดับนี้... มองตามไม่ทันเลย! เขาเป็นฮันเตอร์แรงก์อะไรกันแน่?!', en: 'That insane speed... I can’t track him! What rank hunter is he?!', original: '저 말도 안 되는 속도는 뭐지?! 대체 몇 랭크 헌터인 거야?!' },
            { th: 'ดาบคู่เงาทมิฬ... ตัดผ่านเกราะหนาของมันได้เหมือนผ่าเต้าหู้!', en: 'Dual shadow blades... Slicing through heavy dragon scales like butter!', original: '그림자 쌍검... 두꺼운 용 비늘을 두부 베듯 가르고 있어!' },
            { th: '[ระบบ: เลเวลอัป! พลังโจมตีและค่าสถานะเพิ่มขึ้นอย่างก้าวกระโดด]', en: '[System: Level Up! Stats and attack potency have surged!]', original: '[시스템: 레벨 업! 스탯이 대폭 상승했습니다]' },
            { th: 'นี่เป็นเพียงแค่จุดเริ่มต้น... บัลลังก์เงาจะกลับมายิ่งใหญ่อีกครั้ง!', en: 'This is merely the beginning... The Monarch’s throne shall reign supreme!', original: '이건 시작에 불과해... 그림자의 군단은 다시 위대해질 것이다!' },
          ]
        ),
      },
    ],
  },

  // 4. Lookism
  {
    id: 'comic-lookism',
    title: 'Lookism (ปาฏิหาริย์สองร่าง สตรีทไฟต์เตอร์)',
    originalTitle: '외모지상주의 - Lookism',
    slug: 'lookism',
    author: 'Park Tae-jun',
    artist: 'PTJ Company',
    genres: ['Action', 'Drama', 'Manhwa', 'Shounen'],
    synopsis: 'ปาร์คฮยองซอก เด็กหนุ่มที่ถูกกลั่นแกล้งอย่างหนัก ตื่นขึ้นมาพบว่าตัวเองมีร่างใหม่ที่หล่อเหลาและแข็งแกร่งสมบูรณ์แบบ ท่ามกลางสงครามสตรีทไฟต์และ 4 จตุรเทพ',
    coverImage: '/src/assets/images/cover_solo_leveler_1792064406068.jpg',
    rating: 4.8,
    viewCount: 654200,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'lookism-ch-1',
        chapterNumber: 524,
        title: 'ตอนที่ 524',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Lookism', 524, 'action', 'ฮยองซอก', 'จงกอน',
          [
            { th: 'กระจกบ้านั่น... คนในกระจกที่สูง 180 ซม. หน้าตาไร้ที่ตินี่คือใครกัน?!', en: 'That mirror... Who is this flawless guy staring back at me?!', original: '거울 속의 이 완벽한 녀석은 대체 누구야?!' },
            { th: 'แล้วร่างเดิมของเราทำไมยังนอนหลับอยู่บนฟูกอีกล่ะ?! เกิดอะไรขึ้นกันแน่!', en: 'And why is my original body still asleep on the mattress?! What is this?!', original: '그리고 내 원래 몸은 왜 여전히 바닥에서 자고 있는 거지?!' },
            { th: 'ก้าวขาแค่นิดเดียว ความเร็วและความสมดุลกลับน่าเหลือเชื่อ!', en: 'Just one step, yet the speed and kinetic balance are unbelievable!', original: '가볍게 발을 내딛었을 뿐인데, 믿을 수 없는 밸런스야!' },
            { th: 'เฮ้ย เจ้าเด็กใหม่! มายืนเกะกะหน้าร้านสะดวกซื้อทำไมวะ อยากโดนดีเหรอ?!', en: 'Hey new kid! Why are you blocking the shop entrance? Want a fight?!', original: '야 전학생! 편의점 앞에서 폼 잡지 마라. 한 대 맞을래?!' },
            { th: 'ผมไม่ได้อยากมีเรื่อง... แต่ทำไมหมัดของนายมันดูช้าไปหมดเลยล่ะ?', en: 'I don’t want trouble... but why does your punch look so slow?', original: '싸우고 싶지 않지만... 왜 네 주먹이 이렇게 느리게 보이지?' },
            { th: 'ผัวะะะ! โดนสวนกลับด้วยหมัดตรงดอกเดียว สลบเหมือดกลางอากาศ!', en: 'Smash! Countered by a clean straight jab, knocked cold mid-air!', original: '퍽! 단 한 방의 카운터로 그대로 기절하다니!' },
            { th: 'หมัดนี้... มันคือสัญชาตญาณการต่อสู้ระดับอัจฉริยะที่ซ่อนอยู่ในร่างนี้!', en: 'This strike... A monstrous fighting instinct embedded in this body!', original: '이 타격감은... 이 육체에 깃든 천재적인 격투 본능이다!' },
            { th: 'น่าสนใจดีนี่... ดูเหมือนว่าโรงเรียนแจวอนจะมีสัตว์ประหลาดตัวใหม่โผล่มาแล้วสิ', en: 'How interesting... Looks like J High has welcomed another monster.', original: '흥미롭군... 재원고에 새로운 괴물이 나타난 모양이군.' },
            { th: 'ชีวิตใหม่นี้... ผมจะไม่ยอมตกเป็นเบี้ยล่างให้ใครข่มเหงอีกต่อไป!', en: 'In this new life... I will never bow down or be bullied again!', original: '이 새로운 삶에서는... 절대로 다시 짓밟히지 않겠어!' },
          ]
        ),
      },
    ],
  },

  // 5. Magic Emperor
  {
    id: 'comic-magic-emperor',
    title: 'Magic Emperor (จักรพรรดิอสูรคืนบัลลังก์)',
    originalTitle: '魔皇大管家 - Demonic Emperor',
    slug: 'magic-emperor',
    author: 'Ye Xiao',
    artist: 'Wuer Manhua',
    genres: ['Action', 'Fantasy', 'Manhua', 'Murim'],
    synopsis: 'จัวอี้ฟาน มหาจักรพรรดิอสูรถูกทรยศและเสียชีวิต ทว่าวิญญาณกลับมาเกิดใหม่ในร่างของคนรับใช้ตระกูลลั่ว การใช้เล่ห์เหลี่ยมและวิถีมารทวงคืนบัลลังก์จึงปะทุขึ้น',
    coverImage: '/src/assets/images/cover_murim_blade_1792064406380.jpg',
    rating: 4.8,
    viewCount: 521900,
    status: 'ongoing',
    originalLang: 'zh',
    chapters: [
      {
        id: 'me-ch-1',
        chapterNumber: 592,
        title: 'ตอนที่ 592',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Magic Emperor', 592, 'murim', 'จัวอี้ฟาน', 'ผู้นำตระกูลซุน',
          [
            { th: 'ข้าคือจักรพรรดิอสูรผู้ยิ่งใหญ่ แต่กลับต้องมาอยู่ในร่างคนรับใช้ไร้พลังเนี่ยนะ?!', en: 'I am the supreme Demonic Emperor, yet reborn as a powerless servant?!', original: '本皇堂堂魔皇卓一凡，居然重生在一个无用下人身上？！' },
            { th: 'เจ้าสวะจัวฝาน! กล้าดียังไงไม่ยอมคุกเข่าต่อหน้าข้าตระกูลซุน?!', en: 'Trash servant! How dare you refuse to kneel before our Sun Clan?!', original: '狗奴才！见到我孙家少爷还不下跪？！' },
            { th: 'ให้ข้าคุกเข่า? แม้แต่สวรรค์เบื้องบนยังไม่คู่ควรให้ข้าก้มหัวเลย!', en: 'Kneel? Even the high heavens lack the right to make me bow!', original: '让本皇下跪？九天十地，没人有这个资格！' },
            { th: 'เนตรมารกลืนวิญญาณ... จงสำแดงเดชกลืนกินชีพจรของเจ้าซะ!', en: 'Demonic Soul Pupil... Devour their internal meridians!', original: '天魔噬魂，给我化为灰烬！' },
            { th: 'อ๊ากกก! พลังลมปราณของข้าถูกดูดออกไปหมดแล้ว มันเป็นปีศาจ!', en: 'Aargh! My true Qi is being drained dry! He is a demon!', original: '啊啊啊！我的修为……被吸干了！怪物啊！' },
            { th: 'แผนการของข้าไม่มีคำว่าเมตตา... ใครขวางทาง ต้องพินาศ!', en: 'Mercy does not exist in my lexicon... All obstacles shall crumble!', original: '阻挡本皇之路者，杀无赦！' },
            { th: 'ตระกูลลั่วที่กำลังจะล่มสลาย... ข้าจะเป็นคนยกมันขึ้นเป็นมหาอำนาจเอง!', en: 'This crumbling Luo Clan... I will forge it into the supreme sovereign!', original: '风雨飘摇的洛家……由本皇一手带上巅峰！' },
            { th: 'กลิ่นอายมารทมิฬนี้มันช่างทรงพลังเกินกว่าที่ผู้ใดจะคาดคิด!', en: 'This demonic aura is far more potent than any mortal can fathom!', original: '这股魔道霸气，绝非等闲之辈！' },
            { th: 'รอก่อนเถิดพวกทรยศ... วันที่ข้ากลับไปทวงแค้นใกล้เข้ามาแล้ว!', en: 'Wait for me, traitors... The day of reckoning draws near!', original: '背叛本皇的人，洗净脖子等着吧！' },
          ]
        ),
      },
    ],
  },

  // 6. Nano Machine
  {
    id: 'comic-nano-machine',
    title: 'Nano Machine (นาโนมาชีนสะท้านบู๊ลิ้ม)',
    originalTitle: '나노 마신 - Nano Machine',
    slug: 'nano-machine',
    author: 'Jeolmu Hyeon',
    artist: 'GGBG',
    genres: ['Action', 'Murim', 'Sci-Fi', 'Manhwa'],
    synopsis: 'ชอนยออุน องค์ชายลูกเมียน้อยแห่งพรรคมารที่ถูกปองร้าย ได้รับการฉีดหุ่นยนต์นาโนแห่งอนาคตเข้าสู่กระแสเลือด การวิเคราะห์กระบวนท่าและเรียนรู้วรยุทธ์จึงก้าวล้ำเกินจินตนาการ',
    coverImage: '/src/assets/images/cover_murim_blade_1792064406380.jpg',
    rating: 4.9,
    viewCount: 689000,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'nano-ch-1',
        chapterNumber: 228,
        title: 'ตอนที่ 228',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Nano Machine', 228, 'murim', 'ชอนยออุน', 'นาโน AI',
          [
            { th: '[ระบบนาโนแมชีน: ยืนยันรหัสพันธุกรรมบรรพบุรุษรุ่นที่ 7 เริ่มการผสานร่าง]', en: '[Nano Machine: DNA confirmed. Beginning bio-fusion]', original: '[나노 머신: 조상님 유전자 일치. 융합을 시작합니다]' },
            { th: 'เสียงประหลาดในหัวนี้คืออะไรกัน?! ร่างกายที่เคยบาดเจ็บสาหัสกำลังฟื้นฟูอย่างรวดเร็ว!', en: 'What is this mechanical voice in my head?! My severe wounds are regenerating!', original: '머릿속의 이 기묘한 목소리는 뭐지?! 중상이었던 몸이 순식간에 회복되고 있어!' },
            { th: '[ตรวจพบจุดชีพจรที่ถูกปิดกั้น ทำการทะลวงจุดด้วยคลื่นแม่เหล็กไฟฟ้า]', en: '[Blocked meridians detected. Cleansing via electromagnetic pulses]', original: '[막힌 혈도 감지. 미세 나노 전류로 개혈 작업을 시작합니다]' },
            { th: 'ลมปราณไหลเวียนคล่องอย่างที่ไม่เคยเป็นมาก่อน... นี่มันปาฏิหาริย์ชัดๆ!', en: 'Internal Qi is coursing through my veins like never before... A miracle!', original: '내공의 흐름이 이토록 원활하다니... 이건 기적이다!' },
            { th: 'พวกเจ้าคิดจะลอบสังหารข้าในป่าลึกงั้นรึ? ช่างไม่รู้จักเจียมตัว!', en: 'Did you assassins really think you could kill me in these dark woods?', original: '감히 날 이곳에서 암살하려 들다니, 분수를 모르는구나!' },
            { th: '[ระบบสแกนกระบวนท่า: คาดการณ์วิถีดาบศัตรู 100% แสดงจุดอ่อน]', en: '[Stance Analysis: Enemy trajectory mapped. Weak points highlighted]', original: '[초식 분석 완료: 적의 도법 궤적 100% 예측. 약점 표시]' },
            { th: 'ชิ้งงง! เพียงแค่ฟันครั้งเดียว คมดาบตัดผ่านช่องว่างกระบวนท่าอย่างแม่นยำ!', en: 'Slash! A single strike pierces flawlessly through the gap in his guard!', original: '챙! 단 한 번의 검격으로 빈틈을 완벽하게 꿰뚫었다!' },
            { th: 'เจ้า... เจ้าเรียนรู้วิชาดาบขั้นสูงนี้มาจากไหนกัน?!', en: 'You... where did you master such profound swordplay?!', original: '네놈... 대체 어디서 그런 극상의 검술을 익힌 것이냐?!' },
            { th: 'พรรคมารจะต้องมีผู้สืบทอดที่แท้จริง... และคนๆ นั้นก็คือข้า!', en: 'The Demonic Cult must have a true lord... and that lord is ME!', original: '마교의 진정한 후계자는... 오직 나뿐이다!' },
          ]
        ),
      },
    ],
  },

  // 7. Omniscient Reader
  {
    id: 'comic-orv',
    title: 'Omniscient Reader (มุมมองนักอ่านพระเจ้า)',
    originalTitle: '전지적 독자 시점 - Omniscient Reader’s Viewpoint',
    slug: 'omniscient-reader',
    author: 'sing N song',
    artist: 'Sleepy-C',
    genres: ['Action', 'Fantasy', 'Manhwa', 'Psychological'],
    synopsis: 'คิมดกจา พนักงานบริษัทธรรมดาผู้เป็นนักอ่านเพียงคนเดียวที่อ่านนิยาย "สามวิธีรอดในโลกาวินาศ" จนจบ วันที่โลกกลายเป็นฉากเดียวกับในนิยาย เขารู้เรื่องราวทั้งหมดที่จะเกิดขึ้น',
    coverImage: '/src/assets/images/cover_solo_leveler_1792064406068.jpg',
    rating: 4.9,
    viewCount: 940000,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'orv-ch-1',
        chapterNumber: 231,
        title: 'ตอนที่ 231',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Omniscient Reader', 231, 'mystery', 'คิมดกจา', 'โทแกบี (พิกัก)',
          [
            { th: '[โทแกบี: บริการฟรีสำหรับเผ่าพันธุ์มนุษย์ได้สิ้นสุดลงแล้ว ซีนาริโอหลักเริ่มต้นขึ้น ณ บัดนี้]', en: '[Dokkaebi: The free service for humanity has ended. Main scenario commences]', original: '[도깨비: 인류를 위한 무료 서비스는 종료되었습니다. 메인 시나리오가 시작됩니다]' },
            { th: 'รถไฟใต้ดินสาย 3 หยุดกะทันหัน... ฉากเปิดที่เหมือนกับในนิยายเป๊ะ!', en: 'Subway line 3 came to an abrupt halt... Exactly the novel’s opening scene!', original: '지하철 3호선이 멈췄다... 소설 속 도입부와 완벽히 똑같아!' },
            { th: '[ซีนาริโอหลัก #1: พิสูจน์คุณค่า - สังหารสิ่งมีชีวิตอย่างน้อยหนึ่งตัวเพื่อเอาชีวิตรอด]', en: '[Main Scenario #1: Prove Value - Kill one living creature to survive]', original: '[메인 시나리오 #1: 가치 증명 - 생명체 하나를 죽여 살아남으십시오]' },
            { th: 'ทุกคนในขบวนเริ่มคลุ้มคลั่งและทำร้ายกันเอง... แต่ฉันรู้ทางออกที่ไม่ต้องฆ่าคน!', en: 'Panic breaks out as people fight each other... But I know a bloodless way!', original: '사람들이 패닉에 빠져 서로를 공격하기 시작했다... 하지만 난 방법을 알아!' },
            { th: 'ตั๊กแตนในกล่องจับแมลงของเด็กคนนั้น... มันก็ถือว่าเป็นสิ่งมีชีวิตเหมือนกัน!', en: 'The grasshopper inside that kid’s insect cage... It qualifies as a lifeform!', original: '저 아이의 채집통 속 메뚜기... 그것도 엄연한 생명체다!' },
            { th: 'เป๊าะ! [ท่านได้สังหารสิ่งมีชีวิตสำเร็จ ได้รับ 300 เหรียญดาว]', en: 'Snap! [You have eliminated a living organism. 300 Star Coins awarded]', original: '톡! [생명체를 처치하셨습니다. 300 코인을 획득했습니다]' },
            { th: '[กลุ่มดาว "มังกรทมิฬแห่งเพลิงนรก" รู้สึกประหลาดใจกับการกระทำของท่าน]', en: '[Constellation "Abyssal Black Flame Dragon" is amused by your wit]', original: '[성좌, 심연의 흑염룡이 당신의 행동에 흥미를 보입니다]' },
            { th: 'โลกใบนี้กลายเป็นนิยายไปแล้ว... และมีเพียงฉันคนเดียวที่รู้ตอนจบของมัน!', en: 'This world has become the novel... and I alone know its final chapter!', original: '세상은 소설이 되었고... 그 결말을 아는 것은 오직 나뿐이다!' },
            { th: 'ยูจุงฮยอก... ตัวเอกของเรื่องนี้ ฉันกำลังจะไปหานายแล้ว!', en: 'Yoo Joonghyuk... The protagonist of this world, I am coming for you!', original: '유중혁... 이 세계의 주인공, 내가 곧 찾아가겠다!' },
          ]
        ),
      },
    ],
  },

  // 8. The Beginning After the End
  {
    id: 'comic-tbate',
    title: 'The Beginning After the End (จุดเริ่มต้นหลังจุดจบ)',
    originalTitle: 'The Beginning After the End',
    slug: 'the-beginning-after-the-end',
    author: 'TurtleMe',
    artist: 'Fuyuki23',
    genres: ['Action', 'Adventure', 'Fantasy', 'Manhwa'],
    synopsis: 'กษัตริย์เกรย์ ผู้ครอบครองพลังและอำนาจสูงสุดแต่โดดเดี่ยว เสียชีวิตอย่างลึกลับและได้มาเกิดใหม่เป็น "อาร์เธอร์ เลย์วิน" ในโลกแห่งเวทมนตร์และการประลองดาบ',
    coverImage: '/src/assets/images/cover_solo_leveler_1792064406068.jpg',
    rating: 4.8,
    viewCount: 489000,
    status: 'ongoing',
    originalLang: 'en',
    chapters: [
      {
        id: 'tbate-ch-1',
        chapterNumber: 185,
        title: 'ตอนที่ 185',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'TBATE', 185, 'fantasy', 'อาร์เธอร์', 'สัตว์อสูรเงา',
          [
            { th: 'ในชีวิตก่อนข้าคือกษัตริย์ผู้ยืนอยู่จุดสูงสุด... บัดนี้ข้ากลับกลายเป็นทารกแรกเกิด!', en: 'In my past life, I was a king at the pinnacle... now a newborn baby!', original: 'In my past life I stood at the peak, now reborn as a baby!' },
            { th: 'การสัมผัสละอองมานาในอากาศรอบตัว... ช่างบริสุทธิ์และหนาแน่นเหลือเกิน', en: 'Sensing mana particles in the ambient air... pure and dense.', original: 'The ambient mana particles here are remarkably pure.' },
            { th: 'รวบรวมมานาเข้าสู่แก่นพลังในอก... เริ่มต้นการขัดเกลาแก่นมานาขั้นแรก!', en: 'Condensing mana into the core... Initiating initial core formation!', original: 'Condensing mana into my sternum to awaken the core early!' },
            { th: 'เปรี๊ยะะะ! คลื่นแสงหลากสีระเบิดออกมาจากร่างน้อยๆ ของอาร์เธอร์!', en: 'Crack! A prism of elemental light detonates from young Arthur!', original: 'Crack! An elemental shockwave ripples out from young Art!' },
            { th: 'คุณคะ! ดูลูกของเราสิ แก่นมานาตื่นขึ้นตั้งแต่อายุยังไม่ถึง 3 ขวบ!', en: 'Dear! Look at our boy! He has awakened a mana core before age three!', original: 'Honey! Look at our child, he awakened before even turning three!' },
            { th: 'นี่มันอัจฉริยะในรอบพันปีชัดๆ! ลูกเราจะเป็นนักเวทที่ยิ่งใหญ่ที่สุด!', en: 'A once-in-a-millennium prodigy! He will surpass all mages!', original: 'A generational prodigy! He will become an unprecedented battle mage!' },
            { th: 'โลกใบใหม่นี้ช่างกว้างใหญ่นัก... ความลับของทวีปเอเฟโอตัสรอข้าอยู่', en: 'This new world is vast... The mysteries of Epheotus await.', original: 'This realm is vast... Mysteries of the Asuras await.' },
            { th: 'ดาบเล่มนี้จะปกป้องครอบครัวที่ข้ารักในชาตินี้!', en: 'This blade shall safeguard the family I cherish in this lifetime!', original: 'My blade will protect the family I love in this life!' },
            { th: 'การผจญภัยของอาร์เธอร์ เลย์วิน ได้เริ่มต้นขึ้นแล้ว!', en: 'The journey of Arthur Leywin has officially begun!', original: 'The legend of Arthur Leywin begins now!' },
          ]
        ),
      },
    ],
  },

  // 9. Martial Peak
  {
    id: 'comic-martial-peak',
    title: 'Martial Peak (ยอดปรมาจารย์แห่งยุทธภพ)',
    originalTitle: '武炼巅峰 - Martial Peak',
    slug: 'martial-peak',
    author: 'Momo',
    artist: 'Pikapi',
    genres: ['Action', 'Fantasy', 'Manhua', 'Murim'],
    synopsis: 'หยางไค่ ศิษย์กวาดลานแห่งหอฝึกยุทธหลิงเซียว ได้รับคัมภีร์สีดำลึกลับ นำพาเขาก้าวสู่เส้นทางแห่งการบำเพ็ญเพียรที่ไร้จุดสิ้นสุดเพื่อก้าวสู่จุดสูงสุดแห่งยุทธภพ',
    coverImage: '/src/assets/images/cover_murim_blade_1792064406380.jpg',
    rating: 4.7,
    viewCount: 780000,
    status: 'ongoing',
    originalLang: 'zh',
    chapters: [
      {
        id: 'mp-ch-1',
        chapterNumber: 3780,
        title: 'ตอนที่ 3780',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Martial Peak', 3780, 'murim', 'หยางไค่', 'ศิษย์พี่ฝ่ายนอก',
          [
            { th: 'ข้าเป็นแค่ศิษย์กวาดลานที่ทุกคนต่างดูถูก... แต่หัวใจของข้าไม่เคยยอมแพ้!', en: 'They look down on me as a sweeper disciple... But my will never yields!', original: '我虽是扫地弟子，但追求武道巅峰之心从未改变！' },
            { th: 'ศิษย์น้องหยาง! ประลองกับข้าอีกครั้ง คราวนี้ข้าจะอัดเจ้าให้ลุกไม่ขึ้น!', en: 'Junior Yang! Challenge me again, this time you won’t stand back up!', original: '杨开，今日再来战一场，看你还能撑多久！' },
            { th: 'คัมภีร์สีดำในร่างเริ่มส่องประกาย... หลอมรวมกระดูกทองคำศักดิ์สิทธิ์!', en: 'The Black Book awakens within... Forging the golden unyielding skeleton!', original: '无字黑书发光了……融合傲骨金身！' },
            { th: 'ความเจ็บปวดกลายเป็นพลัง! ร่างกายของข้าแข็งแกร่งดั่งเหล็กกล้า!', en: 'Pain transforms into pure power! My body is tempering like divine steel!', original: '痛楚化为力量！这副肉身坚不可摧！' },
            { th: 'ผัวะะ! หมัดของหยางไค่ซัดศิษย์พี่ฝ่ายนอกกระเด็นไปไกลนับสิบก้าว!', en: 'Pow! Yang Kai’s counter sends the outer disciple flying ten paces back!', original: '砰！杨开一拳轰出，外门师兄倒飞数丈！' },
            { th: 'บ้าน่า! เจ้าคนไร้ประโยชน์นี่ทำไมถึงมีพลังหมัดรุนแรงขนาดนี้?!', en: 'Impossible! How can this useless discard possess such ferocious force?!', original: '不可能！这废柴怎会有如此凶悍的拳劲？！' },
            { th: 'เปลวเพลิงหยางแท้จริงได้จุติลงในตันเถียนของข้าแล้ว!', en: 'True Yang Qi has ignited within my core dantian!', original: '真阳之火，已在丹田凝聚！' },
            { th: 'เส้นทางยุทธ์นี้ยาวไกล... ข้าจะปีนป่ายไปจนถึงยอดเขาที่สูงที่สุด!', en: 'The martial path is boundless... I will scale the highest peak of all!', original: '武道漫漫，吾必将登临巅峰！' },
            { th: 'ยุทธภพอันกว้างใหญ่ จงเตรียมรับการมาถึงของหยางไค่!', en: 'Vast universe of martial dao, bear witness to Yang Kai’s rise!', original: '大千世界，见证杨开的崛起吧！' },
          ]
        ),
      },
    ],
  },

  // 10. The Player That Can't Level Up
  {
    id: 'comic-player-returned',
    title: 'The Player That Can’t Level Up (ผู้เล่นไร้เลเวลกับดาบวิญญาณ)',
    originalTitle: '레벨업 못하는 플레이어',
    slug: 'the-player-that-cant-level-up',
    author: 'Aven',
    artist: 'Studio Khit',
    genres: ['Action', 'Fantasy', 'Manhwa', 'Shounen'],
    synopsis: 'คิมกีคยู ได้รับการปลุกพลังเป็นเพลเยอร์ตั้งแต่อายุ 18 แต่ผ่านไป 5 ปี เลเวลของเขากลับค้างอยู่ที่เลเวล 1 ตลอดกาล จนกระทั่งเขาได้พบกับอาวุธวิญญาณ "เอล" และ "ลู"',
    coverImage: '/src/assets/images/cover_solo_leveler_1792064406068.jpg',
    rating: 4.8,
    viewCount: 412000,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'pk-ch-1',
        chapterNumber: 170,
        title: 'ตอนที่ 170',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Player Cant Level Up', 170, 'action', 'กีคยู', 'เอล (ดาบศักดิ์สิทธิ์)',
          [
            { th: '5 ปีแล้ว... เลเวลของฉันยังคงหยุดอยู่ที่เลเวล 1 ไม่ขยับไปไหนเลย', en: 'Five whole years... My status is still eternally stuck at Level 1.', original: '5년이나 지났는데... 내 레벨은 여전히 1에서 멈춰 있어.' },
            { th: 'แต่สิ่งที่ฉันได้รับมาแทนค่าสเตตัส คือความสามารถในการสื่อสารกับอาวุธเอโก้!', en: 'Yet in exchange for level growth, I unlocked synchrony with Ego relics!', original: '하지만 대신 얻은 것은... 에고 무기와의 공명 능력!' },
            { th: '[ดาบเอโก้ เอล: นายท่าน! ข้าสัมผัสได้ถึงศัตรูด้านหน้า ให้ข้าได้ฟันมันเถิด!]', en: '[Ego Sword Lou: Master! Enemies ahead, let me cleave them!]', original: '[에고 소드 엘: 주인님! 앞쪽의 적을 베어버리겠습니다!]' },
            { th: 'ดาบมีชีวิต... ฟาดฟันตัดผ่านบาเรียมอนสเตอร์ได้อย่างง่ายดาย!', en: 'A living blade... Slicing effortlessly through high-tier barriers!', original: '살아있는 검... 몬스터의 장벽을 두부 자르듯 갈라버린다!' },
            { th: 'พลังของฉันไม่ได้มาจากเลเวล... แต่มันมาจากการเติบโตของอาวุธวิญญาณ!', en: 'My strength doesn’t depend on levels... It thrives on Ego weapon evolution!', original: '내 힘은 레벨이 아닌... 에고 무기들의 무한한 성장에서 나온다!' },
            { th: 'เจ้าเลเวล 1 นั่นมันล้มบอสชั้นที่ 20 ด้วยตัวคนเดียวได้ยังไงกัน?!', en: 'How could a mere Level 1 soloist bring down the 20th floor boss?!', original: '고작 레벨 1짜리가 어떻게 20층 보스를 단신으로 쓰러뜨린 거지?!' },
            { th: 'พวกมันประเมินฉันต่ำเกินไป... ตอนนี้ได้เวลาลุยต่อแล้ว เอล!', en: 'They underestimated us... Time to plunge deeper, Elle!', original: '그들은 우릴 얕봤어... 가자, 엘! 더 깊은 탑으로!' },
            { th: 'อาวุธเอโก้ชิ้นที่สองกำลังตอบรับเสียงเรียกของกีคยู!', en: 'The second Ego relic is awakening to Gi-gyu’s resonance!', original: '두 번째 에고 유물이 기규의 부름에 공명하기 시작했다!' },
            { th: 'ผู้เล่นเลเวล 1 คนนี้ จะพิชิตหอคอยแห่งโลกาวินาศให้ดู!', en: 'This Level 1 player will conquer the Tower of Apocalypse!', original: '레벨 1인 내가... 이 묵시록의 탑을 정복해 보이겠다!' },
          ]
        ),
      },
    ],
  },

  // 11. Honzuki no Gekokujou
  {
    id: 'comic-honzuki',
    title: 'Honzuki no Gekokujou (ตราบาปหนอนหนังสือ)',
    originalTitle: '本好きの下剋上 - Ascendance of a Bookworm',
    slug: 'honzuki-no-gekokujou',
    author: 'Miya Kazuki',
    artist: 'Suzuka',
    genres: ['Fantasy', 'Slice of Life', 'Isekai', 'Manga'],
    synopsis: 'อุราโนะ หญิงสาวผู้รักหนังสือถูกกองหนังสือทับเสียชีวิต มาเกิดใหม่เป็น ไมน์ เด็กหญิงขี้โรคในโลกยุคกลางที่หนังสือเป็นของหายากและมีราคาแพง เธอจึงตั้งปณิธานว่าจะทำหนังสือขึ้นมาด้วยตัวเอง',
    coverImage: '/src/assets/images/cover_villainess_1792064405743.jpg',
    rating: 4.9,
    viewCount: 395000,
    status: 'ongoing',
    originalLang: 'ja',
    chapters: [
      {
        id: 'hz-ch-1',
        chapterNumber: 52,
        title: 'ตอนที่ 52',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Ascendance of a Bookworm', 52, 'fantasy', 'ไมน์', 'ลุตซ์',
          [
            { th: 'หนังสือ... หนังสืออยู่ที่ไหนกัน?! ทำไมในบ้านหลังนี้ไม่มีหนังสือสักเล่มเลยล่ะ?!', en: 'Books... Where are the books?! Why isn’t there a single book in this house?!', original: '本…本はどこ？！どうしてこの家には一冊も本がないの？！' },
            { th: 'ไมน์ อย่าลุกขึ้นมาวิ่งสิ เดี๋ยวไข้ขึ้นอีกนะ!', en: 'Myne, don’t run around! Your fever will flare up again!', original: 'マイン、走っちゃダメ！また熱が出るよ！' },
            { th: 'ในโลกนี้หนังสือมีราคาแพงลิบลิ่ว มีเฉพาะขุนนางเท่านั้นที่มีสิทธิ์ครอบครอง...', en: 'In this world, books are astronomical luxuries reserved only for nobility...', original: 'この世界では本は貴族だけの超高級品なの…' },
            { th: 'ถ้าไม่มีหนังสือให้อ่าน... ฉันก็จะสร้างมันขึ้นมาด้วยมือของฉันเอง!', en: 'If there are no books available... I will craft them with my own hands!', original: '本がないなら…自分で作っちゃえばいいんだ！' },
            { th: 'เริ่มจากการทำกระดาษปาปิรัสด้วยเส้นใยพืชริมแม่น้ำกันเถอะ ลุตซ์!', en: 'Let’s start by making papyrus with river plant fibers, Lutz!', original: 'まずは川原の植物の繊維でパピルス紙を作るよ、ルッツ！' },
            { th: 'ไมน์ เธอเนี่ยคิดอะไรแปลกๆ ตลอดเลยนะ แต่ฉันจะช่วยเธอเอง!', en: 'Myne, you always have wacky ideas, but I’ll back you up!', original: 'マインはいつも突拍子もないけど、俺が手伝うよ！' },
            { th: 'สำเร็จแล้ว! แผ่นกระดาษแผ่นแรกที่ทำขึ้นเองในโลกยุคกลาง!', en: 'It worked! Our very first handmade sheet of paper in this medieval realm!', original: 'できた！この世界で初めての手作り紙！' },
            { th: 'กลิ่นอายมานาในร่างเริ่มสั่นไหว... พลังเวทที่เอ่อล้นนี้คือโรคกลืนกินชีวิต?', en: 'My body’s internal mana is resonating... Is this the Devouring sickness?', original: '魔力が熱く暴走しそう…これが身食いの熱なの？' },
            { th: 'ไม่ว่ายังไงก็ตาม... ฉันจะต้องมีชีวิตอยู่เพื่อเปิดห้องสมุดของตัวเองให้ได้!', en: 'No matter what... I will survive and build my very own library!', original: '何があっても生き延びて、いつか自分の図書館を作るんだ！' },
          ]
        ),
      },
    ],
  },

  // 12. Eleceed
  {
    id: 'comic-eleceed',
    title: 'Eleceed (เอเลซีด พลังสายฟ้าผ่ามิติ)',
    originalTitle: '일렉시드 - Eleceed',
    slug: 'eleceed',
    author: 'Son Jae-ho & ZHENA',
    artist: 'ZHENA',
    genres: ['Action', 'Comedy', 'Supernatural', 'Manhwa'],
    synopsis: 'ซอจีอู เด็กหนุ่มผู้มีพลังความเร็วแสงและรักแมว บังเอิญไปช่วยแมวอ้วนส้มตัวหนึ่ง ซึ่งแท้จริงแล้วคือ คาเดน ยอดผู้ตื่นรู้ระดับโลกที่บาดเจ็บสาหัสและจำแลงกายมาหลบภัย',
    coverImage: '/src/assets/images/cover_solo_leveler_1792064406068.jpg',
    rating: 4.9,
    viewCount: 820000,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'ele-ch-1',
        chapterNumber: 319,
        title: 'ตอนที่ 319',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Eleceed', 319, 'action', 'ซอจีอู', 'คาเดน (ในร่างแมว)',
          [
            { th: 'โอ๋ๆ เจ้าเหมียวตัวอ้วนกลม ได้รับบาดเจ็บมาเหรอเนี่ย เดี๋ยวพาไปทำแผลนะ!', en: 'Aww, chubby kitty, are you hurt? Let me bandage your wounds!', original: '어라, 뚱뚱한 고양이야, 다친 거야? 내가 치료해 줄게!' },
            { th: '(เจ้าเด็กบ้านี่! ข้าคือคาเดน ยอดผู้ตื่นรู้ที่แข็งแกร่งที่สุดในโลกเฟ้ย ไม่ใช่แมว!)', en: '(Foolish brat! I am Kayden, the world’s strongest Awakener, not a cat!)', original: '(이 망할 꼬맹이가! 난 세계 최강의 각성자 카이든이다! 고양이가 아니라고!)' },
            { th: 'อาหารแมวเลียสูตรพิเศษ... ลองชิมดูสิ อร่อยมากเลยนะ!', en: 'Special cat treat paste... Try some, it is super delicious!', original: '특제 츄르야... 한번 먹어봐, 엄청 맛있다고!' },
            { th: '(งั่ม... อึก! บ้าชะมัด ทำไมรสชาติอาหารแมวมันถึงได้เลิศรสขนาดนี้ฟะ?!)', en: '(Gulp... Dammit, why does this feline treat taste so exquisite?!)', original: '(뇸뇸... 큭! 왜 이렇게 맛있는 거냐?!)' },
            { th: 'ทันใดนั้น ผู้ตื่นรู้ฝ่ายมืดบุกเข้ามาพังหน้าต่างห้องพัก!', en: 'Suddenly, villainous Awakeners shatter through the apartment window!', original: '그 순간, 어둠의 각성자들이 창문을 깨고 난입했다!' },
            { th: 'จีอูเร่งความเร็วขั้นสุดยอด หลบกระสุนพลังเวทได้ในเสี้ยววินาที!', en: 'Jiwoo activates hyper-speed, evading kinetic blasts in a blink!', original: '지우는 초고속 능력을 발동해 번개 같은 속도로 회피했다!' },
            { th: 'คาเดนในร่างแมวเบิกตากว้าง: (เจ้าเด็กนี่มีพลังความเร็วแสงโดยไร้การฝึกสอนงั้นรึ?!)', en: 'Kayden’s cat eyes widen: (This kid wields raw light speed without training?!)', original: '카이든이 눈을 크게 떴다: (저 꼬맹이, 제대로 된 수련도 없이 빛의 속도를?!)' },
            { th: 'เปรี้ยงงง! สายฟ้าฟาดจากกรงเล็บแมวอ้วน ซัดผู้บุกรุกสลบคาที่!', en: 'Zap! Lightning arcs from the fat cat’s paw, frying the intruders!', original: '콰르릉! 뚱냥이의 젤리 발바닥에서 벼락이 내리꽂혔다!' },
            { th: 'เจ้าหนู... ตั้งแต่วันนี้ไป ข้าจะเป็นอาจารย์สอนพลังสายฟ้าให้เจ้าเอง!', en: 'Brat... From this day forward, I shall tutor you in the art of lightning!', original: '꼬맹이... 오늘부터 내가 네 스승이 되어주마!' },
          ]
        ),
      },
    ],
  },

  // 13. Infinite Mage
  {
    id: 'comic-infinite-mage',
    title: 'Infinite Mage (จอมเวทอนันต์ ผู้ทะลุขอบเขตจักรวาล)',
    originalTitle: '무한의 마법사 - Infinite Mage',
    slug: 'infinite-mage',
    author: 'Kim Chi-woo',
    artist: 'Kirito Studio',
    genres: ['Action', 'Fantasy', 'School', 'Manhwa'],
    synopsis: 'ชิโรเน่ เด็กกำพร้าที่ถูกทอดทิ้งในคอกม้า เติบโตขึ้นพร้อมความสามารถในการเข้าถึง "แดนศูนย์กลางแห่งจิต" ปลดล็อกศักยภาพเวทมนตร์ไร้ขีดจำกัดที่จะเปลี่ยนโลกทั้งใบ',
    coverImage: '/src/assets/images/cover_solo_leveler_1792064406068.jpg',
    rating: 4.8,
    viewCount: 478000,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'im-ch-1',
        chapterNumber: 188,
        title: 'ตอนที่ 188',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Infinite Mage', 188, 'fantasy', 'ชิโรเน่', 'อาจารย์อัลเฟรด',
          [
            { th: 'เวทมนตร์ไม่ใช่แค่การร่ายคาถา... แต่มันคือการเข้าใจโครงสร้างของจักรวาล!', en: 'Magic is not mere spellcraft... It is parsing cosmic architecture!', original: '마법은 단순한 주문이 아니다... 우주의 구조를 이해하는 것이다!' },
            { th: 'แดนจิตศูนย์องศา... เมื่อหยุดเวลาในความคิด ทุกสิ่งจะกลายเป็นอนันต์', en: 'The Zero Zone... In absolute focus, all possibilities become infinite.', original: '정신 영역 전개... 절대적인 집중 속에서 모든 것이 무한해진다.' },
            { th: 'ลูกบอลไฟขนาดจิ๋วที่อัดแน่นด้วยความหนาแน่นเชิงควอนตัม!', en: 'A miniature spark supercompressed with quantum photon density!', original: '미세하지만 엄청난 밀도로 응축된 빛의 구체!' },
            { th: 'อาจารย์ใหญ่ตกตะลึง: เด็กคนนี้เข้าถึงแดนจิตวิญญาณได้ตั้งแต่อายุแค่นี้?!', en: 'Headmaster gasps: This boy unlocked the Spirit Domain at such a young age?!', original: '교장선생님의 경악: 저 아이가 벌써 정신 영역에 진입했다고?!' },
            { th: 'ฟิ้ววว! ลำแสงเวททะลวงผ่านเป้าหมายจำลองแตกกระจายในพริบตา!', en: 'Whoosh! A photon beam shatters the reinforced targets instantaneously!', original: '파아앗! 광자 광선이 표적을 순식간에 꿰뚫어 산산조각 냈다!' },
            { th: 'ถ้าข้อจำกัดของมนุษย์คือขอบเขต... ฉันก็จะก้าวข้ามไปสู่อนันต์!', en: 'If mortal boundaries exist... I shall step beyond into the infinite!', original: '인간의 한계가 존재한다면... 나는 무한으로 나아갈 것이다!' },
            { th: 'การคัดเลือกนักเรียนทุนแห่งโรงเรียนเวทมนตร์หลวงเริ่มต้นขึ้นแล้ว', en: 'Royal Academy elite scholarship examination is now officially underway.', original: '왕립 마법학교 엘리트 장학생 선발 시험이 시작되었다.' },
            { th: 'คู่แข่งชนชั้นสูงจ้องมองชิโรเน่ด้วยสายตาเหยียดหยาม', en: 'Noble competitors glare at Shirone with arrogant condescension.', original: '귀족 출신 경쟁자들은 시로네를 경멸 어린 시선으로 노려본다.' },
            { th: 'ฉันจะพิสูจน์ให้ทุกคนเห็นว่า ความรู้และเจตจำนงอยู่เหนือสายเลือด!', en: 'I will prove to everyone that intellect and will transcend noble bloodlines!', original: '지식과 의지가 혈통 따위보다 위대하다는 것을 증명하겠다!' },
          ]
        ),
      },
    ],
  },

  // 14. Disastrous Necromancer
  {
    id: 'comic-disastrous-necromancer',
    title: 'Disastrous Necromancer (เนโครแมนเซอร์ระดับหายนะ)',
    originalTitle: '全民转职：死灵法师！我即是天灾 - Disaster Necromancer',
    slug: 'disastrous-necromancer',
    author: 'Slowly Walking Along the Road',
    artist: 'China South Cartoon',
    genres: ['Action', 'Fantasy', 'System', 'Manhua'],
    synopsis: 'ในวันเปลี่ยนอาชีพ หลินโม่หวี่ ได้รับอาชีพสายเวทซัมมอนเนอร์เนโครแมนเซอร์ อาชีพที่ทุกคนคิดว่าอ่อนแอ แต่เขากลับมีพรสวรรค์ระดับพระเจ้า อัญเชิญกองทัพโครงกระดูกนับล้านตัว!',
    coverImage: '/src/assets/images/cover_overlord_insects_1792065720410.jpg',
    rating: 4.8,
    viewCount: 560000,
    status: 'ongoing',
    originalLang: 'zh',
    chapters: [
      {
        id: 'dn-ch-1',
        chapterNumber: 118,
        title: 'ตอนที่ 118',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Disastrous Necromancer', 118, 'fantasy', 'หลินโม่หวี่', 'ครูใหญ่',
          [
            { th: '[ระบบประกาศ: ขอแสดงความยินดี หลินโม่หวี่ ได้รับอาชีพลับ - เนโครแมนเซอร์!]', en: '[System Announcement: Lin Moyu awakened hidden class - Necromancer!]', original: '[系统提示：恭喜林默语觉醒唯一隐藏职业——死灵法师！]' },
            { th: 'ทุกคนหัวเราะเยาะ: เนโครแมนเซอร์เนี่ยนะ? อาชีพที่โครงกระดูกเปราะบางที่สุดน่ะเหรอ?!', en: 'Crowd sneers: Necromancer? The weakest pet class with paper-thin bones?!', original: '众人哄笑：死灵法师？那不是脆皮召唤流废柴吗？！' },
            { th: 'พวกเขาไม่รู้เลยว่า พรสวรรค์ระดับเทวะของฉันทำให้โครงกระดูกแข็งแกร่งกว่าบอส 100 เท่า!', en: 'They have no idea my god-tier talent buffs my skeletons 100x over dungeon bosses!', original: '他们根本不知道，我的神级天赋让骷髅战力暴涨百倍！' },
            { th: 'จงออกมา... เหล่านักรบโครงกระดูกเปลวเพลิงทมิฬ!', en: 'Rise forth... My Dark Flame Skeleton Legion!', original: '现身吧……深渊黑炎骷髅军团！' },
            { th: 'แกร๊กกก! โครงกระดูกสีเงินวาววับนับพันผุดขึ้นจากมิติความมืด!', en: 'Clatter! Thousands of platinum skeletons emerge from the nether rift!', original: '咔嚓咔嚓！数以千计的白银骷髅从裂隙中涌出！' },
            { th: 'ดันเจี้ยนระดับนรกแตก... ถูกกองทัพของฉันเคลียร์ราบคาบในเวลาเพียง 3 นาที!', en: 'Hell-mode dungeon... Decimated by my skeletal legion within three minutes!', original: '地狱级副本……在我的骷髅大军面前仅仅撑了三分钟！' },
            { th: 'ครูใหญ่ตะลึงอ้าปากค้าง: นี่มันไม่ใช่เนโครแมนเซอร์แล้ว นี่มันภัยพิบัติระดับชาติ!', en: 'Principal gasps: This isn’t a necromancer, this is a walking national disaster!', original: '校长目瞪口呆：这哪是死灵法师，这分明是行走的国之天灾！' },
            { th: 'ซากศพระเบิด! ดาเมจร้อยล้านกวาดล้างทั้งกองทัพอสูร!', en: 'Corpse Explosion! Hundreds of millions in AOE wipe out the monster hoard!', original: '尸体爆炸！上亿伤害瞬间清屏！' },
            { th: 'ที่ใดมีข้า... ที่นั่นคือกองทัพแห่งความตายไร้พ่าย!', en: 'Wherever I walk... There reigns an invincible army of death!', original: '我所立之处，即是无敌天灾！' },
          ]
        ),
      },
    ],
  },

  // 15. Afterlife Diner
  {
    id: 'comic-afterlife-diner',
    title: 'Afterlife Diner (ภัตตาคารปรโลก เปิดดึกส่งวิญญาณ)',
    originalTitle: '저승 식당 - Afterlife Diner',
    slug: 'afterlife-diner',
    author: 'Midnight Rice',
    artist: 'Moonlit Studio',
    genres: ['Drama', 'Fantasy', 'Supernatural', 'Manhwa'],
    synopsis: 'ร้านอาหารเล็กๆ ที่เปิดเฉพาะหลังเที่ยงคืน เสิร์ฟเมนูอาหารจานโปรดในความทรงจำให้แก่เหล่าดวงวิญญาณก่อนเดินทางข้ามสะพานปรโลก เรื่องราวซาบซึ้งและปริศนาชวนค้นหา',
    coverImage: '/src/assets/images/cover_villainess_1792064405743.jpg',
    rating: 4.9,
    viewCount: 345000,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'ad-ch-1',
        chapterNumber: 82,
        title: 'ตอนที่ 82',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Afterlife Diner', 82, 'mystery', 'เชฟคัง', 'วิญญาณคุณยาย',
          [
            { th: 'กริ๊งงง... ยินดีต้อนรับสู่ภัตตาคารปรโลกครับ ที่นี่เปิดบริการเฉพาะผู้ล่วงลับ', en: 'Chime... Welcome to the Afterlife Diner, open exclusively for departed souls.', original: '딸랑... 저승 식당에 오신 것을 환영합니다. 망자만을 위한 식당입니다.' },
            { th: 'พ่อหนุ่ม... ยายจำทางกลับบ้านไม่ได้ หิวเหลือเกิน มีอะไรอุ่นๆ ให้กินไหม?', en: 'Young man... I cannot remember the way home, so starving, anything warm?', original: '총각... 집 가는 길이 기억나지 않아. 따뜻한 밥 한 끼 먹을 수 있을까?' },
            { th: 'โปรดนั่งลงก่อนครับคุณยาย ค่ำคืนนี้ผมจะทำ "ซุปเต้าหู้หมูสามชั้น" รสชาติที่คุณยายรักที่สุดให้ทาน', en: 'Please take a seat, grandmother. Tonight I will prepare the pork stew you loved most.', original: '편히 앉으세요, 할머니. 오늘 밤은 생전 가장 좋아하셨던 김치찌개를 끓여드릴게요.' },
            { th: 'กลิ่นหอมของน้ำซุปกระดูกเคี่ยวกรุ่นลอยขึ้นมา แตะต้องดวงวิญญาณที่เหนื่อยล้า', en: 'The rich aroma of slow-simmered broth warms her weary phantom soul.', original: '구수한 국물 냄새가 지친 영혼의 마음을 포근하게 감싸 안았다.' },
            { th: 'ชิมคำแรก... น้ำตาของคุณยายไหลริน: นี่คือรสชาติฝีมือของแม่เมื่อห้าสิบปีก่อน!', en: 'First sip... Tears stream down: This is the exact flavor of my mother fifty years ago!', original: '첫 숟가락... 할머니의 눈물이 흘러내렸다: 50년 전 어머니가 해주신 바로 그 맛이구나!' },
            { th: 'อาหารไม่ได้แค่เติมเต็มกระเพาะ... แต่มันปลดปล่อยความค้างคาในจิตใจ', en: 'Food feeds more than stomachs... It unburdens lingering regrets in the soul.', original: '음식은 배를 채우는 것 이상이다... 영혼에 맺힌 한을 풀어주는 기적이다.' },
            { th: 'ยมทูตสีดำยืนรออยู่ที่หน้าประตูร้านด้วยความเคารพ', en: 'The Grim Reaper stands respectfully by the lantern-lit exit door.', original: '검은 도포의 저승사자가 문밖에서 정중하게 기다리고 있었다.' },
            { th: 'ขอบใจนะพ่อหนุ่ม ยายอิ่มทั้งกายและใจแล้ว ถึงเวลาต้องก้าวข้ามสะพานแล้วล่ะ', en: 'Thank you, young chef. My soul is warm and complete, ready to cross the bridge.', original: '고마워요, 총각. 이제 따뜻한 마음으로 강을 건널 수 있겠어.' },
            { th: 'เดินทางโดยสวัสดิภาพนะครับ... พรุ่งนี้ภัตตาคารปรโลกจะเปิดต้อนรับเรื่องราวต่อไป', en: 'Safe travels beyond the veil... Tomorrow, Afterlife Diner will welcome another story.', original: '평안히 가세요... 내일도 저승 식당은 누군가의 사연을 기다립니다.' },
          ]
        ),
      },
    ],
  },

  // 16. Reality Quest
  {
    id: 'comic-reality-quest',
    title: 'Reality Quest (เควสต์เปลี่ยนชีวิตนักเรียนลูกกระจ๊อก)',
    originalTitle: '현실퀘스트 - Reality Quest',
    slug: 'reality-quest',
    author: 'Joowon',
    artist: 'Taesung',
    genres: ['Action', 'Drama', 'School', 'Manhwa'],
    synopsis: 'ฮาดาวัน เด็กหนุ่มที่ถูกเด็กเกเรสั่งให้เล่นเกมหาไอเทมจนหัวใจวายเสียชีวิต ตื่นขึ้นมาในห้องเรียนเมื่อหนึ่งสัปดาห์ก่อน พร้อมหน้าต่างระบบเควสต์ในโลกแห่งความเป็นจริง!',
    coverImage: '/src/assets/images/cover_solo_leveler_1792064406068.jpg',
    rating: 4.8,
    viewCount: 610000,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'rq-ch-1',
        chapterNumber: 142,
        title: 'ตอนที่ 142',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Reality Quest', 142, 'action', 'ฮาดาวัน', 'หัวโจกอันธพาล',
          [
            { th: '[ระบบเควสต์ความจริง: ย้อนเวลากลับมา 1 สัปดาห์ก่อนเสียชีวิตสำเร็จ]', en: '[Reality Quest: Reversion to one week prior successfully executed]', original: '[현실 퀘스트: 사망 1주일 전 회귀가 완료되었습니다]' },
            { th: 'ฉัน... ฉันยังไม่ตายเหรอเนี่ย?! ห้องเรียนมัธยมปลายที่คุ้นเคย!', en: 'I... I am not dead?! The familiar high school classroom!', original: '나... 살아있는 건가?! 익숙한 고등학교 교실이야!' },
            { th: '[เควสต์เร่งด่วน: เอาชนะหัวโจกอันธพาล มินซอก - รางวัล: ทักษะมวยสากลพื้นฐาน]', en: '[Urgent Quest: Defeat bully Min-seok - Reward: Basic Boxing Instinct]', original: '[돌발 퀘스트: 일진 민석을 제압하라 - 보상: 기본 복싱 기술]' },
            { th: 'เฮ้ย ดาวัน! ทำไมไอเทมเกมที่สั่งให้ฟาร์มยังไม่ได้เรื่องอีกวะ อยากโดนกระทืบเหรอ?!', en: 'Hey Da-wan! Why haven’t you farmed my game loot yet? Wanna get beat up?!', original: '야 하도완! 게임 아이템 다 캤냐? 오늘 한번 맞아볼래?!' },
            { th: 'ชีวิตก่อนฉันยอมก้มหัวให้พวกแกจนต้องตาย... แต่ชาตินี้จะไม่ยอมอีกต่อไปแล้ว!', en: 'In my past life I bowed until I died... In this life, NEVER AGAIN!', original: '전생에선 너희에게 굴복하다 죽었지만... 이번 생은 절대 사양이다!' },
            { th: 'ดาวันก้มหลบหมัดเหวี่ยงอย่างเฉียดฉิว พร้อมสวนหมัดเข้าปลายคางอย่างจัง!', en: 'Da-wan ducks under the wild haymaker, driving an uppercut into the chin!', original: '도완은 날아오는 주먹을 종이 한 장 차이로 피하며 턱을 강타했다!' },
            { th: 'ผัวะะะ! มินซอกล้มทั้งยืน ท่ามกลางความตกตะลึงของเพื่อนทั้งห้อง!', en: 'Smack! Min-seok collapses cold, leaving the entire classroom speechless!', original: '퍽! 일진 민석이 그 자리에서 기절하며 온 교실이 얼어붙었다!' },
            { th: '[เควสต์สำเร็จ! ปลดล็อกทักษะการต่อสู้ระดับสูงและค่าสถานะพละกำลัง +5]', en: '[Quest Complete! High-tier Combat Intuition unlocked and Strength +5]', original: '[퀘스트 완료! 상급 격투 센스 해금 및 근력 스탯 +5]' },
            { th: 'โลกความเป็นจริงที่เหมือนเกม... ฉันจะเคลียร์เควสต์ทุกอย่างเพื่อเป็นผู้ชนะ!', en: 'Reality is now my game... I will conquer every quest and rule my life!', original: '게임이 된 현실... 모든 퀘스트를 클리어하고 정점에 서겠다!' },
          ]
        ),
      },
    ],
  },

  // 17. A Modern Man Who Got Transmigrated
  {
    id: 'comic-modern-man-murim',
    title: 'A Modern Man Who Got Transmigrated (หนุ่มยุคใหม่ทะลุมิติสู่มู่หลิน)',
    originalTitle: '현대인이 무림에 떨어지면 - A Modern Man In Murim',
    slug: 'modern-man-in-murim',
    author: 'Dang San',
    artist: 'Redice Studio',
    genres: ['Action', 'Comedy', 'Murim', 'Manhwa'],
    synopsis: 'โจฮัน พนักงานการเงินยุคศตวรรษที่ 21 เสียชีวิตจากภาวะหัวใจวาย ตื่นขึ้นมาในร่างคุณชายตระกูลตกอับแห่งยุทธภพ เขาใช้วิชาบัญชีและการบริหารยุคใหม่ พลิกสำนักสู่มหาอำนาจการเงิน!',
    coverImage: '/src/assets/images/cover_murim_blade_1792064406380.jpg',
    rating: 4.8,
    viewCount: 389000,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'mm-ch-1',
        chapterNumber: 112,
        title: 'ตอนที่ 112',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Modern Man in Murim', 112, 'murim', 'โจฮัน', 'ผู้อาวุโสสำนัก',
          [
            { th: 'จากนักวิเคราะห์กองทุนวอลล์สตรีท... กลายมาเป็นคุณชายสำนักดาบใกล้ล้มละลาย?!', en: 'From a Wall Street fund analyst... to the young master of a bankrupt sect?!', original: '월스트리트 펀드 매니저에서... 파산 직전 무림 문파의 도련님으로?!' },
            { th: 'ดูงบดุลของสำนักสิ หนี้สินล้นพ้นตัว ค่าบำรุงรักษากระบี่สูงเกินเหตุ!', en: 'Look at this balance sheet! Drowning in toxic debt, sword maintenance is inflated!', original: '이 장부 좀 보십시오! 부채 비율은 엉망이고 검 유지비는 비정상적입니다!' },
            { th: 'คุณชาย... ท่านพูดภาษาอะไรของท่านเนี่ย "งบดุล" กับ "กระแสเงินสด" คืออะไรกัน?!', en: 'Young Master... What alien tongue is this? What on earth is "cash flow"?!', original: '도련님... 무슨 해괴한 소리십니까? "현금 흐름"이라니요?!' },
            { th: 'ฟังให้ดีนะท่านผู้อาวุโส! ยุทธภพยุคนี้ไม่ได้สู้กันด้วยกำลังภายในอย่างเดียว แต่สู้ด้วยเศรษฐศาสตร์!', en: 'Listen well Elders! In this era, Murim isn’t won by Qi alone, but by economics!', original: '잘 들으세요 장로님들! 요즘 무림은 내공뿐 아니라 경제력으로 싸우는 겁니다!' },
            { th: 'จัดตั้งสหกรณ์ผลิตโอสถทิพย์ และออกพันธบัตรสำนักดาบเพื่อระดมทุนทันที!', en: 'Establish an elixir manufacturing cooperative and issue sect bonds right now!', original: '영약 생산 협동조합을 세우고 문파 채권을 발행해 자금을 조달합니다!' },
            { th: 'สำนักศัตรูส่งนักฆ่ามาทวงหนี้: ถ้าไม่มีเงินคืน วันนี้ข้าจะเผาสำนักของเจ้าซะ!', en: 'Rival sect debt collector arrives: If you can’t pay, we burn this pavilion today!', original: '사채업자 무림인 난입: 오늘 돈을 갚지 못하면 이 문파를 불태우겠다!' },
            { th: 'ฟิ้ววว! กระบี่เงินตรา... โจฮันใช้ลูกคิดคำนวณวิถีกระบี่ หลบการโจมตีอย่างแม่นยำ!', en: 'Whoosh! Abacus swordplay... Jo-han models trajectory equations to evade cleanly!', original: '휙! 주판알을 튕기며 도검의 궤적을 수식으로 계산해 회피했다!' },
            { th: 'นี่คือใบสัญญาควบรวมกิจการ... จากนี้ไปสำนักของเจ้าตกเป็นของข้าตามกฎหมาย!', en: 'Here is the legally binding merger deed... Your sect is now my subsidiary!', original: '이것이 인수합병 계약서다... 이제 네놈들 문파는 내 자회사다!' },
            { th: 'ยุทธภพแห่งทุนนิยมได้เริ่มต้นขึ้นแล้ว ด้วยมันสมองของหนุ่มยุคใหม่!', en: 'Capitalist Murim has arrived, masterminded by a modern financial wizard!', original: '자본주의 무림의 시대가 열렸다... 현대인의 두뇌로 무림을 지배하마!' },
          ]
        ),
      },
    ],
  },

  // 18. Return of the Mount Hua Sect
  {
    id: 'comic-mount-hua',
    title: 'Return of the Mount Hua Sect (กระบี่ฮวาซานหวนคืน)',
    originalTitle: '화산귀환 - Return of the Blossoming Blade',
    slug: 'return-of-the-mount-hua-sect',
    author: 'Biga',
    artist: 'LICO',
    genres: ['Action', 'Comedy', 'Murim', 'Manhwa'],
    synopsis: 'ชองมยอง ปรมาจารย์กระบี่ดอกท้อแห่งฮวาซาน สิ้นชีพพร้อมจอมมารชอนมา ตื่นขึ้นมาในร่างเด็กขอทาน 100 ปีให้หลัง พบว่าสำนักฮวาซานที่เขารักกลับตกต่ำจนแทบสิ้นชื่อ เขาจึงต้องกอบกู้สำนักกลับคืนมา!',
    coverImage: '/src/assets/images/cover_murim_blade_1792064406380.jpg',
    rating: 4.9,
    viewCount: 920000,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'mh-ch-1',
        chapterNumber: 142,
        title: 'ตอนที่ 142',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Return of Mount Hua', 142, 'murim', 'ชองมยอง', 'เจ้าสำนักฮวาซาน',
          [
            { th: 'ข้าตัดหัวจอมมารชอนมาบนยอดเขาหิมะ... แล้วทำไมข้าถึงตื่นมาในร่างเด็กขอทานเนี่ย?!', en: 'I beheaded the Demonic Cult leader on Mount Hua... Why am I in a beggar child’s body?!', original: '천마의 목을 베고 쓰러졌는데... 왜 거지 꼬맹이 몸으로 일어난 거야?!' },
            { th: 'ฮวาซาน... สำนักฮวาซานอันยิ่งใหญ่ของข้า ตอนนี้เป็นอย่างไรบ้างแล้ว?!', en: 'Mount Hua... What has become of my glorious Blossoming Blade Sect?!', original: '화산... 내 위대한 화산파는 지금 어떻게 되었는가?!' },
            { th: 'อะไรนะ?! สำนักฮวาซานกลายเป็นสำนักชั้นสี่ หนี้ท่วมหัวจนต้องขายป้ายชื่อสำนักกินเรอะ?!', en: 'WHAT?! Mount Hua fell to a 4th-rate backwater, selling off sect plaques for debt?!', original: '뭐라고?! 화산이 빚더มี에 앉아 현판까지 팔아넘길 지경이라고?!' },
            { th: 'ไอ้พวกศิษย์รุ่นหลังไร้ฝีมือ! ข้าจะเอาท่อนไม้ไล่ตีพวกมันให้ตื่นรู้เดี๋ยวนี้!', en: 'You pathetic descendants! I am going to thrash every single one of you with a wooden stick!', original: '이 빌어먹을 후손 놈들! 몽둥이 들고 대가리부터 깨부숴주마!' },
            { th: 'ชิ้งงง! กิ่งไม้แห้งในมือของชองมยอง เปล่งประกายกลีบดอกท้อเบ่งบานกลางอากาศ!', en: 'Slash! A dry twig in Chung Myung’s grip blossoms into majestic plum petal sword Qi!', original: '촤아아악! 청명의 손에 쥔 나뭇가지에서 매화검기가 찬란하게 피어났다!' },
            { th: 'เหล่าศิษย์ฮวาซานมองตาค้าง: นั่นมัน... วิชากระบี่ดอกท้อ 24 ท่าที่สาบสูญไปแล้วนี่!', en: 'Disciples freeze in awe: That is... The legendary lost 24-Movement Plum Blossom Sword!', original: '화산 제자들이 경악했다: 저건... 실전된 이십사수매화검법?!' },
            { th: 'จำใส่กะโหลกไว้ให้ดี! ฮวาซานจะไม่มีวันก้มหัวให้ใครตราบใดที่ข้ายังอยู่!', en: 'Etch this into your skulls! Mount Hua will NEVER bow to anyone while I breathe!', original: '대가리에 똑똑히 새겨둬라! 내가 있는 한 화산은 결코 꺾이지 않는다!' },
            { th: 'การปฏิวัติแห่งขุนเขาฮวาซาน... ได้เริ่มขึ้นแล้วด้วยหมัดและกระบี่ของชองมยอง!', en: 'The renaissance of Mount Hua commences, forged by Chung Myung’s wrath and steel!', original: '화산의 부활이 시작되었다... 청명의 검과 주먹으로!' },
            { th: 'ดอกเหมยจะเบ่งบานไปทั่วทั้งยุทธภพอีกครั้ง!', en: 'The plum blossoms shall once again blanket the entire martial world!', original: '매화는 다시 천하에 만개할 것이다!' },
          ]
        ),
      },
    ],
  },

  // 19. Pick Me Up, Infinite Gacha
  {
    id: 'comic-pick-me-up',
    title: 'Pick Me Up, Infinite Gacha (จอมยุทธ์สุ่มกาชาไร้ขีดจำกัด)',
    originalTitle: '픽 미 업! - Pick Me Up!',
    slug: 'pick-me-up-infinite-gacha',
    author: 'Hermit',
    artist: 'VAS',
    genres: ['Action', 'Fantasy', 'System', 'Manhwa'],
    synopsis: 'โลกิ ผู้เล่นอันดับ 1 ของโลกในเกมมือถือสุดโหด Pick Me Up หมดสติและถูกดึงเข้าไปในเกมในฐานะตัวละคร 1 ดาวระดับต่ำสุด เขาต้องนำพาเหล่าฮีโร่เอาชีวิตรอดจากดันเจี้ยนความตาย',
    coverImage: '/src/assets/images/cover_solo_leveler_1792064406068.jpg',
    rating: 4.8,
    viewCount: 512000,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'pmu-ch-1',
        chapterNumber: 116,
        title: 'ตอนที่ 116',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'Pick Me Up', 116, 'action', 'ฮัน (โลกิ)', 'มาสเตอร์มือใหม่',
          [
            { th: '[ระบบ: ผู้เล่นอันดับ 1 "โลกิ" ถูกซัมมอนเข้าสู่เกมในฐานะฮีโร่ระดับ 1 ดาว "ฮัน"]', en: '[System: Rank 1 Master "Loki" summoned as 1-Star Hero "Han"]', original: '[시스템: 랭킹 1위 마스터 "로키"가 1성 영웅 "한"으로 소환되었습니다]' },
            { th: 'เกมขยะที่ถ้าตายแล้วจะถูกลบตัวละครทิ้งถาวร... แล้วทำไมฉันต้องมาอยู่ในนี้ด้วยวะ?!', en: 'That ruthless permadeath gacha game... Why the hell am I trapped inside it?!', original: '캐릭터가 죽으면 영구 삭제되는 망겜... 내가 왜 이 안에 들어온 거야?!' },
            { th: 'มาสเตอร์คนใหม่เป็นผู้เล่นมือใหม่ที่กำลังจะส่งพวกเราไปตายในดันเจี้ยนแรก!', en: 'The new master is a rookie player about to march us into a rookie wipeout!', original: '새로운 마스터는 뉴비라 우릴 1층에서 전멸시킬 작정이다!' },
            { th: 'ทุกคนในปาร์ตี้ ฟังฉันให้ดี! ถ้าอยากมีชีวิตรอดกลับไป จงทำตามคำสั่งฉันทุกคำ!', en: 'Everyone in this squad, listen up! If you want to survive, obey my every order!', original: '파티원들 잘 들어라! 살아서 돌아가고 싶다면 내 지시만 따라라!' },
            { th: 'ฮันใช้ก้อนหินล่อกับดักในดันเจี้ยน ตัดวงจรการระเบิดได้อย่างแม่นยำ!', en: 'Han hurls a pebble to trigger tripwires, neutralizing explosives with pro micro!', original: '한은 돌멩이를 던져 함정을 발동시키며 기가 막힌 컨트롤로 해제했다!' },
            { th: 'พวกฮีโร่ 1 ดาวมองฮันด้วยสายตาทึ่ง: นาย... นายรู้ตำแหน่งกับดักล่วงหน้าได้ยังไง?!', en: '1-Star heroes stare in disbelief: How did you foresee all the lethal traps?!', original: '1성 영웅들이 넋을 잃었다: 너... 함정 위치를 어떻게 다 알고 있는 거야?!' },
            { th: 'เพราะฉันเล่นเกมนี้มาเป็นหมื่นชั่วโมงยังไงล่ะ! ลุยต่อได้ บอสชั้นนี้เสร็จฉันแน่!', en: 'Because I played this hell game for ten thousand hours! Forward, the boss is mine!', original: '내가 이 지옥 같은 게임을 만 시간 넘게 플레이했으니까! 돌격해라!' },
            { th: 'ดาบสั้น 1 ดาวฟันทะลุจุดอ่อนของโกเลมหินแตกกระจาย!', en: 'A 1-Star starter blade strikes the exact crystal joint, shattering the golem!', original: '1성 기본 검이 골렘의 핵을 정확히 꿰뚫어 산산조각 냈다!' },
            { th: 'ฉันจะไม่ยอมตายเป็นฮีโร่ขยะ... ฉันจะปีนขึ้นไปสู่ชั้น 100 และกลับโลกเดิมให้ได้!', en: 'I won’t die as fodder... I will breach Floor 100 and return to reality!', original: '소모품으로 죽지 않는다... 100층을 정복하고 현실로 돌아가겠다!' },
          ]
        ),
      },
    ],
  },

  // 20. SSS-Class Suicide Hunter
  {
    id: 'comic-suicide-hunter',
    title: 'SSS-Class Suicide Hunter (ฮันเตอร์ระดับ SSS ฆ่าตัวตายล้างแค้น)',
    originalTitle: 'SSS급 죽어야 사는 헌터',
    slug: 'sss-class-suicide-hunter',
    author: 'Shin Noah',
    artist: 'Bill K',
    genres: ['Action', 'Drama', 'Fantasy', 'Manhwa'],
    synopsis: 'คิมคงจา ฮันเตอร์แรงก์ F ผู้ต่ำต้อย ได้รับสกิลระดับ S "ขโมยสกิลของผู้ที่ฆ่าตนเอง" และสกิลย้อนเวลาเมื่อตาย 24 ชั่วโมง การล้างแค้นและก้าวสู่ฮันเตอร์ระดับตำนานด้วยความตายกว่า 4,000 ครั้งจึงเริ่มต้นขึ้น!',
    coverImage: '/src/assets/images/cover_solo_leveler_1792064406068.jpg',
    rating: 4.9,
    viewCount: 885000,
    status: 'ongoing',
    originalLang: 'ko',
    chapters: [
      {
        id: 'sss-ch-1',
        chapterNumber: 115,
        title: 'ตอนที่ 115',
        publishedAt: 'เพิ่งอัปเดต (NEW)',
        pages: createNinePagesForChapter(
          'SSS-Class Suicide Hunter', 115, 'action', 'คิมคงจา', 'เฟลมเอ็มเพอเรอร์',
          [
            { th: 'ฉันอิจฉาฮันเตอร์ระดับสูงเหล่านั้นเหลือเกิน... ฉันอยากแข็งแกร่งเหมือนพวกเขา!', en: 'I envy those high-rank hunters so much... I crave to be strong like them!', original: '저 높은 랭커들이 너무 부럽다... 나도 그들처럼 강해지고 싶어!' },
            { th: '[หอคอยแห่งการจุติรับรู้ถึงความริษยาอันแรงกล้า - มอบสกิลระดับ EX: "ฉันต้องการเหมือนนาย"]', en: '[The Tower acknowledged absolute envy - Awarded EX Skill: "I Want to Be You"]', original: '[탑이 당신의 광기 어린 질투에 응답했습니다 - EX급 스킬: "네 모습이 부러워"]' },
            { th: 'ทักษะนี้จะทำงานเมื่อฉันถูกฆ่า... และสามารถคัดลอกสกิลของฆาตกรได้หนึ่งอย่าง!', en: 'This skill triggers upon death... Copying one skill from my killer!', original: '이 스킬은 내가 죽었을 때 발동한다... 나를 죽인 자의 스킬을 하나 복사한다!' },
            { th: 'เฟลมเอ็มเพอเรอร์ ฮันเตอร์อันดับ 1 สังหารคงจาเพื่อปิดปาก!', en: 'Flame Emperor, Rank 1 Hunter, executes Gong-ja to silence him!', original: '랭킹 1위 염제가 입막음을 위해 공자를 불태워 죽였다!' },
            { th: '[ท่านเสียชีวิต! ทำการคัดลอกสกิลของเฟลมเอ็มเพอเรอร์: "ย้อนเวลากลับ 24 ชั่วโมง"]', en: '[You died! Copied Flame Emperor’s Skill: "Revert 24 Hours in Time"]', original: '[사망하셨습니다! 염제의 스킬 복사 완료: "24시간 시간 회귀"]' },
            { th: 'ลืมตาขึ้นมาอีกครั้งเมื่อ 24 ชั่วโมงก่อน... ฉันได้รับสกิลย้อนเวลามาแล้ว!', en: 'Awakening 24 hours prior... I have acquired the ultimate time-reversal skill!', original: '24시간 전으로 눈을 떴다... 드디어 시간 회귀 능력을 얻었어!' },
            { th: 'ถ้าฉันตาย 4,000 ครั้ง... ฉันจะย้อนเวลากลับไปก่อนที่หมอนั่นจะได้รับพลัง!', en: 'If I die 4,000 times... I can revert all the way to before he became a monster!', original: '내가 4천 번을 죽는다면... 녀석이 능력을 얻기 전으로 되돌아갈 수 있다!' },
            { th: 'ความเจ็บปวดจากการตายซ้ำแล้วซ้ำเล่า ไม่อาจหยุดความมุ่งมั่นของฉันได้!', en: 'The sheer agony of dying thousands of times will never shatter my resolve!', original: '수천 번의 죽음이 주는 고통도 나의 결의를 꺾을 순 없다!' },
            { th: 'การแก้แค้นที่ยิ่งใหญ่ที่สุดในประวัติศาสตร์ของหอคอย... ได้เริ่มต้นขึ้นแล้ว!', en: 'The greatest retribution in the history of the Tower has begun!', original: '탑 역사상 가장 처절하고 위대한 복수가 시작되었다!' },
          ]
        ),
      },
    ],
  },
];

const UPDATE_SCHEDULE_MINUTES = [
  10,  // Overlord of Insects - วันนี้ 10 นาทีที่แล้ว
  25,  // Isekai Kara Elf-san - วันนี้ 25 นาทีที่แล้ว
  40,  // Solo Leveling: Ragnarok - วันนี้ 40 นาทีที่แล้ว
  55,  // Lookism - วันนี้ 55 นาทีที่แล้ว
  75,  // Magic Emperor - วันนี้ 1 ชั่วโมงที่แล้ว
  95,  // Nano Machine - วันนี้ 1.5 ชั่วโมงที่แล้ว
  120, // Omniscient Reader - วันนี้ 2 ชั่วโมงที่แล้ว
  150, // The Beginning After the End - วันนี้ 2.5 ชั่วโมงที่แล้ว
  180, // Martial Peak - วันนี้ 3 ชั่วโมงที่แล้ว
  220, // The Player That Can’t Level Up - วันนี้ 3.5 ชั่วโมงที่แล้ว
  260, // Honzuki no Gekokujou - วันนี้ 4 ชั่วโมงที่แล้ว
  310, // Eleceed - วันนี้ 5 ชั่วโมงที่แล้ว
  370, // Infinite Mage - วันนี้ 6 ชั่วโมงที่แล้ว
  430, // Disastrous Necromancer - วันนี้ 7 ชั่วโมงที่แล้ว
  500, // Afterlife Diner - วันนี้ 8 ชั่วโมงที่แล้ว
  580, // Reality Quest - วันนี้ 9 ชั่วโมงที่แล้ว
  660, // A Modern Man in Murim - วันนี้ 11 ชั่วโมงที่แล้ว
  740, // Return of the Mount Hua Sect - วันนี้ 12 ชั่วโมงที่แล้ว
  1440 + 120, // Pick Me Up, Infinite Gacha - เมื่อวานนี้
  1440 + 240, // SSS-Class Suicide Hunter - เมื่อวานนี้
];

export const INITIAL_COMICS: Comic[] = deduplicateComics(
  RAW_INITIAL_COMICS.map((comic, idx) => {
    const latestChapter = comic.chapters && comic.chapters.length > 0 ? comic.chapters[0] : null;
    const latestNum = latestChapter ? latestChapter.chapterNumber : 1;
    const initialPages = latestChapter && latestChapter.pages ? latestChapter.pages : [];

    const minutesAgo = UPDATE_SCHEDULE_MINUTES[idx] ?? (idx * 30 + 10);
    const updateTime = new Date(Date.now() - minutesAgo * 60 * 1000);
    const isToday = minutesAgo < 1440;
    const updateText = isToday
      ? minutesAgo < 60
        ? `วันนี้ (${minutesAgo} นาทีที่แล้ว)`
        : `วันนี้ (${Math.floor(minutesAgo / 60)} ชม. ที่แล้ว)`
      : 'เมื่อวานนี้';

    return {
      ...comic,
      updatedAt: updateTime.toISOString(),
      lastChapterUpdatedText: updateText,
      chapters: buildComprehensiveChapterList(
        comic.slug,
        latestNum,
        initialPages,
        `ตอนใหม่ • ${updateText}`
      ),
    };
  }).sort((a, b) => {
    const tA = new Date(a.updatedAt || 0).getTime();
    const tB = new Date(b.updatedAt || 0).getTime();
    return tB - tA;
  })
);

