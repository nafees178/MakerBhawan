-- ============================================================================
-- ARTL — lending RPCs
-- ============================================================================
-- Every stock movement lives here, because every stock movement needs a row
-- lock. The tables grant no direct UPDATE on qty_available (see 0002), so this
-- is the only path.
--
-- The race being defended against: two coordinators approve two different
-- pending requests for the same last unit at the same moment. Both read
-- qty_available = 1, both decrement, and the lab has promised one item to two
-- people. `select ... for update` serialises them; the loser gets
-- 'insufficient_stock' instead of a silent oversell.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- request_loan — creates a pending request. Moves no stock.
-- ----------------------------------------------------------------------------
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

  -- Guests (non-institute addresses) may browse and RSVP but never borrow.
  -- Enforced here rather than in the UI, since the UI is not a boundary.
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

  -- Reject requests that could never be satisfied, rather than parking them in
  -- the queue for a coordinator to discover.
  if p_qty > v_item.qty_total then
    raise exception 'the lab only holds % of that item', v_item.qty_total
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

-- ----------------------------------------------------------------------------
-- approve_loan — the one that takes the lock
-- ----------------------------------------------------------------------------
create or replace function approve_loan(p_loan uuid, p_due date)
returns loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan      loans%rowtype;
  v_available integer;
begin
  if not is_coordinator() then
    raise exception 'coordinators only' using errcode = 'insufficient_privilege';
  end if;

  if p_due is null or p_due < current_date then
    raise exception 'a due date in the future is required'
      using errcode = 'check_violation';
  end if;

  -- Lock the loan first, then the item, and always in that order. Two
  -- coordinators approving two loans against the same item would otherwise be
  -- free to grab the locks in opposite orders and deadlock.
  select * into v_loan from loans where id = p_loan for update;
  if not found then
    raise exception 'no such loan' using errcode = 'no_data_found';
  end if;

  if v_loan.status <> 'pending' then
    raise exception 'loan is already %', v_loan.status
      using errcode = 'check_violation';
  end if;

  -- The line this entire design exists for.
  select qty_available into v_available from items where id = v_loan.item_id for update;

  if v_available < v_loan.qty then
    raise exception 'insufficient_stock' using errcode = 'check_violation';
  end if;

  update items
     set qty_available = qty_available - v_loan.qty
   where id = v_loan.item_id;

  update loans
     set status = 'on_loan',
         due_date = p_due,
         decided_at = now(),
         decided_by = auth.uid()
   where id = p_loan
  returning * into v_loan;

  return v_loan;
end;
$$;

-- ----------------------------------------------------------------------------
-- reject_loan — no stock movement, because none was ever held
-- ----------------------------------------------------------------------------
create or replace function reject_loan(p_loan uuid, p_reason text default null)
returns loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan loans%rowtype;
begin
  if not is_coordinator() then
    raise exception 'coordinators only' using errcode = 'insufficient_privilege';
  end if;

  update loans
     set status = 'rejected',
         reject_reason = p_reason,
         decided_at = now(),
         decided_by = auth.uid()
   where id = p_loan and status = 'pending'
  returning * into v_loan;

  if not found then
    raise exception 'loan is not pending' using errcode = 'check_violation';
  end if;

  return v_loan;
end;
$$;

-- ----------------------------------------------------------------------------
-- return_loan — puts the stock back
-- ----------------------------------------------------------------------------
create or replace function return_loan(p_loan uuid)
returns loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan loans%rowtype;
begin
  if not is_coordinator() then
    raise exception 'coordinators only' using errcode = 'insufficient_privilege';
  end if;

  select * into v_loan from loans where id = p_loan for update;
  if not found or v_loan.status <> 'on_loan' then
    raise exception 'loan is not on loan' using errcode = 'check_violation';
  end if;

  -- `least(...)` guards the qty_available <= qty_total constraint against a
  -- double return, which would otherwise abort the transaction with a
  -- constraint violation rather than a readable error.
  update items
     set qty_available = least(qty_available + v_loan.qty, qty_total)
   where id = v_loan.item_id;

  update loans
     set status = 'returned', returned_at = now()
   where id = p_loan
  returning * into v_loan;

  return v_loan;
end;
$$;

-- ----------------------------------------------------------------------------
-- Demand view — what the register shows
-- ----------------------------------------------------------------------------
-- With stock moving at approval rather than at request, "4 available" can be
-- misleading if six people are already queued. This surfaces both numbers in
-- one query rather than making the register issue a count per row.
create or replace view items_with_demand
with (security_invoker = true)
as
select
  i.*,
  coalesce(p.pending_count, 0)::integer as pending_count,
  coalesce(p.pending_qty, 0)::integer   as pending_qty
from items i
left join (
  select item_id, count(*) as pending_count, sum(qty) as pending_qty
  from loans
  where status = 'pending'
  group by item_id
) p on p.item_id = i.id;

comment on view items_with_demand is
  'security_invoker so the view respects the caller''s RLS rather than the '
  'definer''s — without it, aggregate loan data would leak past loans_read_own.';

grant execute on function request_loan(uuid, integer, text) to authenticated;
grant execute on function approve_loan(uuid, date)          to authenticated;
grant execute on function reject_loan(uuid, text)           to authenticated;
grant execute on function return_loan(uuid)                 to authenticated;
