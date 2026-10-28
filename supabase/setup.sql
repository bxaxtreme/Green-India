-- Green India community report setup for Supabase
-- Run in Supabase SQL Editor. This uses public, unauthenticated submissions,
-- so use moderation/rate limits before promoting the site widely.
create table if not exists public.issue_reports (
  id text primary key,
  title text not null check (char_length(title) between 3 and 90),
  category text not null,
  description text not null check (char_length(description) between 15 and 1200),
  address text not null,
  city text not null,
  state text not null,
  image_url text,
  image_name text,
  reporter_name text not null,
  status text not null default 'Received' check (status in ('Received','Under review','Resolved')),
  created_at timestamptz not null default now()
);

alter table public.issue_reports enable row level security;

drop policy if exists "Anyone can read public issue reports" on public.issue_reports;
create policy "Anyone can read public issue reports"
  on public.issue_reports for select to anon, authenticated using (true);

drop policy if exists "Anyone can submit issue reports" on public.issue_reports;
create policy "Anyone can submit issue reports"
  on public.issue_reports for insert to anon, authenticated with check (
    char_length(title) between 3 and 90
    and char_length(description) between 15 and 1200
    and char_length(reporter_name) between 1 and 50
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('issue-images', 'issue-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view issue photos" on storage.objects;
create policy "Public can view issue photos"
  on storage.objects for select to anon, authenticated using (bucket_id = 'issue-images');

drop policy if exists "Public can upload issue photos" on storage.objects;
create policy "Public can upload issue photos"
  on storage.objects for insert to anon, authenticated with check (bucket_id = 'issue-images');
