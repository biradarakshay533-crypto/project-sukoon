-- Sukoonam database: tables, automatic steps and security rules.
-- Run this once in the Supabase SQL Editor on an empty project.
-- Money is stored in paise (Rs 1 = 100 paise) so amounts are always exact.


-- ==========================================================
-- 1. Fixed lists of allowed values
-- ==========================================================

create type public.user_role as enum ('customer', 'partner');

create type public.booking_status as enum (
  'awaiting_payment', -- customer has not approved the payment yet
  'requested',        -- payment is held, waiting for the spa
  'accepted',         -- spa accepted, payment collected
  'declined',         -- spa declined, held payment released
  'expired',          -- spa did not respond in time
  'cancelled'         -- customer cancelled
);

create type public.payment_status as enum (
  'created',    -- payment started but not approved yet
  'held',       -- approved by the customer, held by Razorpay
  'captured',   -- collected after the spa accepted
  'released',   -- hold returned to the customer
  'refunded'    -- collected, then fully or partly refunded
);


-- ==========================================================
-- 2. Tables
-- ==========================================================

-- One row for every signed-up user.
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       public.user_role not null,
  email      text,
  full_name  text,
  phone      text,
  created_at timestamptz not null default now()
);

-- One row for every spa. Stays hidden until the client sets is_approved.
create table public.spas (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references public.profiles (id),
  name          text not null,
  description   text,
  address       text not null,
  city          text not null default 'Dharwad',
  latitude      double precision check (latitude between -90 and 90),
  longitude     double precision check (longitude between -180 and 180),
  opening_hours jsonb,
  phone         text,
  is_approved   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- One row for every spa photo. The picture itself is kept in Supabase Storage.
create table public.spa_photos (
  id           uuid primary key default gen_random_uuid(),
  spa_id       uuid not null references public.spas (id) on delete cascade,
  storage_path text not null,
  position     integer not null default 0,
  created_at   timestamptz not null default now()
);

-- The list customers filter by. The client manages it in the dashboard.
create table public.massage_types (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- What each spa offers.
create table public.services (
  id               uuid primary key default gen_random_uuid(),
  spa_id           uuid not null references public.spas (id) on delete cascade,
  massage_type_id  uuid references public.massage_types (id),
  name             text not null,
  description      text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_paise      integer not null check (price_paise > 0),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- One row for every booking. Names and prices are copied in, so the history
-- stays correct even if a spa changes its prices or a profile changes later.
create table public.bookings (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.profiles (id),
  spa_id           uuid not null references public.spas (id),
  service_id       uuid references public.services (id) on delete set null,
  starts_at        timestamptz not null,
  status           public.booking_status not null default 'awaiting_payment',
  spa_name         text not null,
  service_name     text not null,
  duration_minutes integer not null,
  price_paise      integer not null,
  customer_name    text,
  customer_email   text,
  customer_phone   text,
  customer_note    text,
  created_at       timestamptz not null default now()
);

-- One row for every booking's payment. Written only by our server code.
create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid not null unique references public.bookings (id),
  razorpay_order_id   text unique,
  razorpay_payment_id text unique,
  amount_paise        integer not null check (amount_paise > 0),
  status              public.payment_status not null default 'created',
  refund_paise        integer not null default 0 check (refund_paise >= 0),
  gateway_fee_paise   integer not null default 0 check (gateway_fee_paise >= 0),
  spa_share_paise     integer not null default 0 check (spa_share_paise >= 0),
  settled_at          timestamptz,
  created_at          timestamptz not null default now()
);

-- Rules the client can change in the dashboard. Only ever has one row.
create table public.settings (
  id                   integer primary key default 1 check (id = 1),
  refund_cutoff_hours  integer not null default 6 check (refund_cutoff_hours >= 0),
  refund_percent       integer not null default 100 check (refund_percent between 0 and 100),
  spa_response_minutes integer not null default 30 check (spa_response_minutes > 0)
);

insert into public.settings (id) values (1);

create index spas_owner_id_idx on public.spas (owner_id);
create index spa_photos_spa_id_idx on public.spa_photos (spa_id);
create index services_spa_id_idx on public.services (spa_id);
create index services_massage_type_id_idx on public.services (massage_type_id);
create index bookings_customer_id_idx on public.bookings (customer_id);
create index bookings_spa_id_starts_at_idx on public.bookings (spa_id, starts_at);


-- ==========================================================
-- 3. Automatic steps
-- ==========================================================

-- Creates the profile as soon as someone signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, email, full_name, phone)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'role' = 'partner'
      then 'partner'::public.user_role
      else 'customer'::public.user_role
    end,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fills in a new booking from the database, so a customer can never
-- choose their own price or book a hidden spa.
create function public.prepare_booking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer public.profiles%rowtype;
begin
  select * into customer from public.profiles where id = auth.uid();

  if not found or customer.role <> 'customer' then
    raise exception 'Only a customer account can make a booking';
  end if;

  if new.starts_at <= now() then
    raise exception 'The booking time must be in the future';
  end if;

  select sp.id, sp.name, s.name, s.duration_minutes, s.price_paise
    into new.spa_id, new.spa_name, new.service_name, new.duration_minutes, new.price_paise
    from public.services s
    join public.spas sp on sp.id = s.spa_id
    where s.id = new.service_id and s.is_active and sp.is_approved;

  if not found then
    raise exception 'This service is not available';
  end if;

  new.customer_id    := customer.id;
  new.customer_name  := customer.full_name;
  new.customer_email := customer.email;
  new.customer_phone := customer.phone;
  return new;
end;
$$;

create trigger before_booking_insert
  before insert on public.bookings
  for each row execute function public.prepare_booking();

-- Answers "does the signed-in user own this spa?" for the security rules.
create function public.owns_spa(target_spa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.spas
    where id = target_spa_id and owner_id = (select auth.uid())
  );
$$;


-- ==========================================================
-- 4. Who may touch which columns
-- ==========================================================

-- Start from nothing, then open only what is needed. Columns left out
-- here, such as role and is_approved, can never be changed by users.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant execute on function public.owns_spa(uuid) to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

grant select on public.spas to anon, authenticated;
grant insert (name, description, address, city, latitude, longitude, opening_hours, phone)
  on public.spas to authenticated;
grant update (name, description, address, city, latitude, longitude, opening_hours, phone)
  on public.spas to authenticated;

grant select on public.spa_photos to anon, authenticated;
grant insert (spa_id, storage_path, position), update (storage_path, position), delete
  on public.spa_photos to authenticated;

grant select on public.massage_types to anon, authenticated;

grant select on public.services to anon, authenticated;
grant insert (spa_id, massage_type_id, name, description, duration_minutes, price_paise, is_active),
  update (massage_type_id, name, description, duration_minutes, price_paise, is_active),
  delete
  on public.services to authenticated;

-- Accepting, declining and cancelling move money, so they run only in
-- our server code. Users cannot update bookings or payments directly.
grant select on public.bookings to authenticated;
grant insert (service_id, starts_at, customer_note) on public.bookings to authenticated;

grant select on public.payments to authenticated;

grant select on public.settings to anon, authenticated;


-- ==========================================================
-- 5. Which rows each person may see (row-level security)
-- ==========================================================

alter table public.profiles enable row level security;
alter table public.spas enable row level security;
alter table public.spa_photos enable row level security;
alter table public.massage_types enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.settings enable row level security;

-- Profiles: only your own. Spas get customer details from the booking.
create policy "Users see their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Spas: everyone sees approved spas, owners also see their own.
create policy "Anyone sees approved spas"
  on public.spas for select to anon, authenticated
  using (is_approved);

create policy "Owners see their own spas"
  on public.spas for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Partners add their own spas"
  on public.spas for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'partner'
    )
  );

