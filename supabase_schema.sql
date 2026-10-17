-- =====================================================================
-- OmniToon AI - Automated Webtoon Platform Database Schema (Supabase/PostgreSQL)
-- Supports Comics, Chapters, Pages, OCR Speech Bubbles, Multilingual Layers,
-- DMCA Takedown Logs, Dynamic Ad Inventory, and Payment Transactions.
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Comics Master Table
CREATE TABLE IF NOT EXISTS public.comics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    author VARCHAR(150),
    artist VARCHAR(150),
    original_language VARCHAR(10) DEFAULT 'ko', -- 'ko', 'ja', 'zh', 'en'
    genres TEXT[] DEFAULT ARRAY['Action', 'Fantasy'],
    synopsis TEXT,
    cover_image_url TEXT NOT NULL,
    banner_image_url TEXT,
    status VARCHAR(50) DEFAULT 'ongoing', -- 'ongoing', 'completed', 'quarantined_dmca'
    is_auto_crawled BOOLEAN DEFAULT true,
    view_count BIGINT DEFAULT 0,
    bookmark_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_comics_slug ON public.comics(slug);
CREATE INDEX IF NOT EXISTS idx_comics_status ON public.comics(status);
CREATE INDEX IF NOT EXISTS idx_comics_genres ON public.comics USING GIN(genres);

-- 2. Chapters Table
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comic_id UUID NOT NULL REFERENCES public.comics(id) ON DELETE CASCADE,
    chapter_number NUMERIC(6, 1) NOT NULL,
    title VARCHAR(255),
    price_coins INT DEFAULT 0, -- 0 = free, >0 = premium coin unlock
    published_status VARCHAR(50) DEFAULT 'published', -- 'draft', 'ocr_processing', 'published', 'quarantined'
    source_url TEXT,
    auto_translated_by VARCHAR(50) DEFAULT 'gemini-3.8-flash',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comic_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_chapters_comic_num ON public.chapters(comic_id, chapter_number);

-- 3. Comic Pages (Webtoon Vertical Panels)
CREATE TABLE IF NOT EXISTS public.comic_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    page_order INT NOT NULL,
    image_url TEXT NOT NULL,
    aspect_ratio NUMERIC(5, 2) DEFAULT 0.56, -- typical 9:16 vertical webtoon slice
    ambient_mood VARCHAR(100), -- 'tense', 'romantic', 'battle', 'mystical'
    bgm_preset VARCHAR(100), -- 'dungeon_ambient', 'battle_orchestra', 'soft_piano'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chapter_id, page_order)
);

-- 4. OCR Speech Bubbles & Multilingual Translations
CREATE TABLE IF NOT EXISTS public.dialog_bubbles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES public.comic_pages(id) ON DELETE CASCADE,
    bubble_order INT NOT NULL,
    bbox_x NUMERIC(5, 2) NOT NULL, -- Left % (0.00 to 100.00)
    bbox_y NUMERIC(5, 2) NOT NULL, -- Top % (0.00 to 100.00)
    bbox_w NUMERIC(5, 2) NOT NULL, -- Width %
    bbox_h NUMERIC(5, 2) NOT NULL, -- Height %
    speaker_name VARCHAR(100),
    speaker_gender VARCHAR(20) DEFAULT 'unknown', -- 'male', 'female', 'creature'
    speaker_tone VARCHAR(50) DEFAULT 'neutral', -- 'angry', 'cheerful', 'brave', 'whisper'
    tts_voice_name VARCHAR(50) DEFAULT 'Kore',
    raw_text TEXT NOT NULL,
    text_th TEXT NOT NULL, -- Fluent Thai translation
    text_en TEXT,
    text_ja TEXT,
    text_ko TEXT,
    audio_tts_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dialog_bubbles_page ON public.dialog_bubbles(page_id);

-- 5. Legal & DMCA Auto-Takedown Registry
CREATE TABLE IF NOT EXISTS public.dmca_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comic_id UUID REFERENCES public.comics(id) ON DELETE SET NULL,
    complainant_name VARCHAR(255) NOT NULL,
    complainant_email VARCHAR(255) NOT NULL,
    copyright_work_title VARCHAR(255) NOT NULL,
    evidence_url TEXT NOT NULL,
    formal_statement TEXT NOT NULL,
    ai_verdict VARCHAR(50) NOT NULL, -- 'quarantine_immediate', 'escalate', 'reject'
    ai_confidence_score NUMERIC(5, 2),
    action_taken TEXT,
    formal_reply_sent BOOLEAN DEFAULT true,
    formal_letter_th TEXT,
    formal_letter_en TEXT,
    status VARCHAR(50) DEFAULT 'resolved_takedown',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Dynamic Ads Inventory & AI Guardrails
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sponsor_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    ad_title VARCHAR(255) NOT NULL,
    ad_copy TEXT,
    target_url TEXT NOT NULL,
    banner_image_url TEXT,
    placement_type VARCHAR(50) DEFAULT 'banner', -- 'banner', 'in_reader_panel', 'interstitial'
    dynamic_cpm_rate NUMERIC(10, 2) NOT NULL, -- Price in THB
    total_impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    ai_guardrail_status VARCHAR(50) DEFAULT 'approved', -- 'approved', 'rejected'
    ai_compliance_score NUMERIC(5, 2),
    thai_legal_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Monetization Transactions & Stripe/PromptPay Records
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_code VARCHAR(100) UNIQUE NOT NULL, -- e.g. TXN-12345678
    user_email VARCHAR(255) NOT NULL,
    tier_name VARCHAR(100) NOT NULL,
    amount_thb NUMERIC(10, 2) NOT NULL,
    coins_awarded INT DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL, -- 'stripe_card', 'promptpay_qr', 'truemoney'
    stripe_charge_id VARCHAR(255),
    promptpay_ref VARCHAR(255),
    status VARCHAR(50) DEFAULT 'completed',
    line_notify_dispatched BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. User Bookmarks & Reading Progress
CREATE TABLE IF NOT EXISTS public.user_reading_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Links to Supabase auth.users
    comic_id UUID NOT NULL REFERENCES public.comics(id) ON DELETE CASCADE,
    last_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    last_scroll_percentage NUMERIC(5, 2) DEFAULT 0.0,
    is_bookmarked BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, comic_id)
);

-- Row Level Security (RLS) setup for public read & secure writes
ALTER TABLE public.comics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comic_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialog_bubbles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active comics" 
    ON public.comics FOR SELECT 
    USING (status != 'quarantined_dmca');

CREATE POLICY "Allow public read access to published chapters" 
    ON public.chapters FOR SELECT 
    USING (published_status = 'published');

CREATE POLICY "Allow public read access to comic pages" 
    ON public.comic_pages FOR SELECT 
    USING (true);

CREATE POLICY "Allow public read access to dialog bubbles" 
    ON public.dialog_bubbles FOR SELECT 
    USING (true);
