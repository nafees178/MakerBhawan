-- ============================================================================
-- ARTL — member links for the 2026 team
-- ============================================================================
-- Students list LinkedIn and GitHub; faculty advisors link to their institute
-- profile instead. `is_placeholder` (0001) now means "details still to come":
-- the People page shows empty photo and link slots for those rows rather than
-- hiding them, so a missing LinkedIn reads as pending, not absent.
-- ============================================================================

alter table members
  add column if not exists github_url  text,
  add column if not exists profile_url text;

-- 0007 granted column-level UPDATE nowhere on members (coordinators hold a
-- table-level grant), so the new columns are writable without another grant.