create policy "Owners update their own spas"
  on public.spas for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Photos: follow the spa they belong to.
create policy "Anyone sees photos of approved spas"
  on public.spa_photos for select to anon, authenticated
  using (exists (
    select 1 from public.spas where id = spa_id and is_approved
  ));

create policy "Owners see their own photos"
  on public.spa_photos for select to authenticated
  using (public.owns_spa(spa_id));

create policy "Owners add their own photos"
  on public.spa_photos for insert to authenticated
  with check (public.owns_spa(spa_id));

create policy "Owners update their own photos"
  on public.spa_photos for update to authenticated
  using (public.owns_spa(spa_id))
  with check (public.owns_spa(spa_id));

create policy "Owners delete their own photos"
  on public.spa_photos for delete to authenticated
  using (public.owns_spa(spa_id));

-- Massage types and settings: readable by everyone.
create policy "Anyone sees massage types"
  on public.massage_types for select to anon, authenticated
  using (true);

create policy "Anyone sees settings"
  on public.settings for select to anon, authenticated
  using (true);

-- Services: everyone sees active services of approved spas.
create policy "Anyone sees active services of approved spas"
  on public.services for select to anon, authenticated
  using (is_active and exists (
    select 1 from public.spas where id = spa_id and is_approved
  ));

create policy "Owners see their own services"
  on public.services for select to authenticated
  using (public.owns_spa(spa_id));

create policy "Owners add their own services"
  on public.services for insert to authenticated
  with check (public.owns_spa(spa_id));

create policy "Owners update their own services"
  on public.services for update to authenticated
  using (public.owns_spa(spa_id))
  with check (public.owns_spa(spa_id));

create policy "Owners delete their own services"
  on public.services for delete to authenticated
  using (public.owns_spa(spa_id));

-- Bookings: customers see their own history, owners see their spa's
-- bookings once the payment is held.
create policy "Customers see their own bookings"
  on public.bookings for select to authenticated
  using (customer_id = (select auth.uid()));

create policy "Owners see bookings for their spas"
  on public.bookings for select to authenticated
  using (status <> 'awaiting_payment' and public.owns_spa(spa_id));

create policy "Customers create their own bookings"
  on public.bookings for insert to authenticated
  with check (customer_id = (select auth.uid()));

-- Payments: each side sees the payments for its own bookings.
create policy "Customers see their own payments"
  on public.payments for select to authenticated
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and b.customer_id = (select auth.uid())
  ));

create policy "Owners see payments for their spas"
  on public.payments for select to authenticated
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and public.owns_spa(b.spa_id)
  ));
