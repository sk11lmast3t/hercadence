-- ============================================================
-- HerCadence: 005 — Community & Content Tables
-- ============================================================
-- Schema created now; wiring deferred to Phase 3.
-- ============================================================

-- -----------------------------------------------------------
-- content_categories
-- -----------------------------------------------------------
create table if not exists content_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  sort_order  int default 0,
  created_at  timestamptz not null default now()
);
-- No RLS — public read.

-- -----------------------------------------------------------
-- content_articles
-- -----------------------------------------------------------
create table if not exists content_articles (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references content_categories(id),
  title         text not null,
  subtitle      text,
  author        text,
  read_time     text,
  hero_image    text,
  body          text,
  is_premium    boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now()
);
-- No RLS — public read. Premium gating is at the application layer.

-- -----------------------------------------------------------
-- content_videos
-- -----------------------------------------------------------
create table if not exists content_videos (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references content_categories(id),
  title         text not null,
  instructor    text,
  duration      text,
  thumbnail_url text,
  video_url     text,
  description   text,
  is_premium    boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------
-- community_groups
-- -----------------------------------------------------------
create table if not exists community_groups (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  is_private    boolean not null default false,
  created_by    text not null,  -- clerk_user_id
  member_count  int not null default 1,
  created_at    timestamptz not null default now()
);

alter table community_groups enable row level security;
-- Anyone can read public groups
create policy "community_groups_select_public" on community_groups for select
  using (is_private = false);
create policy "community_groups_insert" on community_groups for insert
  with check (created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "community_groups_update" on community_groups for update
  using (created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "community_groups_delete" on community_groups for delete
  using (created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- group_memberships
-- -----------------------------------------------------------
create table if not exists group_memberships (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  group_id        uuid not null references community_groups(id) on delete cascade,
  role            text not null default 'member' check (role in ('member','moderator','admin')),
  joined_at       timestamptz not null default now(),

  unique (clerk_user_id, group_id)
);

alter table group_memberships enable row level security;
create policy "group_memberships_select" on group_memberships for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "group_memberships_insert" on group_memberships for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "group_memberships_delete" on group_memberships for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- community_posts
-- -----------------------------------------------------------
create table if not exists community_posts (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  group_id        uuid references community_groups(id),
  title           text not null default '',
  body            text not null default '',
  tags            text[] default '{}',
  likes_count     int not null default 0,
  comments_count  int not null default 0,
  is_pinned       boolean not null default false,
  is_hidden       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table community_posts enable row level security;
-- Anyone authenticated can read non-hidden posts
create policy "community_posts_select" on community_posts for select
  using (is_hidden = false);
create policy "community_posts_insert" on community_posts for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "community_posts_update" on community_posts for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "community_posts_delete" on community_posts for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- community_comments
-- -----------------------------------------------------------
create table if not exists community_comments (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  post_id         uuid not null references community_posts(id) on delete cascade,
  parent_id       uuid references community_comments(id) on delete cascade,
  body            text not null default '',
  is_hidden       boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table community_comments enable row level security;
create policy "community_comments_select" on community_comments for select
  using (is_hidden = false);
create policy "community_comments_insert" on community_comments for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "community_comments_update" on community_comments for update
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "community_comments_delete" on community_comments for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- community_reactions
-- -----------------------------------------------------------
create table if not exists community_reactions (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  post_id         uuid references community_posts(id) on delete cascade,
  comment_id      uuid references community_comments(id) on delete cascade,
  reaction_type   text not null default 'like' check (reaction_type in ('like','love','support','insightful')),
  created_at      timestamptz not null default now(),

  -- one reaction per user per target
  unique (clerk_user_id, post_id, comment_id, reaction_type)
);

alter table community_reactions enable row level security;
create policy "community_reactions_select" on community_reactions for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "community_reactions_insert" on community_reactions for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "community_reactions_delete" on community_reactions for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- community_reports
-- -----------------------------------------------------------
create table if not exists community_reports (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  post_id         uuid references community_posts(id),
  comment_id      uuid references community_comments(id),
  reason          text not null,
  details         text,
  status          text not null default 'pending' check (status in ('pending','reviewed','dismissed','actioned')),
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz
);

alter table community_reports enable row level security;
create policy "community_reports_insert" on community_reports for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "community_reports_select" on community_reports for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- -----------------------------------------------------------
-- saved_content  (bookmarks for articles/videos)
-- -----------------------------------------------------------
create table if not exists saved_content (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null,
  content_type    text not null check (content_type in ('article','video','post')),
  content_id      uuid not null,
  created_at      timestamptz not null default now(),

  unique (clerk_user_id, content_type, content_id)
);

alter table saved_content enable row level security;
create policy "saved_content_select" on saved_content for select
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "saved_content_insert" on saved_content for insert
  with check (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
create policy "saved_content_delete" on saved_content for delete
  using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
