-- ============================================================
-- HerCadence: 004 — Payments & Subscriptions Tables
-- ============================================================

-- -----------------------------------------------------------
-- payment_customers  (maps Clerk user to PayPal customer)
-- -----------------------------------------------------------
create table if not exists payment_customers (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null unique,
  paypal_payer_id text,
  email           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table payment_customers enable row level security;
create policy "payment_customers_select" on payment_customers for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "payment_customers_insert" on payment_customers for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "payment_customers_update" on payment_customers for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "payment_customers_delete" on payment_customers for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- subscriptions
-- -----------------------------------------------------------
create table if not exists subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  clerk_user_id          text not null,
  plan_type              text not null check (plan_type in ('monthly','lifetime')),
  status                 text not null default 'pending'
    check (status in ('pending','active','canceled','expired','suspended','payment_failed')),
  paypal_subscription_id text,       -- set for monthly, null for lifetime
  paypal_order_id        text,       -- set for lifetime, null for monthly
  current_period_start   timestamptz,
  current_period_end     timestamptz, -- null for lifetime (never expires)
  created_at             timestamptz not null default now(),
  canceled_at            timestamptz,
  updated_at             timestamptz not null default now()
);

alter table subscriptions enable row level security;
create policy "subscriptions_select" on subscriptions for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "subscriptions_insert" on subscriptions for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "subscriptions_update" on subscriptions for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "subscriptions_delete" on subscriptions for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- payment_events  (immutable audit trail — never delete rows)
-- -----------------------------------------------------------
create table if not exists payment_events (
  id                uuid primary key default gen_random_uuid(),
  clerk_user_id     text not null,
  subscription_id   uuid references subscriptions(id),
  event_type        text not null,   -- e.g. 'BILLING.SUBSCRIPTION.ACTIVATED'
  paypal_event_id   text,
  amount            numeric,
  currency          text default 'USD',
  raw_payload       jsonb,
  created_at        timestamptz not null default now()
);

alter table payment_events enable row level security;
create policy "payment_events_select" on payment_events for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
-- Insert-only from server (webhook), but RLS still protects reads.
-- The webhook Edge Function uses the service-role key (bypasses RLS) to insert.
-- Users cannot insert, update, or delete payment events from the client.
create policy "payment_events_insert" on payment_events for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
-- No update or delete policies — events are immutable.
