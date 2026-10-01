-- ============================================================
-- HerCadence: 006 — Nearby Care & Partner Sharing Tables
-- ============================================================

-- -----------------------------------------------------------
-- saved_doctors
-- -----------------------------------------------------------
create table if not exists saved_doctors (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  place_id        text,           -- Google Places ID
  doctor_name     text not null,
  specialty       text,
  clinic_name     text,
  address         text,
  phone           text,
  rating          numeric,
  latitude        numeric,
  longitude       numeric,
  notes           text,
  created_at      timestamptz not null default now(),

  unique (clerk_user_id, place_id)
);

alter table saved_doctors enable row level security;
create policy "saved_doctors_select" on saved_doctors for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "saved_doctors_insert" on saved_doctors for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "saved_doctors_update" on saved_doctors for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "saved_doctors_delete" on saved_doctors for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- partner_connections
-- -----------------------------------------------------------
create table if not exists partner_connections (
  id                uuid primary key default gen_random_uuid(),
  clerk_user_id     text not null,        -- the user who owns this connection
  partner_user_id   text,                  -- the connected partner's clerk_user_id (null until accepted)
  invite_code       text not null unique,
  partner_name      text,
  status            text not null default 'pending'
    check (status in ('pending','active','revoked')),
  created_at        timestamptz not null default now(),
  accepted_at       timestamptz,
  revoked_at        timestamptz
);

alter table partner_connections enable row level security;
create policy "partner_connections_select" on partner_connections for select
  using (
    clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    or partner_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
  );
create policy "partner_connections_insert" on partner_connections for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "partner_connections_update" on partner_connections for update
  using (
    clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    or partner_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
  );
create policy "partner_connections_delete" on partner_connections for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- partner_permissions  (granular data sharing controls)
-- -----------------------------------------------------------
create table if not exists partner_permissions (
  id                uuid primary key default gen_random_uuid(),
  connection_id     uuid not null references partner_connections(id) on delete cascade,
  clerk_user_id     text not null,
  permission_type   text not null check (permission_type in (
    'phase','symptoms','moods','notes','fertility','medications'
  )),
  is_granted        boolean not null default false,
  updated_at        timestamptz not null default now(),

  unique (connection_id, clerk_user_id, permission_type)
);

alter table partner_permissions enable row level security;
create policy "partner_permissions_select" on partner_permissions for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "partner_permissions_insert" on partner_permissions for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "partner_permissions_update" on partner_permissions for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "partner_permissions_delete" on partner_permissions for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- consent_records  (audit trail for all permission changes)
-- -----------------------------------------------------------
create table if not exists consent_records (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  action          text not null,          -- e.g. 'grant_partner_view_phase', 'revoke_partner_view_moods'
  target_user_id  text,                   -- the partner affected
  details         jsonb default '{}',
  ip_address      text,
  user_agent      text,
  created_at      timestamptz not null default now()
);

alter table consent_records enable row level security;
create policy "consent_records_select" on consent_records for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "consent_records_insert" on consent_records for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
-- No update or delete — consent records are immutable audit trail.
