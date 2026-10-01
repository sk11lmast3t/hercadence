-- ============================================================
-- HerCadence: 003 — Notifications & Device Tables
-- ============================================================

-- -----------------------------------------------------------
-- notification_preferences
-- -----------------------------------------------------------
create table if not exists notification_preferences (
  id                    uuid primary key default gen_random_uuid(),
  clerk_user_id         text not null unique,
  period_reminders      boolean not null default true,
  fertile_window_alerts boolean not null default true,
  pill_reminders        boolean not null default false,
  daily_log_prompt      boolean not null default true,
  period_reminder_days_before int not null default 2,
  pill_reminder_time    text default '08:00',
  timezone              text default 'UTC',
  push_enabled          boolean not null default false,
  email_enabled         boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table notification_preferences enable row level security;
create policy "notif_prefs_select" on notification_preferences for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "notif_prefs_insert" on notification_preferences for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "notif_prefs_update" on notification_preferences for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "notif_prefs_delete" on notification_preferences for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- device_tokens  (for push notifications)
-- -----------------------------------------------------------
create table if not exists device_tokens (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  token           text not null,
  platform        text not null check (platform in ('ios','android')),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (clerk_user_id, token)
);

alter table device_tokens enable row level security;
create policy "device_tokens_select" on device_tokens for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "device_tokens_insert" on device_tokens for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "device_tokens_update" on device_tokens for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "device_tokens_delete" on device_tokens for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- reminder_queue  (pg_cron picks up due rows)
-- -----------------------------------------------------------
create table if not exists reminder_queue (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  reminder_type   text not null check (reminder_type in (
    'period_upcoming','fertile_window','pill','daily_log','appointment','custom'
  )),
  scheduled_at    timestamptz not null,
  sent_at         timestamptz,
  status          text not null default 'pending'
    check (status in ('pending','sent','failed','cancelled')),
  title           text not null default '',
  body            text not null default '',
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now()
);

alter table reminder_queue enable row level security;
create policy "reminder_queue_select" on reminder_queue for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "reminder_queue_insert" on reminder_queue for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "reminder_queue_update" on reminder_queue for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "reminder_queue_delete" on reminder_queue for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- Index for efficient polling by the cron job
create index if not exists idx_reminder_queue_pending
  on reminder_queue (scheduled_at)
  where status = 'pending';

-- -----------------------------------------------------------
-- notification_logs  (audit trail of all sent notifications)
-- -----------------------------------------------------------
create table if not exists notification_logs (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  reminder_id     uuid references reminder_queue(id),
  channel         text not null check (channel in ('push','email','in_app')),
  title           text,
  body            text,
  status          text not null check (status in ('delivered','failed','dismissed','read')),
  sent_at         timestamptz not null default now(),
  read_at         timestamptz,
  metadata        jsonb default '{}'
);

alter table notification_logs enable row level security;
create policy "notification_logs_select" on notification_logs for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "notification_logs_insert" on notification_logs for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "notification_logs_update" on notification_logs for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "notification_logs_delete" on notification_logs for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
