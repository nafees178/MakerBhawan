-- ============================================================================
-- ARTL — project mentors and banner images
-- ============================================================================
-- The summer projects are each run by a named mentor (sometimes two), and the
-- projects page now leads with a banner image rather than a bare list. Both are
-- plain text: `mentors` is a display string ("Amay Shetty and Anjaneya Damle")
-- rather than a join onto `members`, because mentors are not all listed on the
-- People page and the pairing is editorial, not structural.
--
-- `image_url` holds either a path under /public (the banners shipped with the
-- repo) or a Supabase Storage public URL (anything uploaded later through
-- /admin), exactly like `members.photo_url`.
-- ============================================================================

alter table projects
  add column if not exists mentors   text,
  add column if not exists image_url text;

-- 0007 grants insert/update/delete on `projects` at table level, so the new
-- columns need no further grant.
