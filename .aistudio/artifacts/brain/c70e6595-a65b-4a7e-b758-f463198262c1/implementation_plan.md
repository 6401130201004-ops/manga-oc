# OmniToon AI: Automated Multilingual Webtoon Platform

A full-stack comic platform powered by Gemini API featuring real-time multilingual speech bubble overlays, emotion-aware character voice TTS, ambient scene music, automated chapter discovery and publishing pipeline, legal DMCA auto-takedown, dynamic ad pricing with Thai legal guardrails, and automated monetization with Stripe, PromptPay QR, and LINE Notify.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been aligned based on user selections:
> - **Reader Layout**: Defaulting to **Vertical Webtoon Infinite Scroll** optimized for both smartphone touch ergonomics and wide desktop screens.
> - **AI Character Voice & BGM**: Integrated **Auto-Narrate on Scroll** with synchronized ambient scene audio, plus on-demand tap-to-speak speech bubble overlays.
> - **Monetization Model**: **Free ad-supported chapters with optional donation perks and coin-based early access**, powered by Stripe and PromptPay QR.
> - **API Key & Keys Handling**: Secure server-side processing for Gemini API (`process.env.GEMINI_API_KEY`), Stripe keys (`pk_live...` / `mk_...`), and LINE Notify webhook notifications.

---

## 1. Overview & Core Concept

OmniToon AI bridges comic storytelling with Google Gemini intelligence. Readers can enjoy raw international comics (Korean, Japanese, Chinese, English) translated on-the-fly into Thai with context-aware colloquial nuances, listen to expressive character voices generated according to visual gender and mood, and immerse in adaptive scene music.

Behind the scenes, the platform automates webmaster revenue operations:
1. **Automated Content Pipeline**: Crawls new chapters, runs OCR on dialog bubbles, translates contextually, and auto-publishes.
2. **DMCA Legal Auto-Takedown**: Protects copyright holders with an automated AI validation gate and instant content isolation complying with Thai copyright laws.
3. **Monetization & Ad Guardrails**: Dynamically prices sponsor ad inventory based on live pageviews, while strict AI guardrails automatically reject illicit Thai gambling, counterfeit, or predatory ads.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Reader Discovery**: Browse trending titles, latest updates, and genre filters (Action, Romance, Fantasy, Slice of Life) with instant cover previews and metadata.
2. **Infinite Scroll Webtoon Reader**:
   - Continuous vertical flow with responsive panel width.
   - **Language HUD**: Instant switch between Thai (TH), English (EN), Japanese (JA), Korean (KO), and Original raw dialogs.
   - **AI Audio Companion**: Dynamic BGM plays based on scene emotion (tense, comedic, sorrowful, battle); character speech bubbles can be tapped or auto-narrated with voice actors matched to visual cues.
   - **Bookmark & History**: Persistent progress tracking saved locally and syncable.
3. **Automated Ad & Monetization Hub**:
   - Dynamic banner placements with transparent CPM analytics.
   - Advertisers can submit campaigns; AI reviews the image and copy in real-time against Thai laws.
   - Readers can support creators or buy coins via Stripe or PromptPay QR, triggering instant LINE Notify webhook alerts.
4. **Legal Compliance Center**:
   - Dedicated DMCA portal allowing rights holders to file complaints with instant AI validation, auto-quarantine, and audit trail generation.
5. **Admin Operations Cockpit**:
   - Real-time pipeline monitor showing incoming webhooks, OCR progress, and publish logs.

### Visual Identity & Theme
- **Aesthetic Direction**: Modern Korean/Japanese digital manhwa platform with clean editorial spacing, dark-mode immersion, and high contrast typography.
- **Color Palette**:
  - Background: Deep slate canvas `#0b0f19` (dark) / `#f8fafc` (light)
  - Card & Surfaces: `#131b2e` with hairline borders `#1e293b`
  - Brand Accent: Vivid Coral Neon `#ff4655` & Electric Cyan `#00e5ff` for interactive highlights
  - Text: Crisp `#f1f5f9` primary, `#94a3b8` muted metadata
- **Typography & Hierarchy**:
  - Display Font: `Plus Jakarta Sans` / `Outfit`
  - Body & Comic Font: `Noto Sans Thai` & `Plus Jakarta Sans`
  - Numbers & Metrics: `tabular-nums font-mono`

---

## 3. Key Product Decisions & Trade-Offs

- **Server-Side Gemini Multi-Modal OCR & Voice Analysis**:
  - *Chosen Approach*: Send comic page images to server routes (`/api/gemini/ocr-translate` and `/api/gemini/character-tts`), where Gemini extracts bounding boxes, text, character traits, and generates spoken audio.
  - *Why*: Protects Gemini API keys, avoids client bundle bloat, and guarantees high-performance text-layer rendering on top of the original artwork.
- **Procedural & Synthesized Ambient Scene Music**:
  - *Chosen Approach*: Multi-layered Web Audio soundscape engine coupled with Gemini Lyria clip generation triggers for key dramatic transitions.
  - *Why*: Eliminates continuous audio buffering delays, ensuring instant background score changes as the user scrolls between comedic and dramatic panels.
