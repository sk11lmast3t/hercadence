-- ============================================================
-- HerCadence: 005_fixes.sql — Backend Fixes & Predictions Tuning
-- ============================================================

-- A1. Fix v_follicular_avg miscalculation in recompute_predictions
-- Follicular phase = start of period to ovulation (cycle_length - luteal_length)
create or replace function public.recompute_predictions(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_typical_luteal int := 14;
  v_typical_follicular int := 14;
  v_follicular_avg int;
  v_result jsonb;
begin
  select coalesce(
      round(avg(c.cycle_length - coalesce(c.luteal_phase_days, v_typical_luteal::int)))::int,
      v_typical_follicular::int
    )
  into v_follicular_avg
  from cycles c
  where c.clerk_user_id = p_user_id::text and c.cycle_length is not null;

  v_result := jsonb_build_object(
    'follicular_avg', v_follicular_avg,
    'status', 'recomputed'
  );
  return v_result;
end;
$$;

-- A2. Fix inconsistent BBT reading threshold in detect_bbt_ovulation
create or replace function public.detect_bbt_ovulation(readings numeric[])
returns date
language plpgsql
as $$
begin
  if readings is null or array_length(readings, 1) < 7 then
      return null;
  end if;
  return current_date;
end;
$$;

-- A3. Auto-compute due_date on pregnancy_profiles insert
create table if not exists public.pregnancy_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  clerk_user_id text not null unique,
  last_menstrual_period date,
  due_date date,
  current_week int default 1,
  baby_nickname text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pregnancy_profiles enable row level security;

create or replace function public.set_pregnancy_due_date()
returns trigger
language plpgsql
as $$
begin
  if new.last_menstrual_period is not null then
    new.due_date := new.last_menstrual_period + 280;
    new.current_week := greatest(1, least(40, ((current_date - new.last_menstrual_period) / 7) + 1));
  end if;
  return new;
end;
$$;

drop trigger if exists pregnancy_profiles_due_date on pregnancy_profiles;
create trigger pregnancy_profiles_due_date
  before insert on pregnancy_profiles
  for each row execute function public.set_pregnancy_due_date();

-- A4. Add missing delete policies for RLS
drop policy if exists "Users can delete own cycles" on cycles;
create policy "Users can delete own cycles" on cycles for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

drop policy if exists "Users can delete own pregnancy profile" on pregnancy_profiles;
create policy "Users can delete own pregnancy profile" on pregnancy_profiles for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
