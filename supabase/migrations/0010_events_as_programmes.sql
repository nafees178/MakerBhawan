-- ============================================================================
-- ARTL — events become programmes, projects get a permalink
-- ============================================================================
-- The events table was built for the Prometeo '26 competition list: seventeen
-- rows, each a title, a date and a link out to unstop. The public page is now
-- three standing programmes instead, each of which needs a card on the listing
-- and a page of its own, so the row has to carry the writing rather than point
-- at someone else's site.
--
--   slug       stable permalink; /events/<slug>
--   summary    the card. Two or three sentences, no more.
--   details    the page. Paragraphs separated by a blank line.
--   image_url  banner, under /public or a Supabase Storage URL, like members.photo_url
--   kind       'campus' or 'outstation'. Outstation means the team travels.
--   date_note  what to print when the date is not settled, or when the real
--              answer is "every 28 February" rather than one timestamp.
--   sort_order editorial order on the listing; the dates no longer give one.
--
-- starts_at loses its NOT NULL for the same reason: an annual fixture with no
-- announced date is a real state, and parking a made-up timestamp in the column
-- to satisfy a constraint would put a wrong date in front of a reader.
-- ============================================================================

alter table events
  add column if not exists slug       text,
  add column if not exists summary    text,
  add column if not exists details    text,
  add column if not exists image_url  text,
  add column if not exists kind       text not null default 'campus',
  add column if not exists date_note  text,
  add column if not exists sort_order integer not null default 0,
  -- Two links, because they answer different questions. `link_url` is the
  -- organiser's own site, which is where a reader goes to enter. `repo_url` is
  -- the team's code, which is where a reader goes to see what was actually
  -- built. Collapsing them into one field means losing whichever is second.
  add column if not exists repo_url   text,
  -- Alt text belongs with the image, not derived from the title. Two of the
  -- three banners are not photographs of this lab at all (a prism, another
  -- team's competition robot, a summit's monogram), so a generated caption
  -- would describe something the reader is not looking at.
  add column if not exists image_alt  text;

alter table events alter column starts_at drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'events_kind_check') then
    alter table events add constraint events_kind_check
      check (kind in ('campus', 'outstation'));
  end if;
end $$;

-- Plain, not partial. Postgres already treats NULLs as distinct in a unique
-- index, so the seventeen archived rows can all keep a null slug, and a
-- non-partial index is the only kind `on conflict (slug)` can infer from: a
-- partial one fails with 42P10 unless every upsert repeats the predicate.
create unique index if not exists events_slug_key on events (slug);

-- The index behind the old ordering assumed a non-null start.
drop index if exists events_starts_idx;
create index if not exists events_order_idx on events (sort_order, starts_at desc nulls last);

-- Projects need a permalink of their own for the same reason: the listing now
-- links each SPARK brief through to its own page.
--
-- `programme` is the banner a project ran under. SPARK is Summer Projects for
-- Advanced Robotics and Kinematics, released by the Robotics Society; the lab
-- hosts the builds. It is a plain text slug rather than an enum so that next
-- year's programme needs a row, not a migration. Null means the project was not
-- run under a named programme.
alter table projects
  add column if not exists link_url  text,
  add column if not exists programme text;

-- 0007 grants insert/update/delete at table level on both tables, so the new
-- columns inherit those grants and need no further GRANT here.
