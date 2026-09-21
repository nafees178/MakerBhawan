-- ============================================================================
-- ARTL — security hardening
-- ============================================================================
-- Safe to run more than once.
--
-- 1. profiles were readable by every signed-in user. Sign-up is open, so that
--    meant anyone could register and read every member's email, name, roll
--    number and role. A user now reads their own row; coordinators read all.
--
-- 2. The loan functions were executable by anon (the default for a new
--    function is EXECUTE to PUBLIC). Each body refuses a caller who is not
--    signed in, but the door should be shut as well as locked.
--
-- 3. Only institute addresses may create an account. The sign-up form already
--    says so, but the form is not a boundary: the auth API accepts any address
--    from anyone holding the public key. The trigger now refuses the rest, so
--    inventory can only ever be requested by an @iitj.ac.in account.
--
--    What this does NOT do: prove the person owns the address. With "Confirm
--    email" off, anyone can register someone else's institute address. The
--    check that stops that is a coordinator, who approves every loan and hands
--    the hardware over in person.
-- ============================================================================

-- 1 --------------------------------------------------------------------------
drop policy if exists profiles_read on profiles;

create policy profiles_read on profiles
  for select to authenticated
  using (id = auth.uid() or is_coordinator());

-- 2 --------------------------------------------------------------------------
-- is_coordinator() and is_admin() are deliberately left alone: policies call
-- them as the querying role, and anon's read of `projects` and `events` runs
-- through is_coordinator().
revoke execute on function request_loan(uuid, integer, text) from public, anon;
revoke execute on function approve_loan(uuid, date)          from public, anon;
revoke execute on function reject_loan(uuid, text)           from public, anon;
revoke execute on function return_loan(uuid)                 from public, anon;

grant execute on function request_loan(uuid, integer, text) to authenticated;
grant execute on function approve_loan(uuid, date)          to authenticated;
grant execute on function reject_loan(uuid, text)           to authenticated;
grant execute on function return_loan(uuid)                 to authenticated;

-- 3 --------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null or new.email not ilike '%@iitj.ac.in' then
    raise exception 'only IIT Jodhpur email addresses may sign up'
      using errcode = 'check_violation';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'student'::app_role
  );
  return new;
end;
$$;
