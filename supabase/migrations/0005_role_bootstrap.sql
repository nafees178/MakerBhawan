-- ============================================================================
-- ARTL — let a trusted server-side caller set roles
-- ============================================================================
-- enforce_role_change() (0001) demands that auth.uid() belong to an existing
-- admin before any role may change. Under the service key auth.uid() is NULL,
-- and in a psql session there is no JWT at all, so the check failed for every
-- caller that was not already an authenticated admin.
--
-- Two consequences, both real:
--   * the FIRST admin could never be created — there is no admin yet, so
--     nothing can appoint one, and the design note "coordinator/admin granted
--     by hand" had no mechanism behind it;
--   * tests/concurrency.spec.ts and tests/rls.spec.ts could not build their
--     own fixtures, which is how this surfaced.
--
-- The guard itself is right and stays exactly as strict for anyone arriving
-- through the API: it blocks students, and it blocks coordinators promoting
-- themselves, which is the escalation that matters. What it needs is an
-- exemption for callers that are already trusted.
--
-- auth.role() reads the `role` claim of the verified JWT, so it cannot be
-- forged without the project's JWT secret, and it is unaffected by this
-- function being SECURITY DEFINER (current_user would report the definer).
--   'anon' / 'authenticated' -> an end user, always checked
--   'service_role'           -> the server-side admin key, never in a browser
--   NULL                     -> no JWT: direct psql, i.e. already superuser
-- ============================================================================

create or replace function enforce_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- Trusted server-side context: the service key, or a direct SQL session.
    if coalesce(auth.role(), 'service_role') = 'service_role' then
      return new;
    end if;

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
