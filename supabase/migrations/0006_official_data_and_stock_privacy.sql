-- ============================================================================
-- ARTL — official data shape, and stock counts for coordinators only
-- ============================================================================
-- Two changes on top of 0001–0005:
--
-- 1. Columns the official site's data carries that the original schema lacked:
--    a member's department, LinkedIn and email; an event's external link and the
--    MongoDB id it was imported from (so a re-import updates instead of
--    duplicating); an item's variant and bench-only flag.
--
-- 2. Exact stock is admin information. The public sees whether an item is
--    available, never how many the lab holds. RLS cannot hide a *column*, and a
--    column grant cannot tell a coordinator from a student (both are
--    `authenticated`), so the base table becomes coordinator-only and everyone
--    else reads `items_public`, which exposes a boolean instead of the counts.
-- ============================================================================

alter table members
  add column department   text,
  add column linkedin_url text,
  add column email        text;

alter table members alter column is_placeholder set default false;

alter table events
  add column link_url    text,
  add column external_id text unique;

alter table items
  add column variant    text,
  add column bench_only boolean not null default false;

-- ----------------------------------------------------------------------------
-- Stock privacy
-- ----------------------------------------------------------------------------
drop policy items_read on items;

create policy items_read on items
  for select to authenticated
  using (is_coordinator());

revoke select on items from anon;
revoke select on items_with_demand from anon;

-- Deliberately NOT security_invoker: the view runs as its owner so it can read
-- the counts the caller cannot, and it only ever hands back the boolean.
create view items_public as
select
  id, code, name, variant, category, description, specs, image_url, bench_only,
  (qty_available > 0) as available
from items;

comment on view items_public is
  'Public inventory. Runs as owner on purpose: exposes availability, never '
  'qty_total or qty_available. Those stay behind items_read (coordinators).';

grant select on items_public to anon, authenticated;

-- request_loan used to put qty_total in its error message, which would let any
-- student read the hidden count by asking for too many.
create or replace function request_loan(p_item uuid, p_qty integer default 1, p_note text default null)
returns loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role app_role;
  v_item items%rowtype;
  v_loan loans%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = 'insufficient_privilege';
  end if;

  select role into v_role from profiles where id = auth.uid();

  if v_role = 'guest' or v_role is null then
    raise exception 'only IIT Jodhpur members may borrow equipment'
      using errcode = 'insufficient_privilege';
  end if;

  if p_qty < 1 then
    raise exception 'quantity must be at least 1' using errcode = 'check_violation';
  end if;

  select * into v_item from items where id = p_item;
  if not found then
    raise exception 'no such item' using errcode = 'no_data_found';
  end if;

  if p_qty > v_item.qty_total then
    raise exception 'that quantity is more than the lab can lend'
      using errcode = 'check_violation';
  end if;

  insert into loans (item_id, user_id, qty, status, note)
  values (p_item, auth.uid(), p_qty, 'pending', p_note)
  returning * into v_loan;

  return v_loan;
exception
  when unique_violation then
    raise exception 'you already have an open request or loan for that item'
      using errcode = 'unique_violation';
end;
$$;
