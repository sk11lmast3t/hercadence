-- ============================================================
-- HerCadence: 002 — Medical & Wellness Tracking Tables
-- ============================================================

-- -----------------------------------------------------------
-- pregnancies
-- -----------------------------------------------------------
create table if not exists pregnancies (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  status          text not null default 'active'
    check (status in ('active','completed','loss','terminated')),
  conception_date date,
  due_date        date,
  actual_birth_date date,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table pregnancies enable row level security;
create policy "pregnancies_select" on pregnancies for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "pregnancies_insert" on pregnancies for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "pregnancies_update" on pregnancies for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "pregnancies_delete" on pregnancies for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- sleep_logs
-- -----------------------------------------------------------
create table if not exists sleep_logs (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  log_date        date not null,
  bedtime         timestamptz,
  wake_time       timestamptz,
  duration_hours  numeric,
  quality         text check (quality in ('poor','fair','good','excellent')),
  notes           text,
  created_at      timestamptz not null default now(),

  unique (clerk_user_id, log_date)
);

alter table sleep_logs enable row level security;
create policy "sleep_logs_select" on sleep_logs for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "sleep_logs_insert" on sleep_logs for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "sleep_logs_update" on sleep_logs for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "sleep_logs_delete" on sleep_logs for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- hydration_logs
-- -----------------------------------------------------------
create table if not exists hydration_logs (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  log_date        date not null,
  amount_ml       int not null default 0,
  goal_ml         int not null default 2000,
  entries         jsonb default '[]',   -- [{time, amount_ml, type}]
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (clerk_user_id, log_date)
);

alter table hydration_logs enable row level security;
create policy "hydration_logs_select" on hydration_logs for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "hydration_logs_insert" on hydration_logs for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "hydration_logs_update" on hydration_logs for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "hydration_logs_delete" on hydration_logs for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- activity_logs
-- -----------------------------------------------------------
create table if not exists activity_logs (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  log_date        date not null,
  activity_type   text not null,
  duration_minutes int,
  intensity       text check (intensity in ('low','moderate','high','extreme')),
  calories_burned int,
  steps           int,
  notes           text,
  created_at      timestamptz not null default now()
);

alter table activity_logs enable row level security;
create policy "activity_logs_select" on activity_logs for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "activity_logs_insert" on activity_logs for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "activity_logs_update" on activity_logs for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "activity_logs_delete" on activity_logs for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- medications
-- -----------------------------------------------------------
create table if not exists medications (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  name            text not null,
  dosage          text,
  frequency       text,
  time_of_day     text,
  start_date      date,
  end_date        date,
  is_active       boolean not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table medications enable row level security;
create policy "medications_select" on medications for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "medications_insert" on medications for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "medications_update" on medications for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "medications_delete" on medications for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- medication_logs
-- -----------------------------------------------------------
create table if not exists medication_logs (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  medication_id   uuid not null references medications(id) on delete cascade,
  taken_at        timestamptz not null default now(),
  skipped         boolean not null default false,
  notes           text,
  created_at      timestamptz not null default now()
);

alter table medication_logs enable row level security;
create policy "medication_logs_select" on medication_logs for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "medication_logs_insert" on medication_logs for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "medication_logs_update" on medication_logs for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "medication_logs_delete" on medication_logs for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- supplements
-- -----------------------------------------------------------
create table if not exists supplements (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  name            text not null,
  dosage          text,
  frequency       text,
  time_of_day     text,
  is_active       boolean not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table supplements enable row level security;
create policy "supplements_select" on supplements for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "supplements_insert" on supplements for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "supplements_update" on supplements for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "supplements_delete" on supplements for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- appointments
-- -----------------------------------------------------------
create table if not exists appointments (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  doctor_name     text not null default '',
  specialty       text,
  clinic          text,
  appointment_date date,
  appointment_time text,
  status          text not null default 'Pending'
    check (status in ('Pending','Confirmed','Completed','Cancelled')),
  notes           text,
  avatar_url      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table appointments enable row level security;
create policy "appointments_select" on appointments for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "appointments_insert" on appointments for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "appointments_update" on appointments for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "appointments_delete" on appointments for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
