-- ============================================================
-- HerCadence: 008_backend_schema.sql — Additive & Idempotent Schema
-- ============================================================
-- All tables feature clerk_user_id and RLS owner policies.
-- ============================================================

-- -----------------------------------------------------------
-- 1. Core Health Data
-- -----------------------------------------------------------

-- profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  user_name text not null default '',
  email text not null default '',
  avatar_url text,
  onboarding_completed boolean not null default false,
  cycle_length_days int not null default 28,
  period_length_days int not null default 5,
  luteal_phase_days int not null default 14,
  last_period_start date,
  temperature_unit text not null default 'Celsius' check (temperature_unit in ('Celsius','Fahrenheit')),
  weight_unit text not null default 'kg' check (weight_unit in ('kg','lb')),
  start_day_of_week text not null default 'Sunday' check (start_day_of_week in ('Sunday','Monday')),
  show_week_numbers boolean not null default true,
  language text not null default 'English (US)',
  region text not null default 'United States',
  selected_goal text not null default 'PERIOD' check (selected_goal in ('PERIOD','OVULATION','PREGNANCY','WELLNESS')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;

drop policy if exists "profiles_owner_select" on public.profiles;
create policy "profiles_owner_select" on public.profiles for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "profiles_owner_write" on public.profiles;
create policy "profiles_owner_write" on public.profiles for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- cycles
create table if not exists public.cycles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  cycle_number int,
  start_date date not null,
  end_date date,
  cycle_length int,
  period_length int,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.cycles enable row level security;
drop policy if exists "cycles_owner_select" on public.cycles;
create policy "cycles_owner_select" on public.cycles for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "cycles_owner_write" on public.cycles;
create policy "cycles_owner_write" on public.cycles for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- daily_logs
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  log_date date not null,
  flow text check (flow in ('light','medium','heavy','spotting')),
  moods text[] default '{}',
  symptoms text[] default '{}',
  bbt numeric,
  weight numeric,
  cervical_mucus text check (cervical_mucus in ('dry','sticky','creamy','egg_white')),
  intimacy boolean default false,
  notes text,
  pill_taken boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clerk_user_id, log_date)
);
alter table public.daily_logs enable row level security;
drop policy if exists "daily_logs_owner_select" on public.daily_logs;
create policy "daily_logs_owner_select" on public.daily_logs for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "daily_logs_owner_write" on public.daily_logs;
create policy "daily_logs_owner_write" on public.daily_logs for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- ovulation_observations
create table if not exists public.ovulation_observations (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  observation_date date not null,
  observation_type text not null check (observation_type in ('bbt','cervical_mucus','opk','mittelschmerz','other')),
  value text,
  numeric_value numeric,
  notes text,
  created_at timestamptz not null default now(),
  unique (clerk_user_id, observation_date, observation_type)
);
alter table public.ovulation_observations enable row level security;
drop policy if exists "ovulation_obs_owner_select" on public.ovulation_observations;
create policy "ovulation_obs_owner_select" on public.ovulation_observations for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "ovulation_obs_owner_write" on public.ovulation_observations;
create policy "ovulation_obs_owner_write" on public.ovulation_observations for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- pregnancies
create table if not exists public.pregnancies (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  status text not null default 'active' check (status in ('active','completed','loss','terminated')),
  last_menstrual_period date,
  conception_date date,
  due_date date,
  current_week int default 1,
  actual_birth_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pregnancies enable row level security;
drop policy if exists "pregnancies_owner_select" on public.pregnancies;
create policy "pregnancies_owner_select" on public.pregnancies for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "pregnancies_owner_write" on public.pregnancies;
create policy "pregnancies_owner_write" on public.pregnancies for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- body_metrics
create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  recorded_date date not null,
  metric_type text not null check (metric_type in ('weight','bmi','body_fat','waist','hip','blood_pressure','heart_rate','other')),
  value numeric not null,
  unit text,
  notes text,
  created_at timestamptz not null default now(),
  unique (clerk_user_id, recorded_date, metric_type)
);
alter table public.body_metrics enable row level security;
drop policy if exists "body_metrics_owner_select" on public.body_metrics;
create policy "body_metrics_owner_select" on public.body_metrics for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "body_metrics_owner_write" on public.body_metrics;
create policy "body_metrics_owner_write" on public.body_metrics for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- sleep_logs
create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  log_date date not null,
  duration_hours numeric,
  quality text check (quality in ('poor','fair','good','excellent')),
  notes text,
  created_at timestamptz not null default now(),
  unique (clerk_user_id, log_date)
);
alter table public.sleep_logs enable row level security;
drop policy if exists "sleep_logs_owner_select" on public.sleep_logs;
create policy "sleep_logs_owner_select" on public.sleep_logs for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "sleep_logs_owner_write" on public.sleep_logs;
create policy "sleep_logs_owner_write" on public.sleep_logs for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- hydration_logs
create table if not exists public.hydration_logs (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  log_date date not null,
  amount_ml int not null default 0,
  goal_ml int not null default 2000,
  created_at timestamptz not null default now(),
  unique (clerk_user_id, log_date)
);
alter table public.hydration_logs enable row level security;
drop policy if exists "hydration_logs_owner_select" on public.hydration_logs;
create policy "hydration_logs_owner_select" on public.hydration_logs for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "hydration_logs_owner_write" on public.hydration_logs;
create policy "hydration_logs_owner_write" on public.hydration_logs for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- activity_logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  log_date date not null,
  activity_type text not null,
  duration_minutes int,
  intensity text check (intensity in ('low','moderate','high','extreme')),
  calories_burned int,
  created_at timestamptz not null default now()
);
alter table public.activity_logs enable row level security;
drop policy if exists "activity_logs_owner_select" on public.activity_logs;
create policy "activity_logs_owner_select" on public.activity_logs for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "activity_logs_owner_write" on public.activity_logs;
create policy "activity_logs_owner_write" on public.activity_logs for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- medications & medication_logs
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  name text not null,
  dosage text,
  frequency text,
  reminder_time text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.medications enable row level security;
