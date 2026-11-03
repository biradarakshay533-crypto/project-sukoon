-- Sukoonam: free stock photos from Pexels (pexels.com) for the massage tiles.
-- Run this once in the Supabase SQL Editor, after home-setup.sql.
-- The client can swap any photo later by editing image_url in the dashboard.

update public.massage_types as t
set image_url = 'https://images.pexels.com/photos/' || p.photo_id || '/pexels-photo-' || p.photo_id
  || '.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
from (values
  ('Swedish Massage', '6628701'),
  ('Deep Tissue Massage', '6188042'),
  ('Aromatherapy Massage', '6629612'),
  ('Thai Massage', '6186753'),
  ('Balinese Massage', '5266479'),
  ('Hot Stone Massage', '6629530'),
  ('Foot Reflexology', '6188032'),
  ('Head and Shoulder Massage', '6628689'),
  ('Ayurvedic Massage (Abhyanga)', '6187852'),
  ('Couples Massage', '7365434'),
  ('Four Hand Massage', '9146377')
) as p (name, photo_id)
where t.name = p.name;
