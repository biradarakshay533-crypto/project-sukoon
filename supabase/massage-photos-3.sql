-- Sukoonam: a clearer photo for the Four Hand Massage tile (two therapists,
-- four hands on one back). Run this in the Supabase SQL Editor.
-- The client can swap any photo later by editing image_url in the dashboard.

update public.massage_types
set image_url = 'https://images.pexels.com/photos/5888078/pexels-photo-5888078.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
where name = 'Four Hand Massage';

select name, image_url from public.massage_types where name = 'Four Hand Massage';