drop policy if exists "medications_owner_select" on public.medications;
create policy "medications_owner_select" on public.medications for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "medications_owner_write" on public.medications;
create policy "medications_owner_write" on public.medications for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  medication_id uuid references public.medications(id) on delete cascade,
  taken_at timestamptz not null default now(),
  status text not null check (status in ('taken','skipped','missed')),
  created_at timestamptz not null default now()
);
alter table public.medication_logs enable row level security;
drop policy if exists "medication_logs_owner_select" on public.medication_logs;
create policy "medication_logs_owner_select" on public.medication_logs for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "medication_logs_owner_write" on public.medication_logs;
create policy "medication_logs_owner_write" on public.medication_logs for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- supplements
create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  name text not null,
  dosage text,
  taken_daily boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.supplements enable row level security;
drop policy if exists "supplements_owner_select" on public.supplements;
create policy "supplements_owner_select" on public.supplements for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "supplements_owner_write" on public.supplements;
create policy "supplements_owner_write" on public.supplements for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  doctor_name text not null,
  specialty text,
  clinic text,
  appointment_date timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.appointments enable row level security;
drop policy if exists "appointments_owner_select" on public.appointments;
create policy "appointments_owner_select" on public.appointments for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "appointments_owner_write" on public.appointments;
create policy "appointments_owner_write" on public.appointments for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- custom_tags
create table if not exists public.custom_tags (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  category text not null check (category in ('mood','symptom')),
  tag_name text not null,
  created_at timestamptz not null default now(),
  unique (clerk_user_id, category, tag_name)
);
alter table public.custom_tags enable row level security;
drop policy if exists "custom_tags_owner_select" on public.custom_tags;
create policy "custom_tags_owner_select" on public.custom_tags for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "custom_tags_owner_write" on public.custom_tags;
create policy "custom_tags_owner_write" on public.custom_tags for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));


-- -----------------------------------------------------------
-- 2. Notifications and Devices
-- -----------------------------------------------------------

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  period_reminders boolean not null default true,
  fertile_alerts boolean not null default true,
  pill_reminders boolean not null default false,
  daily_prompt boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.notification_preferences enable row level security;
drop policy if exists "notif_prefs_owner_select" on public.notification_preferences;
create policy "notif_prefs_owner_select" on public.notification_preferences for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "notif_prefs_owner_write" on public.notification_preferences;
create policy "notif_prefs_owner_write" on public.notification_preferences for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  token text not null,
  platform text not null check (platform in ('ios','android')),
  created_at timestamptz not null default now(),
  unique (clerk_user_id, token)
);
alter table public.device_tokens enable row level security;
drop policy if exists "device_tokens_owner_select" on public.device_tokens;
create policy "device_tokens_owner_select" on public.device_tokens for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "device_tokens_owner_write" on public.device_tokens;
create policy "device_tokens_owner_write" on public.device_tokens for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

