-- ============================================================
-- HerCadence: 001 — Core Health Tables
-- ============================================================
-- Every table has clerk_user_id + RLS owner-only policies.
-- ============================================================

-- -----------------------------------------------------------
-- profiles
-- -----------------------------------------------------------
create table if not exists profiles (
  id             uuid primary key default gen_random_uuid(),
  clerk_user_id  text not null unique,
  user_name      text not null default '',
  email          text not null default '',
  avatar_url     text,
  onboarding_completed boolean not null default false,

  -- cycle baseline
  cycle_length_days    int not null default 28,
  period_length_days   int not null default 5,
  luteal_phase_days    int not null default 14,
  last_period_start    date,
  temperature_unit     text not null default 'Celsius'
    check (temperature_unit in ('Celsius','Fahrenheit')),
  weight_unit          text not null default 'kg'
    check (weight_unit in ('kg','lb')),
  start_day_of_week    text not null default 'Sunday'
    check (start_day_of_week in ('Sunday','Monday')),
  show_week_numbers    boolean not null default true,
  language             text not null default 'English (US)',
  region               text not null default 'United States',
  selected_goal        text not null default 'PERIOD'
    check (selected_goal in ('PERIOD','OVULATION','PREGNANCY','WELLNESS')),

  -- baseline health snapshot
  weight               numeric,
  height_cm            numeric,
  height_feet          int,
  height_inches        int,
  height_unit          text default 'cm' check (height_unit in ('cm','ft_in')),
  age                  int,
  birth_date           date,
  cycle_regularity     text default 'Regular'
    check (cycle_regularity in ('Regular','Somewhat Regular','Irregular','Not Sure')),
  primary_goals        text[] default '{}',
  typical_symptoms     text[] default '{}',
  sleep_hours_baseline numeric,
  activity_level       text default 'Moderately Active'
    check (activity_level in ('Sedentary','Lightly Active','Moderately Active','Very Active')),
  birth_control_method text,

  -- birth control details
  bc_type              text,
  bc_brand_name        text,
  bc_pack_total_pills  int default 28,
  bc_current_pill_idx  int default 0,
  bc_reminder_time     text default '09:00',
  bc_streak_days       int default 0,

  -- partner sync settings
  partner_code             text,
  connected_partner_name   text,
  share_phase              boolean default true,
  share_symptoms           boolean default true,
  share_moods              boolean default true,
  share_notes              boolean default false,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select" on profiles for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "profiles_insert" on profiles for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "profiles_update" on profiles for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "profiles_delete" on profiles for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- cycles  (one row per completed or in-progress cycle)
-- -----------------------------------------------------------
create table if not exists cycles (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  cycle_number    int,
  start_date      date not null,
  end_date        date,                -- null = current / in-progress
  cycle_length    int,                 -- computed on close
  period_length   int,
  notes           text,
  created_at      timestamptz not null default now()
);

alter table cycles enable row level security;

create policy "cycles_select" on cycles for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "cycles_insert" on cycles for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "cycles_update" on cycles for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "cycles_delete" on cycles for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- daily_logs
-- -----------------------------------------------------------
create table if not exists daily_logs (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  log_date        date not null,
  flow            text check (flow in ('light','medium','heavy','spotting')),
  moods           text[] default '{}',
  symptoms        text[] default '{}',
  bbt             numeric,
  weight          numeric,
  cervical_mucus  text check (cervical_mucus in ('dry','sticky','creamy','egg_white')),
  intimacy        boolean default false,
  notes           text,
  pill_taken      boolean,
  focus           text,
  focus_level     int,
  physical_comfort     text,
  comfort_level        int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (clerk_user_id, log_date)
);

alter table daily_logs enable row level security;

create policy "daily_logs_select" on daily_logs for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "daily_logs_insert" on daily_logs for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "daily_logs_update" on daily_logs for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "daily_logs_delete" on daily_logs for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- ovulation_observations
-- -----------------------------------------------------------
create table if not exists ovulation_observations (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  observation_date date not null,
  observation_type text not null check (observation_type in ('bbt','cervical_mucus','opk','mittelschmerz','other')),
  value           text,
  numeric_value   numeric,
  notes           text,
  created_at      timestamptz not null default now(),

  unique (clerk_user_id, observation_date, observation_type)
);

alter table ovulation_observations enable row level security;

create policy "ovulation_obs_select" on ovulation_observations for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "ovulation_obs_insert" on ovulation_observations for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "ovulation_obs_update" on ovulation_observations for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "ovulation_obs_delete" on ovulation_observations for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- body_metrics
-- -----------------------------------------------------------
create table if not exists body_metrics (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  recorded_date   date not null,
  metric_type     text not null check (metric_type in ('weight','bmi','body_fat','waist','hip','blood_pressure','heart_rate','other')),
  value           numeric not null,
  unit            text,
  notes           text,
  created_at      timestamptz not null default now(),

  unique (clerk_user_id, recorded_date, metric_type)
);

alter table body_metrics enable row level security;

create policy "body_metrics_select" on body_metrics for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "body_metrics_insert" on body_metrics for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "body_metrics_update" on body_metrics for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "body_metrics_delete" on body_metrics for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- custom_tags
-- -----------------------------------------------------------
create table if not exists custom_tags (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  category        text not null check (category in ('mood','symptom')),
  tag_name        text not null,
  sort_order      int default 0,
  created_at      timestamptz not null default now(),

  unique (clerk_user_id, category, tag_name)
);

alter table custom_tags enable row level security;

create policy "custom_tags_select" on custom_tags for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "custom_tags_insert" on custom_tags for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "custom_tags_update" on custom_tags for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "custom_tags_delete" on custom_tags for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
