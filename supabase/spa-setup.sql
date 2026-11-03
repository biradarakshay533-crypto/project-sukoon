-- Sukoonam: massage types and spa photo storage.
-- Run this once in the Supabase SQL Editor, after schema.sql.


-- ==========================================================
-- 1. Massage types customers can filter by
-- ==========================================================

insert into public.massage_types (name) values
  ('Swedish Massage'),
  ('Deep Tissue Massage'),
  ('Aromatherapy Massage'),
  ('Thai Massage'),
  ('Balinese Massage'),
  ('Hot Stone Massage'),
  ('Foot Reflexology'),
  ('Head and Shoulder Massage'),
  ('Ayurvedic Massage (Abhyanga)'),
  ('Couples Massage'),
  ('Four Hand Massage')
on conflict (name) do nothing;


-- ==========================================================
-- 2. Storage space for spa photos
-- ==========================================================

-- Anyone can view the photos. Each file may be up to 5 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'spa-photos',
  'spa-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Photos are stored as <spa id>/<file name>, so the first folder
-- tells us which spa a photo belongs to.
create policy "Owners see their own spa photo files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'spa-photos'
    and public.owns_spa(((storage.foldername(name))[1])::uuid)
  );

create policy "Owners upload their own spa photo files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'spa-photos'
    and public.owns_spa(((storage.foldername(name))[1])::uuid)
  );

create policy "Owners delete their own spa photo files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'spa-photos'
    and public.owns_spa(((storage.foldername(name))[1])::uuid)
  );
