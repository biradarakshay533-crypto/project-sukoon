-- Sukoonam: extra details for the home page.
-- Run this once in the Supabase SQL Editor, after spa-setup.sql.

-- The client ticks this in the dashboard to show a spa in "Featured spas".
-- Partners cannot change it, because they were only given access to
-- the other spa columns.
alter table public.spas
  add column is_featured boolean not null default false;

-- A photo web address for each massage type's round tile on the home page.
alter table public.massage_types
  add column image_url text;
