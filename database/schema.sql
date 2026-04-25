-- Enable required extension
create extension if not exists "pgcrypto";

create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain text not null,
  created_at timestamptz default now(),
  unique (user_id, domain)
);

create type campaign_type as enum ('lightbox', 'floating_bar', 'slide_in', 'fullscreen', 'inline');
create type campaign_status as enum ('draft', 'active', 'paused');

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  type campaign_type not null,
  status campaign_status not null default 'draft',
  headline text not null,
  subheadline text not null,
  button_text text not null default 'Subscribe',
  success_message text not null default 'Thanks!',
  display_rules jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  site_id uuid not null references sites(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  email text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create type campaign_event_type as enum ('impression', 'lead');

create table if not exists campaign_events (
  id bigint generated always as identity primary key,
  site_id uuid not null references sites(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  event_type campaign_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_campaign_events_campaign_day
on campaign_events (campaign_id, created_at);

create or replace view campaign_stats_daily as
select
  c.user_id,
  e.campaign_id,
  date_trunc('day', e.created_at)::date as day,
  count(*) filter (where e.event_type = 'impression') as impressions,
  count(*) filter (where e.event_type = 'lead') as leads,
  case when count(*) filter (where e.event_type = 'impression') = 0 then 0
  else round(
    (count(*) filter (where e.event_type = 'lead')::numeric / count(*) filter (where e.event_type = 'impression')) * 100,
    2
  ) end as conversion_rate
from campaign_events e
join campaigns c on c.id = e.campaign_id
group by c.user_id, e.campaign_id, date_trunc('day', e.created_at)::date;

alter table sites enable row level security;
alter table campaigns enable row level security;
alter table leads enable row level security;

create policy "sites owner" on sites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "campaigns owner" on campaigns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "leads owner" on leads for select using (auth.uid() = user_id);
