/**
 * Professional Webtoon Artwork & Scene Generator
 * Creates authentic serialized manhwa/manga panels (SVG Data URIs)
 * Each page features distinctive cinematography: wide vistas, character portraits,
 * energy auras, speed lines, clashing blades, and cliffhangers.
 */

interface PanelConfig {
  comicTitle: string;
  chapterNumber: number;
  pageNumber: number;
  theme?: 'fantasy' | 'action' | 'murim' | 'scifi' | 'mystery' | 'romance';
  sceneDescription?: string;
  sfxText?: string;
}

const THEME_PALETTES = {
  fantasy: {
    bg1: '#090d16',
    bg2: '#1e1b4b',
    accent: '#818cf8',
    glow: '#c084fc',
    sfxColor: '#f43f5e',
    defaultSfx: 'ฟู่ววว...!!',
  },
  action: {
    bg1: '#140c0c',
    bg2: '#581c1c',
    accent: '#f87171',
    glow: '#fbbf24',
    sfxColor: '#ef4444',
    defaultSfx: 'ตู๊มมมม!!',
  },
  murim: {
    bg1: '#120f0c',
    bg2: '#381e0d',
    accent: '#f59e0b',
    glow: '#fb923c',
    sfxColor: '#ea580c',
    defaultSfx: 'ชิ้งงงง!!',
  },
  scifi: {
    bg1: '#050c12',
    bg2: '#063b39',
    accent: '#34d399',
    glow: '#22d3ee',
    sfxColor: '#06b6d4',
    defaultSfx: 'วิ้งงงง!',
  },
  mystery: {
    bg1: '#0a0812',
    bg2: '#281145',
    accent: '#a855f7',
    glow: '#e879f9',
    sfxColor: '#d946ef',
    defaultSfx: 'แกร๊กกก...',
  },
  romance: {
    bg1: '#140b10',
    bg2: '#521430',
    accent: '#f472b6',
    glow: '#fbcfe8',
    sfxColor: '#db2777',
    defaultSfx: 'ตึกตัก...ตึกตัก',
  },
};

