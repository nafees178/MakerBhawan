-- ============================================================================
-- ARTL — exact privileges, and a safe way for coordinators to set stock
-- ============================================================================
-- The hosted project was created with "Automatically expose new tables" on,
-- which grants anon/authenticated broad privileges on every table as it is
-- created. RLS still gates rows, but a table-level UPDATE silently widens the
-- deliberate column grants from 0002 (see the warning in 0004). So start from
-- nothing and grant exactly what the design intends, whatever that setting did.
-- ============================================================================

revoke all on all tables in schema public from anon, authenticated;

-- anon: the public site. No `items` — stock counts are coordinator-only (0006).
grant select on projects, events, members, items_public to anon;

-- authenticated: RLS decides which rows.
grant select on profiles, items, loans, projects, events, members,
                items_with_demand, items_public to authenticated;

grant insert, delete on items to authenticated;
grant update (code, name, variant, category, description, specs, qty_total,
              image_url, bench_only) on items to authenticated;

grant insert, delete on profiles to authenticated;
grant update (full_name, roll_no) on profiles to authenticated;

grant update on loans to authenticated;

grant insert, update, delete on projects, events, members to authenticated;

-- ----------------------------------------------------------------------------
-- set_item_stock — the admin's stock editor
-- ----------------------------------------------------------------------------
-- qty_available has no direct UPDATE grant (it belongs to the loan RPCs), but an
-- admin correcting a stock count still needs to set it. This takes the same row
-- lock as approve_loan so a correction cannot interleave with an approval.
create or replace function set_item_stock(p_item uuid, p_total integer, p_available integer)
returns items
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item items%rowtype;
begin
  if not is_coordinator() then
    raise exception 'coordinators only' using errcode = 'insufficient_privilege';
  end if;

  if p_total is null or p_available is null or p_total < 0 or p_available < 0
     or p_available > p_total then
    raise exception 'available must be between 0 and the total'
      using errcode = 'check_violation';
  end if;

  perform 1 from items where id = p_item for update;
  if not found then
    raise exception 'no such item' using errcode = 'no_data_found';
  end if;

  update items
     set qty_total = p_total, qty_available = p_available
   where id = p_item
  returning * into v_item;

  return v_item;
end;
$$;

revoke execute on function set_item_stock(uuid, integer, integer) from public, anon;
grant execute on function set_item_stock(uuid, integer, integer) to authenticated;

-- ----------------------------------------------------------------------------
-- set_user_role — how an admin appoints coordinators
-- ----------------------------------------------------------------------------
-- profiles.role has no UPDATE grant for anyone (0002), so even an admin cannot
-- change it through the API directly. This is the one sanctioned path. It also
-- refuses self-changes, so the last admin cannot demote themselves by accident.
create or replace function set_user_role(p_user uuid, p_role app_role)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile profiles%rowtype;
begin
  if not is_admin() then
    raise exception 'admins only' using errcode = 'insufficient_privilege';
  end if;

  if p_user = auth.uid() then
    raise exception 'you cannot change your own role' using errcode = 'check_violation';
  end if;

  update profiles set role = p_role where id = p_user
  returning * into v_profile;

  if not found then
    raise exception 'no such user' using errcode = 'no_data_found';
  end if;

  return v_profile;
end;
$$;

revoke execute on function set_user_role(uuid, app_role) from public, anon;
grant execute on function set_user_role(uuid, app_role) to authenticated;