- **Strict Thai Legal Ad Guardrails**:
  - *Chosen Approach*: Dual-pass AI filter checking image and textual claims against the Thai Gambling Act (พ.ร.บ. การพนัน), Alcoholic Beverage Control Act, and Consumer Protection laws before ad checkout.
  - *Why*: Protects site operators from legal liability and prevents malicious phishing or illicit ad networks.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OmniToon Web Application                        │
│                                                                        │
│  ┌──────────────────────────┐    ┌───────────────────────────────────┐ │
│  │   Webtoon Comic Feed     │    │   Vertical Infinite Reader        │ │
│  │  - Search & Categories   │    │  - Multilingual Bubble Overlay    │ │
│  │  - History & Bookmarks   │    │  - Scroll Auto-Narrate & TTS      │ │
│  │  - Coin / Donation Perks │    │  - Adaptive Scene BGM Engine      │ │
│  └─────────────┬────────────┘    └─────────────────┬─────────────────┘ │
│                │                                   │                   │
│  ┌─────────────▼────────────┐    ┌─────────────────▼─────────────────┐ │
│  │   Monetization & Ads     │    │   DMCA Notice & Takedown          │ │
│  │  - Dynamic CPM Pricing   │    │  - Rights Holder Verification     │ │
│  │  - AI Thai Law Guardrail │    │  - Instant Auto-Quarantine        │ │
│  │  - Stripe & PromptPay QR │    │  - Formal Bilingual Response      │ │
│  └──────────────────────────┘    └───────────────────────────────────┘ │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Server API & Automation Pipeline                     │
│                                                                        │
│  ┌──────────────────────────┐    ┌───────────────────────────────────┐ │
│  │  /api/gemini/ocr-extract │    │   /api/gemini/character-voice     │ │
│  │  - Vision OCR & Bounding │    │   - Character Mood/Gender Vision  │ │
│  │  - Contextual Thai Trans │    │   - Gemini TTS Voice Generation   │ │
│  └──────────────────────────┘    └───────────────────────────────────┘ │
│  ┌──────────────────────────┐    ┌───────────────────────────────────┐ │
│  │  /api/pipeline/webhook   │    │   /api/monetization/checkout      │ │
│  │  - Source Auto-Detector  │    │   - Stripe Checkout / PromptPay   │ │
│  │  - Chapter Auto-Publish  │    │   - LINE Notify Alert Dispatcher  │ │
│  └──────────────────────────┘    └───────────────────────────────────┘ │
│  ┌──────────────────────────┐    ┌───────────────────────────────────┐ │
│  │  /api/dmca/process       │    │   /api/ads/ai-guardrail           │ │
│  │  - Gemini Legal Auditor  │    │   - Thai Law Compliance Scanner   │ │
│  │  - Automated Quarantine  │    │   - Dynamic CPM Calculator        │ │
│  └──────────────────────────┘    └───────────────────────────────────┘ │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Database & Persistence Schema (Supabase/PostgreSQL)     │
│  - comics (id, title, author, genres, cover_url, status)               │
│  - chapters (id, comic_id, chapter_num, title, published_at, status)   │
│  - comic_pages (id, chapter_id, page_num, image_url, audio_bgm)        │
│  - dialog_bubbles (id, page_id, bbox, en, th, ja, ko, speaker_traits)  │
│  - dmca_reports (id, comic_id, complainant_name, status, ai_summary)   │
│  - ads_inventory (id, sponsor_name, ad_image, cpm, status, review)    │
│  - transactions (id, user_email, amount, method, status, line_notified)│
└────────────────────────────────────────────────────────────────────────┘
```

### Complete Implementation Steps
1. **Server-Side API Hub (`server.ts` & API Routes)**:
   - Configure Express server with proxying for Gemini 3.8/4 models.
   - Endpoints for OCR bubble detection, character TTS, audio BGM mood extraction, DMCA validation, ad compliance guardrail, Stripe checkout, and LINE Notify.
2. **Database Engine & Mock Data Seeder**:
   - Provide SQL schema ready for Supabase / PostgreSQL.
   - Built-in persistent state store with pre-loaded rich manga/webtoon series (action, fantasy, romance) with interactive speech bubbles and character voice tags.
3. **Frontend Reader Experience**:
   - Webtoon canvas with multi-language selector overlay (Thai, English, Japanese, Korean).
   - Auto-scroll narration with visual voice bubble highlighting.
   - Web Audio ambient background mood generator.
4. **Content Pipeline & Webhook Simulation Console**:
   - Visual dashboard simulating incoming chapter crawlers, running real-time Gemini OCR translation, and showing live auto-publish status.
5. **Monetization, Ad Guardrails & Payment Flow**:
   - Real-time dynamic CPM calculator based on simulated pageviews.
   - AI Ad submit form with instant Thai law compliance checker.
   - Stripe card payment + PromptPay QR checkout simulator with instant LINE Notify trigger.
6. **Legal DMCA Auto-Takedown Portal**:
   - Formal notice filing form with instant AI evidence evaluation, auto-takedown action, and preview of bilingual legal resolution notice.