export function generateWebtoonPanelSvg(config: PanelConfig): string {
  const { comicTitle, chapterNumber, pageNumber, theme = 'fantasy', sceneDescription, sfxText } = config;
  const p = THEME_PALETTES[theme] || THEME_PALETTES.fantasy;
  const sfx = sfxText || p.defaultSfx;
  const shortTitle = comicTitle.split('(')[0].trim();

  // Determine panel composition layout based on page number
  let panelComposition = '';

  if (pageNumber === 1) {
    // Page 1: Wide cinematic panorama / domain gate
    panelComposition = `
      <!-- Ruined Citadel / Spatial Rift -->
      <polygon points="50,900 180,680 280,720 400,520 520,720 620,680 750,900" fill="#0f172a" stroke="${p.accent}" stroke-width="2" />
      <circle cx="400" cy="460" r="140" fill="url(#glowGrad)" opacity="0.8" />
      <ellipse cx="400" cy="460" rx="90" ry="130" fill="none" stroke="${p.glow}" stroke-width="4" stroke-dasharray="8 6"/>
      <!-- Distant Lightning Arcs -->
      <path d="M 360,200 L 400,340 L 380,360 L 440,480" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.9"/>
    `;
  } else if (pageNumber === 2 || pageNumber === 4) {
    // Page 2 & 4: Character intense closeup / emotion profile
    panelComposition = `
      <!-- Character Head & Anime Expression Profile -->
      <g filter="url(#shadow)">
        <!-- Face & Jawline -->
        <polygon points="320,440 400,640 480,440 460,340 340,340" fill="#ffffff" opacity="0.95" />
        <!-- Sharp Anime Eyes -->
        <polygon points="350,420 380,430 350,435" fill="${p.sfxColor}" />
        <polygon points="450,420 420,430 450,435" fill="${p.sfxColor}" />
        <circle cx="365" cy="426" r="3" fill="#ffffff" />
        <circle cx="435" cy="426" r="3" fill="#ffffff" />
        <!-- Flowing Spiky Hair -->
        <path d="M 300,380 L 260,280 L 330,320 L 360,220 L 400,300 L 440,210 L 470,300 L 530,260 L 500,380 Z" fill="#0f172a" stroke="${p.accent}" stroke-width="4"/>
        <!-- Collar & Robe -->
        <path d="M 280,680 L 400,620 L 520,680 L 580,950 L 220,950 Z" fill="#090d16" stroke="${p.glow}" stroke-width="3" />
      </g>
    `;
  } else if (pageNumber === 5 || pageNumber === 8) {
    // Page 5 & 8: High-impact battle splash panel (ตู๊มมม!)
    panelComposition = `
      <!-- Radial Impact Shockwave -->
      <circle cx="400" cy="580" r="280" fill="none" stroke="${p.glow}" stroke-width="12" opacity="0.7"/>
      <circle cx="400" cy="580" r="180" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.9"/>
      <!-- Flying Debris / Rock Shards -->
      <polygon points="200,400 240,430 220,460" fill="#ffffff" opacity="0.8" />
      <polygon points="580,380 620,420 590,440" fill="#ffffff" opacity="0.8" />
      <polygon points="280,780 320,810 290,830" fill="${p.accent}" opacity="0.9" />
      <polygon points="520,760 550,800 500,810" fill="${p.accent}" opacity="0.9" />
      <!-- Energy Beam Cross -->
      <line x1="100" y1="280" x2="700" y2="880" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
      <line x1="100" y1="280" x2="700" y2="880" stroke="${p.sfxColor}" stroke-width="18" opacity="0.6"/>
      <line x1="700" y1="280" x2="100" y2="880" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
      <line x1="700" y1="280" x2="100" y2="880" stroke="${p.glow}" stroke-width="18" opacity="0.6"/>
    `;
  } else if (pageNumber === 7) {
    // Page 7: Awakening of Sovereign Power / Rune Formation
    panelComposition = `
      <!-- Magic Rune Circle -->
      <circle cx="400" cy="560" r="240" fill="none" stroke="${p.accent}" stroke-width="3" stroke-dasharray="24 12" />
      <circle cx="400" cy="560" r="180" fill="none" stroke="${p.glow}" stroke-width="2" />
      <polygon points="400,320 600,680 200,680" fill="none" stroke="${p.glow}" stroke-width="3" />
      <polygon points="400,800 600,440 200,440" fill="none" stroke="${p.glow}" stroke-width="3" />
      <!-- Rising Sovereign Aura Silhouette -->
      <path d="M 400 380 C 370 380 350 410 350 450 C 350 490 370 520 400 520 C 430 520 450 490 450 450 C 450 410 430 380 400 380 Z" fill="#ffffff" />
      <path d="M 330 510 L 260 840 L 400 780 L 540 840 L 470 510 Z" fill="#090d16" stroke="${p.accent}" stroke-width="4"/>
    `;
  } else if (pageNumber === 9) {
    // Page 9: Dramatic Outro Cliffhanger
    panelComposition = `
      <!-- Mystery Silhouette with Glowing Eyes -->
      <rect x="250" y="320" width="300" height="420" rx="30" fill="#050811" stroke="${p.sfxColor}" stroke-width="3" />
      <!-- Ominous Red Eyes -->
      <circle cx="360" cy="460" r="12" fill="${p.sfxColor}" filter="url(#glowGrad)"/>
      <circle cx="440" cy="460" r="12" fill="${p.sfxColor}" filter="url(#glowGrad)"/>
      <circle cx="360" cy="460" r="4" fill="#ffffff" />
      <circle cx="440" cy="460" r="4" fill="#ffffff" />
      <!-- Shadow tendrils -->
      <path d="M 250,600 Q 180,680 120,620 Q 200,740 280,680 Z" fill="#050811" opacity="0.8"/>
      <path d="M 550,600 Q 620,680 680,620 Q 600,740 520,680 Z" fill="#050811" opacity="0.8"/>
    `;
  } else {
    // Standard tactical choreography (3, 6)
    panelComposition = `
      <g filter="url(#shadow)">
        <circle cx="400" cy="560" r="150" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.6"/>
        <path d="M 340 480 L 280 780 L 360 740 L 400 830 L 440 740 L 520 780 L 460 480 Z" fill="#090d16" stroke="${p.accent}" stroke-width="4"/>
        <line x1="480" y1="460" x2="640" y2="280" stroke="${p.glow}" stroke-width="8" stroke-linecap="round" />
        <line x1="480" y1="460" x2="640" y2="280" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
      </g>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}" />
      <stop offset="50%" stop-color="${p.bg2}" />
      <stop offset="100%" stop-color="${p.bg1}" />
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.85"/>
    </filter>
  </defs>

  <!-- Dark Atmospheric Background -->
  <rect width="800" height="1200" fill="url(#bgGrad)" />

  <!-- Manga Speed Rays -->
  <g opacity="${pageNumber === 5 || pageNumber === 8 ? '0.38' : '0.18'}" stroke="${p.accent}" stroke-width="2">
    <line x1="400" y1="560" x2="0" y2="0" />
    <line x1="400" y1="560" x2="200" y2="0" />
    <line x1="400" y1="560" x2="400" y2="0" />
    <line x1="400" y1="560" x2="600" y2="0" />
    <line x1="400" y1="560" x2="800" y2="0" />
    <line x1="400" y1="560" x2="800" y2="400" />
    <line x1="400" y1="560" x2="800" y2="800" />
    <line x1="400" y1="560" x2="800" y2="1200" />
    <line x1="400" y1="560" x2="400" y2="1200" />
    <line x1="400" y1="560" x2="0" y2="1200" />
    <line x1="400" y1="560" x2="0" y2="600" />
  </g>

  <!-- Aura Glow Center -->
  <circle cx="400" cy="560" r="300" fill="url(#glowGrad)" />

  <!-- Outer Webtoon Border Frame -->
  <rect x="20" y="20" width="760" height="1160" fill="none" stroke="${p.accent}" stroke-width="2.5" opacity="0.6" rx="10" />

  <!-- Specific Composition Artwork -->
  ${panelComposition}

  <!-- Manga Sound Effect (SFX) -->
  <g transform="translate(${pageNumber % 2 === 0 ? 530 : 490}, ${pageNumber === 5 ? 260 : 320}) rotate(${pageNumber % 2 === 0 ? 8 : -10})">
    <text font-family="'Noto Sans Thai', Impact, sans-serif" font-size="${pageNumber === 5 || pageNumber === 8 ? '68' : '52'}" font-weight="900" fill="${p.sfxColor}" stroke="#ffffff" stroke-width="5" paint-order="stroke fill" text-anchor="middle">
      ${sfx}
    </text>
  </g>

  <!-- Top Title Bar -->
  <rect x="40" y="40" width="720" height="46" rx="8" fill="#000000" fill-opacity="0.8" stroke="#f472b6" stroke-width="1.2"/>
  <text x="65" y="70" font-family="'Noto Sans Thai', sans-serif" font-size="17" font-weight="700" fill="#ffffff">
    ${shortTitle} • ตอนที่ ${chapterNumber}
  </text>
  <text x="735" y="70" font-family="'Noto Sans Thai', sans-serif" font-size="15" font-weight="700" fill="#f472b6" text-anchor="end">
    หน้า ${pageNumber}/9
  </text>

  <!-- Bottom Scene Narrative Context -->
  <rect x="40" y="1080" width="720" height="70" rx="8" fill="#000000" fill-opacity="0.88" stroke="${p.accent}" stroke-width="1.2"/>
  <text x="65" y="1112" font-family="'Noto Sans Thai', sans-serif" font-size="15" font-weight="600" fill="#e2e8f0">
    ${sceneDescription || (pageNumber === 1 ? 'จุดเริ่มต้นของการเดินทางครั้งใหม่ ความเงียบงันถูกทำลายลง...' : pageNumber === 9 ? 'เรื่องราวกำลังเข้มข้น โปรดติดตามต่อในตอนถัดไป!' : 'การต่อสู้ทวีความรุนแรง คลื่นพลังเอ่อล้นปกคลุมสมรภูมิ!')}
  </text>
  <text x="65" y="1136" font-family="'Noto Sans Thai', sans-serif" font-size="12" font-weight="500" fill="#f472b6">
    manga-oc • สร้างสรรค์และวาดโดย AI อัตโนมัติ สไลด์อ่านต่อเนื่อง
  </text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
