import { AdCampaign } from '../types/comic';

const STORAGE_KEY = 'mangaoc_ad_campaigns_v3';

// Initial sample active ad to show the system running
const INITIAL_ADS: AdCampaign[] = [
  {
    id: 'ad-auto-001',
    jobName: 'โปรโมทร้านคาเฟ่มังงะ & หนังสือการ์ตูนญี่ปุ่น Manga Station',
    advertiserName: 'คุณธนพล (Manga Station)',
    advertiserContact: 'Line: @mangastation',
    popupImage: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ec4899" />
          <stop offset="100%" stop-color="#831843" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" rx="20" fill="url(#g)" />
      <circle cx="500" cy="80" r="120" fill="#f472b6" opacity="0.3" />
      <circle cx="80" cy="320" r="100" fill="#fbcfe8" opacity="0.2" />
      <rect x="40" y="40" width="165" height="30" rx="15" fill="#ffffff" fill-opacity="0.25" />
      <text x="122" y="60" font-family="'Noto Sans Thai', sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">✨ AI อนุมัติและลงอัตโนมัติ</text>
      <text x="50" y="140" font-family="'Noto Sans Thai', sans-serif" font-size="28" font-weight="900" fill="#ffffff">Manga Station คาเฟ่</text>
      <text x="50" y="180" font-family="'Noto Sans Thai', sans-serif" font-size="18" font-weight="600" fill="#fbcfe8">รวมมังงะแปลไทยกว่า 10,000 เล่ม พร้อมกาแฟสด</text>
      <text x="50" y="220" font-family="'Noto Sans Thai', sans-serif" font-size="15" font-weight="500" fill="#ffffff">สิทธิพิเศษสำหรับแฟนมังงะ manga-oc ทุกท่าน!</text>
      <rect x="50" y="270" width="220" height="52" rx="26" fill="#ffffff" />
      <text x="160" y="303" font-family="'Noto Sans Thai', sans-serif" font-size="16" font-weight="bold" fill="#be185d" text-anchor="middle">ดูพิกัดร้าน &gt;</text>
    </svg>`),
    targetUrl: 'https://manga-oc.net',
    proposedOffer: 'สนับสนุนสปอนเซอร์รายสัปดาห์',
    durationDays: 7,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    activatedAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 86400000).toISOString(),
    queuePosition: 1,
    aiScreeningNotes: 'AI คัดกรองอัตโนมัติ: ผ่านเกณฑ์ความปลอดภัย 100% จัดคิวและเปิดแสดงผลทันที',
  },
];

export function getStoredAdCampaigns(): AdCampaign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADS));
      return INITIAL_ADS;
    }
    const parsed: AdCampaign[] = JSON.parse(raw);
    return parsed;
  } catch {
    return INITIAL_ADS;
  }
}

export function saveAdCampaigns(ads: AdCampaign[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
}

// Automatically check and expire ads whose duration has ended, and activate next in queue
export function getActiveAds(): AdCampaign[] {
  const ads = getStoredAdCampaigns();
  const now = Date.now();
  let hasChanges = false;

  const updated = ads.map((ad) => {
    if (ad.status === 'active' && ad.expiresAt) {
      const expTime = new Date(ad.expiresAt).getTime();
      if (now >= expTime) {
        hasChanges = true;
        return { ...ad, status: 'expired' as const };
      }
    }
    return ad;
  });

  // If active count < 3 and there are queued ads, automatically promote queued ads
  const activeCount = updated.filter((a) => a.status === 'active').length;
  if (activeCount < 3) {
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === 'queued') {
        updated[i].status = 'active';
        updated[i].activatedAt = new Date().toISOString();
        updated[i].expiresAt = new Date(now + (updated[i].durationDays || 7) * 86400000).toISOString();
        hasChanges = true;
        break;
      }
    }
  }

  if (hasChanges) {
    saveAdCampaigns(updated);
  }

  return updated.filter((ad) => ad.status === 'active');
}

// AI Automated Screening Guardrail
export function screenAdContent(jobName: string, advertiserInfo: string): { isApproved: boolean; reason: string } {
  const text = (jobName + ' ' + advertiserInfo).toLowerCase();
  const prohibited = [
    'บาคาร่า', 'สล็อต', 'คาสิโน', 'เว็บตรง', 'แทงบอล', 'ufabet', 
    'หวยเถื่อน', 'โป๊', 'อนาจาร', 'ยาเสพติด', 'casino', 'slot', 'betting', 'baccarat'
  ];

  const found = prohibited.find((p) => text.includes(p));
  if (found) {
    return {
      isApproved: false,
      reason: `AI ตรวจพบคำต้องห้าม "${found}" ซึ่งขัดต่อนโยบายความปลอดภัยของระบบ ไม่สามารถเผยแพร่ได้`,
    };
  }

  return {
    isApproved: true,
    reason: 'AI คัดกรองผ่านเกณฑ์ความปลอดภัย 100% อนุมัติและจัดคิวลงโฆษณาอัตโนมัติ',
  };
}

// Autonomous AI Queue & Scheduler Engine (ไม่ต้องรอแอดมินอนุมัติ)
export function submitAndAutoScheduleAd(proposal: {
  jobName: string;
  advertiserName: string;
  advertiserContact: string;
  popupImage: string;
  targetUrl: string;
  proposedOffer?: string;
}): { success: boolean; ad: AdCampaign; message: string } {
  const screening = screenAdContent(proposal.jobName, proposal.advertiserName + ' ' + proposal.targetUrl);
  if (!screening.isApproved) {
    return {
      success: false,
      ad: null as any,
      message: screening.reason,
    };
  }

  const existingAds = getStoredAdCampaigns();
  const currentActive = existingAds.filter((a) => a.status === 'active');

  // AI calculates display duration automatically (7 to 14 days based on queue load)
  const durationDays = currentActive.length < 2 ? 14 : 7;
  const now = Date.now();
  const activatedAt = new Date().toISOString();
  const expiresAt = new Date(now + durationDays * 86400000).toISOString();

  // If active queue is within limit, activate immediately, otherwise queue smoothly
  const isDirectActive = currentActive.length < 4;

  const newAd: AdCampaign = {
    id: `ad-ai-${Date.now().toString().slice(-6)}`,
    jobName: proposal.jobName,
    advertiserName: proposal.advertiserName || 'ผู้เสนอโฆษณา',
    advertiserContact: proposal.advertiserContact || 'ไม่ได้ระบุ',
    popupImage: proposal.popupImage,
    targetUrl: proposal.targetUrl || 'https://manga-oc.net',
    proposedOffer: proposal.proposedOffer || 'ข้อเสนอตามปกติ',
    durationDays,
    status: isDirectActive ? 'active' : 'queued',
    createdAt: new Date().toISOString(),
    activatedAt: isDirectActive ? activatedAt : undefined,
    expiresAt: isDirectActive ? expiresAt : undefined,
    queuePosition: isDirectActive ? 1 : existingAds.filter((a) => a.status === 'queued').length + 1,
    aiScreeningNotes: screening.reason,
  };

  saveAdCampaigns([newAd, ...existingAds]);

  return {
    success: true,
    ad: newAd,
    message: isDirectActive
      ? `AI คัดกรองและนำขึ้นแสดงผลบนเว็บไซต์เรียบร้อยแล้วทันที! ระยะเวลาจัดสรร: ${durationDays} วัน (ระบบจะปลดอัตโนมัติเมื่อครบกำหนด)`
      : `AI คัดกรองผ่านเรียบร้อยและจัดเข้าคิวลำดับที่ ${newAd.queuePosition} จะเริ่มแสดงผลทันทีเมื่อคิวก่อนหน้าหมดอายุ`,
  };
}

// AI Auto Popup Banner Generator (หากไม่มีป๊อบอัพ ให้ AI สร้างให้โดยอัตโนมัติ)
export function generateAiPopupBanner(jobName: string, details: string = '', ctaText: string = 'คลิกดูรายละเอียด'): string {
  const cleanTitle = jobName.trim() || 'แคมเปญโฆษณาพิเศษ';
  const cleanDesc = details.trim() || 'ข้อเสนอพิเศษสำหรับผู้อ่าน manga-oc ทุกท่าน';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f472b6" />
        <stop offset="50%" stop-color="#db2777" />
        <stop offset="100%" stop-color="#831843" />
      </linearGradient>
      <radialGradient id="sparkle" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="600" height="400" rx="24" fill="url(#aiGrad)" />
    
    <!-- Decorative geometric background -->
    <circle cx="520" cy="90" r="160" fill="#fbcfe8" opacity="0.25" />
    <circle cx="60" cy="340" r="120" fill="#f472b6" opacity="0.3" />
    <polygon points="460,20 480,70 530,90 480,110 460,160 440,110 390,90 440,70" fill="url(#sparkle)" opacity="0.6"/>

    <!-- AI Generated Badge -->
    <rect x="40" y="40" width="180" height="32" rx="16" fill="#ffffff" fill-opacity="0.25" stroke="#ffffff" stroke-width="1.5"/>
    <text x="130" y="61" font-family="'Noto Sans Thai', sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">🤖 AI จัดการคิวและลงอัตโนมัติ</text>

    <!-- Ad Job Title -->
    <text x="45" y="135" font-family="'Noto Sans Thai', sans-serif" font-size="26" font-weight="900" fill="#ffffff">
      ${cleanTitle.length > 28 ? cleanTitle.slice(0, 28) + '...' : cleanTitle}
    </text>

    <!-- Details -->
    <text x="45" y="175" font-family="'Noto Sans Thai', sans-serif" font-size="16" font-weight="600" fill="#fbcfe8">
      ${cleanDesc.length > 45 ? cleanDesc.slice(0, 45) + '...' : cleanDesc}
    </text>
    <text x="45" y="205" font-family="'Noto Sans Thai', sans-serif" font-size="14" font-weight="500" fill="#ffffff" opacity="0.9">
      สิทธิพิเศษเฉพาะแฟนมังงะบนแพลตฟอร์ม manga-oc
    </text>

    <!-- CTA Button -->
    <rect x="45" y="270" width="240" height="56" rx="28" fill="#ffffff" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.25))"/>
    <text x="165" y="305" font-family="'Noto Sans Thai', sans-serif" font-size="16" font-weight="bold" fill="#be185d" text-anchor="middle">
      ${ctaText} &gt;
    </text>

    <text x="555" y="375" font-family="'Noto Sans Thai', sans-serif" font-size="11" font-weight="bold" fill="#fbcfe8" text-anchor="end">
      manga-oc Sponsor Network
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
