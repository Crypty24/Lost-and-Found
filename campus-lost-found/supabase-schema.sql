-- Supabase schema for Campus Lost & Found
-- Run this in Supabase SQL editor (SQL page)

-- Enable pgcrypto for UUID generation if not already enabled
-- extension is usually pre-enabled on Supabase
-- create extension if not exists pgcrypto;

-- Profiles table mapped to auth.users
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- policies for profiles
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "Profiles can be inserted by owner" on public.profiles;
create policy "Profiles can be inserted by owner" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "Profiles can be updated by owner" on public.profiles;
create policy "Profiles can be updated by owner" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Items table
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  status text not null check (status in ('Lost','Found')),
  location text not null,
  contact_email text,
  contact_phone text,
  user_name text,
  photos text[] default '{}', -- store public URLs of photos
  date_posted date default now(),
  created_at timestamp with time zone default now()
);

alter table public.items enable row level security;

-- policies for items
drop policy if exists "Items are viewable by everyone" on public.items;
create policy "Items are viewable by everyone" on public.items
  for select using (true);

drop policy if exists "Items can be inserted by authenticated users" on public.items;
create policy "Items can be inserted by authenticated users" on public.items
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

drop policy if exists "Items can be updated by owner" on public.items;
create policy "Items can be updated by owner" on public.items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Items can be deleted by owner" on public.items;
create policy "Items can be deleted by owner" on public.items
  for delete using (auth.uid() = user_id);

-- Public storage bucket for item photos
-- Create a public bucket named 'item-photos' (idempotent)
do $$
begin
  -- Create the bucket only if it doesn't exist
  if not exists (select 1 from storage.buckets where id = 'item-photos') then
    insert into storage.buckets (id, name, public)
    values ('item-photos', 'item-photos', true);
  end if;
end $$;

-- Storage policy: allow read for all, write by authenticated users
drop policy if exists "Public read access" on storage.objects;
create policy "Public read access" on storage.objects
  for select using (bucket_id = 'item-photos');

drop policy if exists "Authenticated users can upload to item-photos" on storage.objects;
create policy "Authenticated users can upload to item-photos" on storage.objects
  for insert with check (bucket_id = 'item-photos' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update own uploads" on storage.objects;
create policy "Authenticated users can update own uploads" on storage.objects
  for update using (
    bucket_id = 'item-photos' and auth.role() = 'authenticated' and (owner = auth.uid())
  );

-- Note: 'owner' column is set automatically by Supabase for storage objects.