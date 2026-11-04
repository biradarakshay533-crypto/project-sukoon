-- Spa KYC: the legal details and documents a spa sends before it is approved.
-- Run this once in the Supabase SQL Editor, after schema.sql and bookings-setup.sql.
--
-- How it works:
--   1. The spa owner fills in the form and uploads documents (status "draft").
--   2. They submit it (status "submitted"). After that they cannot change it.
--   3. The client checks it in the Supabase dashboard and sets status to
--      "approved" (the spa goes live) or "rejected" with a review_note
--      (the owner can fix it and submit again).


-- ==========================================================
-- 1. Allowed values
-- ==========================================================

create type public.kyc_status as enum ('draft', 'submitted', 'approved', 'rejected');

create type public.business_type as enum (
  'proprietorship', 'partnership', 'llp', 'private_limited', 'other'
);


-- ==========================================================
-- 2. Tables
-- ==========================================================

-- One KYC record per spa.
create table public.spa_kyc (
  spa_id                    uuid primary key references public.spas (id) on delete cascade,
  status                    public.kyc_status not null default 'draft',
  legal_name                text,
  business_type             public.business_type,
  owner_name                text,
  pan                       text check (pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'),
  gst_registered            boolean not null default false,
  gstin                     text check (gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$'),
  trade_licence_number      text,
  trade_licence_authority   text,
  trade_licence_expiry      date,
  shop_establishment_number text,
  id_proof_type             text check (id_proof_type in ('aadhaar_masked', 'driving_licence', 'passport', 'voter_id')),
  bank_account_name         text,
  bank_account_number       text check (bank_account_number ~ '^[0-9]{9,18}$'),
  bank_ifsc                 text check (bank_ifsc ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
  declaration_accepted      boolean not null default false,
  submitted_at              timestamptz,
  reviewed_at               timestamptz,
  review_note               text,
  updated_at                timestamptz not null default now()
);

-- One row per uploaded file. The file itself is kept in private storage.
create table public.kyc_documents (
  id           uuid primary key default gen_random_uuid(),
  spa_id       uuid not null references public.spas (id) on delete cascade,
  kind         text not null check (kind in (
                 'pan', 'gst', 'trade_licence', 'shop_establishment', 'id_proof', 'bank_proof', 'other'
               )),
  storage_path text not null,
  file_name    text not null,
  created_at   timestamptz not null default now()
);

create index kyc_documents_spa_id_idx on public.kyc_documents (spa_id);


-- ==========================================================
-- 3. Automatic steps
-- ==========================================================

-- True while the owner may still change their KYC: not started, a draft,
-- or sent back by the client.
create function public.kyc_editable(target_spa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.owns_spa(target_spa_id) and not exists (
    select 1 from public.spa_kyc
    where spa_id = target_spa_id and status in ('submitted', 'approved')
  );
$$;

-- Approving the KYC puts the spa live; rejecting it takes the spa down.
create function public.on_kyc_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();

  if new.status is distinct from old.status then
    if new.status = 'approved' then
      update public.spas set is_approved = true where id = new.spa_id;
      new.reviewed_at := now();
    elsif new.status = 'rejected' then
      update public.spas set is_approved = false where id = new.spa_id;
      new.reviewed_at := now();
    end if;
  end if;

  return new;
end;
$$;

create trigger before_kyc_update
  before update on public.spa_kyc
  for each row execute function public.on_kyc_change();

-- The owner sends their KYC for review. Everything needed must be filled in.
create function public.submit_kyc(target_spa uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  kyc public.spa_kyc%rowtype;
  missing text;
begin
  if not public.owns_spa(target_spa) then
    raise exception 'Spa not found';
  end if;

  select * into kyc from public.spa_kyc where spa_id = target_spa for update;

  if not found then
    raise exception 'Please save your details first';
  end if;

  if kyc.status not in ('draft', 'rejected') then
    raise exception 'Your KYC has already been submitted';
  end if;

  if coalesce(kyc.legal_name, '') = '' or kyc.business_type is null or coalesce(kyc.owner_name, '') = '' then
    raise exception 'Please fill in the business details';
  end if;

  if kyc.pan is null then
    raise exception 'Please enter your PAN';
  end if;

  if kyc.gst_registered and kyc.gstin is null then
    raise exception 'Please enter your GSTIN, or choose "Not GST registered"';
  end if;

  if coalesce(kyc.trade_licence_number, '') = '' or coalesce(kyc.trade_licence_authority, '') = ''
     or kyc.trade_licence_expiry is null then
    raise exception 'Please fill in the trade licence details';
  end if;

  if kyc.trade_licence_expiry < current_date then
    raise exception 'Your trade licence has expired. Please renew it first';
  end if;

  if kyc.id_proof_type is null then
    raise exception 'Please choose the owner ID proof';
  end if;

  if coalesce(kyc.bank_account_name, '') = '' or kyc.bank_account_number is null or kyc.bank_ifsc is null then
    raise exception 'Please fill in the bank account for payouts';
  end if;

  if not kyc.declaration_accepted then
    raise exception 'Please accept the declaration';
  end if;

  select string_agg(label, ', ') into missing
    from (values
      ('pan', 'PAN card', true),
      ('gst', 'GST certificate', kyc.gst_registered),
      ('trade_licence', 'trade licence', true),
      ('id_proof', 'owner ID proof', true),
      ('bank_proof', 'cancelled cheque or passbook', true)
    ) as needed (kind, label, required)
    where required and not exists (
      select 1 from public.kyc_documents d where d.spa_id = target_spa and d.kind = needed.kind
    );

  if missing is not null then
    raise exception 'Please upload: %', missing;
  end if;

  update public.spa_kyc
    set status = 'submitted', submitted_at = now(), review_note = null
    where spa_id = target_spa;
end;
$$;


-- ==========================================================
-- 4. Who may touch which columns
-- ==========================================================

revoke all on public.spa_kyc, public.kyc_documents from anon, authenticated;
revoke all on function public.kyc_editable(uuid) from public, anon;
revoke all on function public.submit_kyc(uuid) from public, anon;
revoke all on function public.on_kyc_change() from public, anon, authenticated;
grant execute on function public.kyc_editable(uuid) to authenticated;
grant execute on function public.submit_kyc(uuid) to authenticated;

-- Owners never set status, dates or the review note: only the client does.
grant select on public.spa_kyc to authenticated;
grant insert (spa_id, legal_name, business_type, owner_name, pan, gst_registered, gstin,
              trade_licence_number, trade_licence_authority, trade_licence_expiry,
              shop_establishment_number, id_proof_type, bank_account_name,
              bank_account_number, bank_ifsc, declaration_accepted),
      update (legal_name, business_type, owner_name, pan, gst_registered, gstin,
              trade_licence_number, trade_licence_authority, trade_licence_expiry,
              shop_establishment_number, id_proof_type, bank_account_name,
              bank_account_number, bank_ifsc, declaration_accepted)
  on public.spa_kyc to authenticated;

grant select, delete on public.kyc_documents to authenticated;
grant insert (spa_id, kind, storage_path, file_name) on public.kyc_documents to authenticated;


-- ==========================================================
-- 5. Which rows each person may see (row-level security)
-- ==========================================================

alter table public.spa_kyc enable row level security;
alter table public.kyc_documents enable row level security;

create policy "Owners see their own KYC"
  on public.spa_kyc for select to authenticated
  using (public.owns_spa(spa_id));

create policy "Owners start their own KYC"
  on public.spa_kyc for insert to authenticated
  with check (public.owns_spa(spa_id));

create policy "Owners change their KYC until it is submitted"
  on public.spa_kyc for update to authenticated
  using (public.owns_spa(spa_id) and status in ('draft', 'rejected'))
  with check (public.owns_spa(spa_id) and status in ('draft', 'rejected'));

create policy "Owners see their own KYC documents"
  on public.kyc_documents for select to authenticated
  using (public.owns_spa(spa_id));

create policy "Owners add KYC documents until submitted"
  on public.kyc_documents for insert to authenticated
  with check (public.kyc_editable(spa_id) and storage_path like spa_id::text || '/%');

create policy "Owners remove KYC documents until submitted"
  on public.kyc_documents for delete to authenticated
  using (public.kyc_editable(spa_id));


-- ==========================================================
-- 6. Private storage for the documents
-- ==========================================================

-- Not public: files can only be opened by their owner or in the dashboard.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'spa-kyc',
  'spa-kyc',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Files are stored as <spa id>/<file name>, like spa photos.
create policy "Owners see their own KYC files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'spa-kyc'
    and public.owns_spa(((storage.foldername(name))[1])::uuid)
  );

create policy "Owners upload KYC files until submitted"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'spa-kyc'
    and public.kyc_editable(((storage.foldername(name))[1])::uuid)
  );

create policy "Owners delete KYC files until submitted"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'spa-kyc'
    and public.kyc_editable(((storage.foldername(name))[1])::uuid)
  );
