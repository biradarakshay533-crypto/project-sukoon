-- Spas must accept or decline within 30 minutes, so customers can book
-- for the same hour. The setting is now counted in minutes, not hours.
alter table public.settings rename column spa_response_hours to spa_response_minutes;
alter table public.settings alter column spa_response_minutes set default 30;

update public.settings
set spa_response_minutes = 30
where id = 1;

select * from public.settings;