create table if not exists public.reminder_queue (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  reminder_type text not null,
  scheduled_for timestamptz not null,
  payload jsonb default '{}',
  is_sent boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.reminder_queue enable row level security;
drop policy if exists "reminder_queue_owner_select" on public.reminder_queue;
create policy "reminder_queue_owner_select" on public.reminder_queue for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "reminder_queue_owner_write" on public.reminder_queue;
create policy "reminder_queue_owner_write" on public.reminder_queue for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));


-- -----------------------------------------------------------
-- 3. Payments and Subscriptions
-- -----------------------------------------------------------

create table if not exists public.payment_customers (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  paypal_payer_id text,
  email text,
  created_at timestamptz not null default now()
);
alter table public.payment_customers enable row level security;
drop policy if exists "payment_customers_owner_select" on public.payment_customers;
create policy "payment_customers_owner_select" on public.payment_customers for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "payment_customers_owner_write" on public.payment_customers;
create policy "payment_customers_owner_write" on public.payment_customers for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  plan_type text not null check (plan_type in ('monthly','lifetime')),
  status text not null check (status in ('trialing','active','canceled','expired')),
  paypal_subscription_id text,
  paypal_order_id text,
  trial_end timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  canceled_at timestamptz
);
alter table public.subscriptions enable row level security;
drop policy if exists "subscriptions_owner_select" on public.subscriptions;
create policy "subscriptions_owner_select" on public.subscriptions for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "subscriptions_owner_write" on public.subscriptions;
create policy "subscriptions_owner_write" on public.subscriptions for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  event_type text not null,
  paypal_event_id text,
  amount numeric,
  currency text default 'USD',
  raw_payload jsonb default '{}',
  created_at timestamptz not null default now()
);
alter table public.payment_events enable row level security;
drop policy if exists "payment_events_owner_select" on public.payment_events;
create policy "payment_events_owner_select" on public.payment_events for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "payment_events_owner_write" on public.payment_events;
create policy "payment_events_owner_write" on public.payment_events for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));


-- -----------------------------------------------------------
-- 4. Nearby Care and Sharing
-- -----------------------------------------------------------

create table if not exists public.saved_doctors (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  place_id text not null,
  name text not null,
  address text,
  rating numeric,
  phone text,
  created_at timestamptz not null default now(),
  unique (clerk_user_id, place_id)
);
alter table public.saved_doctors enable row level security;
drop policy if exists "saved_doctors_owner_select" on public.saved_doctors;
create policy "saved_doctors_owner_select" on public.saved_doctors for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "saved_doctors_owner_write" on public.saved_doctors;
create policy "saved_doctors_owner_write" on public.saved_doctors for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

create table if not exists public.partner_permissions (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  partner_code text,
  connected_partner_id text,
  share_phase boolean not null default true,
  share_symptoms boolean not null default true,
  share_moods boolean not null default true,
  share_notes boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.partner_permissions enable row level security;
drop policy if exists "partner_permissions_owner_select" on public.partner_permissions;
create policy "partner_permissions_owner_select" on public.partner_permissions for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "partner_permissions_owner_write" on public.partner_permissions;
create policy "partner_permissions_owner_write" on public.partner_permissions for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  consent_type text not null,
  granted boolean not null,
  timestamp timestamptz not null default now()
);
alter table public.consent_records enable row level security;
drop policy if exists "consent_records_owner_select" on public.consent_records;
create policy "consent_records_owner_select" on public.consent_records for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
drop policy if exists "consent_records_owner_write" on public.consent_records;
create policy "consent_records_owner_write" on public.consent_records for all using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')) with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- Non-cascading audit table for account deletion logging (never wiped by delete-account)
create table if not exists public.deletion_audit_logs (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  deleted_at timestamptz not null default now(),
  details jsonb default '{}'::jsonb
);
alter table public.deletion_audit_logs enable row level security;
drop policy if exists "deletion_audit_logs_owner_select" on public.deletion_audit_logs;
create policy "deletion_audit_logs_owner_select" on public.deletion_audit_logs for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

