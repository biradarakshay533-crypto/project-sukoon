-- Booking requests: the customer asks for a time, the spa accepts or declines.
-- Run this once in the Supabase SQL Editor, after schema.sql.
-- Online payment comes later, so for now a new booking goes straight to
-- "requested". When payment is added it will wait for the payment first.


-- When the spa must answer by, and when it did.
alter table public.bookings add column respond_by timestamptz;
alter table public.bookings add column responded_at timestamptz;


-- Fills in a new booking from the database, so a customer can never
-- choose their own price, book a hidden spa or book when it is closed.
create or replace function public.prepare_booking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer   public.profiles%rowtype;
  rules      public.settings%rowtype;
  hours      jsonb;
  local_start timestamp;
  local_end   timestamp;
  open_count integer;
begin
  select * into customer from public.profiles where id = auth.uid();

  if not found or customer.role <> 'customer' then
    raise exception 'Only a customer account can make a booking';
  end if;

  if new.starts_at <= now() then
    raise exception 'The booking time must be in the future';
  end if;

  if new.starts_at > now() + interval '14 days' then
    raise exception 'You can book up to 14 days ahead';
  end if;

  if length(new.customer_note) > 500 then
    raise exception 'Please keep your note under 500 characters';
  end if;

  select count(*) into open_count
    from public.bookings
    where customer_id = customer.id and status = 'requested' and respond_by > now();

  if open_count >= 3 then
    raise exception 'You already have 3 requests waiting for an answer';
  end if;

  select sp.id, sp.name, sp.opening_hours, s.name, s.duration_minutes, s.price_paise
    into new.spa_id, new.spa_name, hours, new.service_name, new.duration_minutes, new.price_paise
    from public.services s
    join public.spas sp on sp.id = s.spa_id
    where s.id = new.service_id and s.is_active and sp.is_approved;

  if not found then
    raise exception 'This service is not available';
  end if;

  -- Opening hours are kept as Dharwad local time, for example 10:00 to 21:00.
  if coalesce(hours ->> 'open', '') <> '' and coalesce(hours ->> 'close', '') <> ''
     and (hours ->> 'close')::time > (hours ->> 'open')::time then
    local_start := new.starts_at at time zone 'Asia/Kolkata';
    local_end := local_start + make_interval(mins => new.duration_minutes);

    if local_start::time < (hours ->> 'open')::time
       or local_end::date <> local_start::date
       or local_end::time > (hours ->> 'close')::time then
      raise exception 'Please choose a time when the spa is open';
    end if;
  end if;

  select * into rules from public.settings where id = 1;

  new.status         := 'requested';
  new.respond_by     := least(now() + make_interval(mins => rules.spa_response_minutes), new.starts_at);
  new.responded_at   := null;
  new.customer_id    := customer.id;
  new.customer_name  := customer.full_name;
  new.customer_email := customer.email;
  new.customer_phone := customer.phone;
  return new;
end;
$$;


-- The spa accepts or declines. A late answer marks the booking expired.
create function public.respond_to_booking(target_booking uuid, accept boolean)
returns public.booking_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  booking public.bookings%rowtype;
  new_status public.booking_status;
begin
  select * into booking from public.bookings where id = target_booking for update;

  if not found or not public.owns_spa(booking.spa_id) then
    raise exception 'Booking not found';
  end if;

  if booking.status <> 'requested' then
    raise exception 'This booking has already been answered';
  end if;

  new_status := case
    when now() > booking.respond_by then 'expired'
    when accept then 'accepted'
    else 'declined'
  end;

  update public.bookings
    set status = new_status, responded_at = now()
    where id = target_booking;

  return new_status;
end;
$$;


-- The customer withdraws a request the spa has not answered yet.
-- Cancelling an accepted booking comes with refunds, in the payment step.
create function public.cancel_booking(target_booking uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  booking public.bookings%rowtype;
begin
  select * into booking from public.bookings where id = target_booking for update;

  if not found or booking.customer_id <> (select auth.uid()) then
    raise exception 'Booking not found';
  end if;

  if booking.status <> 'requested' or now() > booking.respond_by then
    raise exception 'Only a request still waiting for the spa can be cancelled';
  end if;

  update public.bookings set status = 'cancelled' where id = target_booking;
end;
$$;


revoke all on function public.respond_to_booking(uuid, boolean) from public, anon;
revoke all on function public.cancel_booking(uuid) from public, anon;
grant execute on function public.respond_to_booking(uuid, boolean) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;

create index bookings_status_respond_by_idx on public.bookings (status, respond_by);
