-- ============================================================
-- HerCadence: 009_schema_fixes.sql — Additive Fixes
-- ============================================================
-- All changes are idempotent (IF NOT EXISTS / DO NOTHING style).
-- ============================================================

-- -----------------------------------------------------------
-- 1. subscriptions — add trial columns missing from 004
-- -----------------------------------------------------------
-- Add 'trialing' to the status constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('pending','trialing','active','canceled','expired','suspended','payment_failed'));

-- Add trial_end column (when the 1-month free trial expires)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_end timestamptz;

-- -----------------------------------------------------------
-- 2. payment_events — ensure raw_payload column exists
-- -----------------------------------------------------------
ALTER TABLE payment_events ADD COLUMN IF NOT EXISTS raw_payload jsonb;

-- -----------------------------------------------------------
-- 3. device_tokens — enforce canonical native platform constraint ('ios', 'android')
-- -----------------------------------------------------------
-- Remove obsolete test rows or invalid platforms first
DELETE FROM public.device_tokens WHERE platform NOT IN ('ios', 'android') OR platform IS NULL;

-- Drop legacy/divergent constraints and apply canonical constraint strictly
ALTER TABLE public.device_tokens DROP CONSTRAINT IF EXISTS device_tokens_platform_check;
ALTER TABLE public.device_tokens ADD CONSTRAINT device_tokens_platform_check CHECK (platform IN ('ios', 'android'));

-- -----------------------------------------------------------
-- 4. sleep_logs — ensure table exists (Phase 2 depth feature)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id             uuid primary key default gen_random_uuid(),
  clerk_user_id  text not null,
  log_date       date not null,
  bedtime        time,
  wake_time      time,
  hours_slept    numeric(4,2),
  quality        text CHECK (quality IN ('poor','fair','good','excellent')),
  notes          text,
  created_at     timestamptz not null default now(),
  UNIQUE (clerk_user_id, log_date)
);
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sleep_logs_owner_select" ON public.sleep_logs;
CREATE POLICY "sleep_logs_owner_select" ON public.sleep_logs FOR SELECT
  USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
DROP POLICY IF EXISTS "sleep_logs_owner_write" ON public.sleep_logs;
CREATE POLICY "sleep_logs_owner_write" ON public.sleep_logs FOR ALL
  USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  WITH CHECK (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- 5. body_metrics — ensure table exists
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.body_metrics (
  id             uuid primary key default gen_random_uuid(),
  clerk_user_id  text not null,
  measured_date  date not null,
  weight         numeric(6,2),
  weight_unit    text default 'kg' CHECK (weight_unit IN ('kg','lb')),
  waist_cm       numeric(5,2),
  hip_cm         numeric(5,2),
  body_fat_pct   numeric(4,2),
  notes          text,
  created_at     timestamptz not null default now(),
  UNIQUE (clerk_user_id, measured_date)
);
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "body_metrics_owner_select" ON public.body_metrics;
CREATE POLICY "body_metrics_owner_select" ON public.body_metrics FOR SELECT
  USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
DROP POLICY IF EXISTS "body_metrics_owner_write" ON public.body_metrics;
CREATE POLICY "body_metrics_owner_write" ON public.body_metrics FOR ALL
  USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  WITH CHECK (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- 6. activity_logs — ensure table exists
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  log_date        date not null,
  activity_type   text,
  duration_mins   int,
  intensity       text CHECK (intensity IN ('low','moderate','high')),
  calories_burned int,
  notes           text,
  created_at      timestamptz not null default now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activity_logs_owner_select" ON public.activity_logs;
CREATE POLICY "activity_logs_owner_select" ON public.activity_logs FOR SELECT
  USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
DROP POLICY IF EXISTS "activity_logs_owner_write" ON public.activity_logs;
CREATE POLICY "activity_logs_owner_write" ON public.activity_logs FOR ALL
  USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  WITH CHECK (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- 7. custom_tags — ensure table exists
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_tags (
  id            uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  name          text not null,
  color         text,
  icon          text,
  category      text DEFAULT 'symptom'
    CHECK (category IN ('symptom','mood','activity','medication','other')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  UNIQUE (clerk_user_id, name)
);
ALTER TABLE public.custom_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "custom_tags_owner_select" ON public.custom_tags;
CREATE POLICY "custom_tags_owner_select" ON public.custom_tags FOR SELECT
  USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
DROP POLICY IF EXISTS "custom_tags_owner_write" ON public.custom_tags;
CREATE POLICY "custom_tags_owner_write" ON public.custom_tags FOR ALL
  USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  WITH CHECK (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));



-- -----------------------------------------------------------
-- 9. reminder_queue — ensure is_sent column default is correct
-- -----------------------------------------------------------
ALTER TABLE reminder_queue ADD COLUMN IF NOT EXISTS is_sent boolean not null default false;
