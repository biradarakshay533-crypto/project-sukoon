-- Push notifications: a spa owner's phone rings for a new booking request
-- even when Sukoonam is closed or the phone is locked.
--
-- Each phone that allows notifications gives us an "address" (endpoint plus
-- two keys). We keep it here, linked to the owner. Sending is done by the
-- website with a private key, so knowing an address alone cannot send anything.

create table public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  endpoint    text not null unique check (endpoint like 'https://%' and length(endpoint) <= 1000),
  p256dh      text not null check (length(p256dh) between 1 and 200),
  auth        text not null check (length(auth) between 1 and 100),
  created_at  timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Owners can see and remove their own phones. Adding goes through
-- save_push_subscription below, so nobody writes rows directly.
create policy "Users see their own phones"
  on public.push_subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users remove their own phones"
  on public.push_subscriptions for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.push_subscriptions from public, anon, authenticated;
grant select, delete on public.push_subscriptions to authenticated;

-- A spa owner's phone signs up for alerts. If that phone was used by someone
-- else before, it now belongs to the owner who is logged in.
create or replace function public.save_push_subscription(
  new_endpoint text,
  new_p256dh text,
  new_auth text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null or not exists (
    select 1 from public.profiles where id = me and role = 'partner'
  ) then
    raise exception 'Only spa partners can turn on booking alerts';
  end if;

  delete from public.push_subscriptions where endpoint = new_endpoint;
  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth)
    values (me, new_endpoint, new_p256dh, new_auth);
end;
$$;

-- Right after a customer sends a request, the website asks which phones to
-- ring. It only answers for the customer's own fresh, waiting request.
create or replace function public.booking_alert_targets(target_booking uuid)
returns table (endpoint text, p256dh text, auth text)
language sql
stable
security definer
set search_path = ''
as $$
  select ps.endpoint, ps.p256dh, ps.auth
  from public.bookings b
  join public.spas s on s.id = b.spa_id
  join public.push_subscriptions ps on ps.user_id = s.owner_id
  where b.id = target_booking
    and b.customer_id = (select auth.uid())
    and b.status = 'requested'
    and b.created_at > now() - interval '5 minutes';
$$;

-- When a phone has uninstalled the app or turned alerts off, the push service
-- says the address is gone, and the website removes it here.
create or replace function public.forget_push_subscription(old_endpoint text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.push_subscriptions where endpoint = old_endpoint;
$$;

revoke all on function public.save_push_subscription(text, text, text) from public, anon;
revoke all on function public.booking_alert_targets(uuid) from public, anon;
revoke all on function public.forget_push_subscription(text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text) to authenticated;
grant execute on function public.booking_alert_targets(uuid) to authenticated;
grant execute on function public.forget_push_subscription(text) to authenticated;
