-- ============================================================================
-- ARTL — core schema
-- ============================================================================
-- Two things worth knowing before reading further:
--
-- 1. `profiles` is accounts; `members` is the public team roster. They are
--    separate because most people on the roster page (advisors, alumni) may
--    never sign in, and folding them together forces a nullable auth id and a
--    pile of "is this a real user" checks everywhere.
--
-- 2. Stock moves on coordinator approval, not on request. Several students may
--    hold pending requests against the last unit; `approve_loan` is where the
--    race is resolved. See 0003_rpc.sql.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists citext;

-- ----------------------------------------------------------------------------
-- Roles
-- ----------------------------------------------------------------------------
create type app_role as enum ('guest', 'student', 'coordinator', 'admin');

create type loan_status as enum (
  'pending',    -- requested, awaiting a coordinator
  'on_loan',    -- approved; stock has been decremented
  'returned',   -- back on the shelf; stock restored
  'rejected',   -- coordinator declined; no stock ever moved
  'cancelled'   -- withdrawn by the requester while still pending
);

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       citext unique not null,
  full_name   text,
  roll_no     text,
  role        app_role not null default 'guest',
  created_at  timestamptz not null default now()
);

comment on column profiles.role is
  'Set by trigger on signup from the email domain. Only an admin may change it '
  'afterwards — see enforce_role_change(). Never expose this column to an '
  'owner-update policy or any student can promote themselves.';

-- ----------------------------------------------------------------------------
-- items
-- ----------------------------------------------------------------------------
create table items (
  id             uuid primary key default uuid_generate_v4(),
  code           text unique not null,              -- ARTL-MC-001
  name           text not null,
  category       text not null,
  description    text,
  specs          jsonb not null default '{}'::jsonb,
  qty_total      integer not null check (qty_total >= 0),
  qty_available  integer not null check (qty_available >= 0),
  image_url      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- The backstop. Every stock movement goes through an RPC that takes a row
  -- lock, but a constraint is what makes overselling impossible rather than
  -- merely unlikely — it holds even if someone bypasses the RPC entirely.
  constraint qty_available_within_total check (qty_available <= qty_total)
);

create index items_category_idx on items (category);
create index items_name_trgm_idx on items using gin (to_tsvector('english', name));

-- ----------------------------------------------------------------------------
-- loans
-- ----------------------------------------------------------------------------
create table loans (
  id             uuid primary key default uuid_generate_v4(),
  item_id        uuid not null references items on delete restrict,
  user_id        uuid not null references profiles on delete cascade,
  qty            integer not null default 1 check (qty > 0),
  status         loan_status not null default 'pending',
  requested_at   timestamptz not null default now(),
  decided_at     timestamptz,
  decided_by     uuid references profiles,
  due_date       date,
  returned_at    timestamptz,
  note           text,
  reject_reason  text,

  -- An approved loan must carry a due date; "borrowed indefinitely" is how
  -- equipment disappears.
  constraint on_loan_needs_due_date
    check (status <> 'on_loan' or due_date is not null)
);

create index loans_user_idx on loans (user_id, status);
create index loans_item_idx on loans (item_id, status);
create index loans_pending_idx on loans (requested_at) where status = 'pending';

-- One open request per person per item. Without this, a student can queue ten
-- requests for the same item and monopolise the approval queue.
create unique index loans_one_open_per_item
  on loans (user_id, item_id)
  where status in ('pending', 'on_loan');

-- ----------------------------------------------------------------------------
-- Public content. Written by coordinators, readable by the world.
-- ----------------------------------------------------------------------------
create table projects (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  title        text not null,
  subtitle     text,
  body         text,
  tags         text[] not null default '{}',
  year         integer,
  sort_order   integer not null default 0,
  published    boolean not null default false,
  created_at   timestamptz not null default now()
);

create table events (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  description  text,
  location     text,
  capacity     integer check (capacity is null or capacity > 0),
  published    boolean not null default false,
  created_at   timestamptz not null default now()
);

create index events_starts_idx on events (starts_at desc);

create table members (
  id           uuid primary key default uuid_generate_v4(),
  full_name    text not null,
  role_label   text not null,
  sort_order   integer not null default 0,
  photo_url    text,
  -- Honours the flag-don't-fabricate rule: seeded rows are generic role titles
  -- ("Faculty Advisor"), and the UI renders them differently so a placeholder
  -- is never mistaken for a real person.
  is_placeholder boolean not null default true,
  is_alumni    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Signup: classify by email domain
-- ----------------------------------------------------------------------------
-- Institute addresses become students and may borrow. Everyone else becomes a
-- guest: they can browse and RSVP, but `request_loan` refuses them, because
-- hardware should only leave the lab with someone the institute can identify.
-- ----------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    case when new.email ilike '%@iitj.ac.in' then 'student'::app_role
         else 'guest'::app_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- Role changes are admin-only, enforced in the database
-- ----------------------------------------------------------------------------
-- A route guard is not a security boundary — anyone can call the REST API
-- directly with the anon key. This trigger is the actual boundary. Note it
-- blocks coordinators from promoting themselves to admin, not just students.
-- ----------------------------------------------------------------------------
create or replace function enforce_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ) then
      raise exception 'only an admin may change a role'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_role_guard
  before update on profiles
  for each row execute function enforce_role_change();

-- ----------------------------------------------------------------------------
-- Helpers used by the policies in 0002
-- ----------------------------------------------------------------------------
create or replace function is_coordinator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('coordinator', 'admin')
  );
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger items_touch_updated_at
  before update on items
  for each row execute function touch_updated_at();
