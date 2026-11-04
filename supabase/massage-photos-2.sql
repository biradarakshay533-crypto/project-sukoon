-- Sukoonam: warmer, more premium Pexels photos for the round massage tiles.
-- Run this in the Supabase SQL Editor. It replaces the photos set by massage-photos.sql.
-- The client can swap any photo later by editing image_url in the dashboard.

update public.massage_types as t
set image_url = 'https://images.pexels.com/photos/' || p.photo_id || '/pexels-photo-' || p.photo_id
  || '.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
from (values
  ('Swedish Massage', '6560298'),
  ('Deep Tissue Massage', '6560288'),
  ('Aromatherapy Massage', '3768926'),
  ('Thai Massage', '6629608'),
  ('Balinese Massage', '37719545'),
  ('Hot Stone Massage', '19641830'),
  ('Foot Reflexology', '6188032'),
  ('Head and Shoulder Massage', '3757657'),
  ('Ayurvedic Massage (Abhyanga)', '38407790'),
  ('Couples Massage', '7365442'),
  ('Four Hand Massage', '9146377')
) as p (name, photo_id)
where t.name = p.name;

select name, image_url is not null as has_photo from public.massage_types order by name;
