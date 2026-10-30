-- PrivyShield AI - Database Schema (Supabase PostgreSQL)
-- Description: Security platform database with Row Level Security (RLS)
-- IMPORTANT: Never store original unredacted prompts, plaintext passwords, or raw API keys in database.

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    password_hash TEXT, -- Stored for custom JWT auth if not using Supabase Auth directly
    preferred_ai TEXT DEFAULT 'both', -- 'gemini', 'grok', 'both'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SCAN HISTORY TABLE (Safe Metadata Only - No raw prompt text!)
CREATE TABLE IF NOT EXISTS public.scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('Safe', 'Low', 'Medium', 'High', 'Critical')),
    detection_count INTEGER NOT NULL DEFAULT 0,
    threat_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    sanitized_prompt_hash TEXT NOT NULL,
    provider_status JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"local": "ok", "gemini": "ok", "grok": "unavailable"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SECURITY EVENTS AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- e.g. 'SECRET_INTERCEPTED', 'SCAN_COMPLETED', 'AUTH_LOGIN', 'SETTINGS_UPDATED'
    severity TEXT NOT NULL CHECK (severity IN ('Info', 'Low', 'Medium', 'High', 'Critical')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON public.scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_created_at ON public.scan_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PROFILES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR id::text = current_setting('request.jwt.claim.sub', true));

-- RLS POLICIES FOR SCAN HISTORY
CREATE POLICY "Users can view their own scan history"
    ON public.scan_history FOR SELECT
    USING (auth.uid() = user_id OR user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Service and authenticated users can insert scan history"
    ON public.scan_history FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id::text = current_setting('request.jwt.claim.sub', true) OR auth.role() = 'service_role');

-- RLS POLICIES FOR SECURITY EVENTS
CREATE POLICY "Users can view their own security events"
    ON public.security_events FOR SELECT
    USING (auth.uid() = user_id OR user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Service and authenticated users can insert security events"
    ON public.security_events FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id::text = current_setting('request.jwt.claim.sub', true) OR auth.role() = 'service_role');
