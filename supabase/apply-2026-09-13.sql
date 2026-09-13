-- ============================================================================
-- ARTL — apply in the Supabase SQL editor, in one go
-- ============================================================================
-- Paste this whole file into the SQL editor for project `artl` and run it.
-- It is the 13 September 2026 change set:
--
--   1. migration 0010   events gain a slug, a summary, a details body, a banner,
--                       a kind, an editorial order and a repository link;
--                       starts_at becomes optional; projects gain link_url and
--                       programme.
--   2. events-2026      the seventeen Prometeo rows are unpublished and the
--                       three standing events are inserted.
--   3. projects-2026    the four SPARK briefs are re-upserted, now tagged
--                       programme = 'spark-26'.
--   4. webp-assets      stored /images/ paths follow the JPEG to WebP re-encode.
--
-- Safe to run more than once: every step is `if not exists`, `on conflict do
-- update`, or a filtered update.
--
-- Two notes on the editor itself, learned the hard way:
--   * click into the Monaco editor before pasting, or the paste is dropped.
--   * it warns about "UPDATE without a WHERE clause" when `where` sits on its
--     own line. Every update here has one; the warning is about formatting.
-- ============================================================================

begin;

-- ==== supabase/migrations/0010_events_as_programmes.sql ===========
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


-- ==== supabase/data/events-2026.sql ===============================
-- ============================================================================
-- ARTL — the three standing events
-- ============================================================================
-- Run AFTER migration 0010.
--
-- Replaces the seventeen Prometeo '26 competition rows pulled from the official
-- site. Those are unpublished rather than deleted: they are a true record of
-- what ran in Dec 2025 and Jan 2026, and re-publishing one is a checkbox in
-- /admin. Nothing on the public site reads an unpublished row.
--
-- Sourcing, so the next person can check the claims rather than trust them:
--   * National Science Day: the date and the Raman effect are settled history.
--     The 2026 Institute Lecture title and speaker come from the PIB release on
--     IIT Jodhpur's own 2026 observance.
--   * Sandstone Summit: organiser, the reading of the name, and the four
--     verticals come from the School of Management and Entrepreneurship's page
--     on iitj.ac.in. 3.0 ran 23 to 25 September 2022; 5.0 is the most recent.
--   * Robocon: DD Robocon India is run with Prasar Bharati and STPI and feeds
--     ABU Robocon. The 2026 national round was hosted by IIT Delhi on a theme
--     drawn from Kung Fu, and its winner went to the Asia-Pacific round in
--     Hong Kong.
--
-- What is NOT sourced and is the lab's own statement of intent: the paragraphs
-- describing what ARTL itself does at each. A coordinator should read those
-- before the site goes to a wider audience.
-- ============================================================================

update events set published = false where slug is null;

insert into events (slug, title, kind, starts_at, ends_at, date_note, location, summary, details, image_url, image_alt, link_url, repo_url, sort_order, published) values
  (
    'national-science-day',
    'National Science Day',
    'campus',
    '2027-02-28 09:30+05:30', null,
    'Every 28 February',
    'Anand Rathi Tinkerers'' Lab, IIT Jodhpur',
    'India marks 28 February as the day C. V. Raman found the effect that carries his name. IIT Jodhpur marks it across the campus, and the lab opens its floor: student-built RC cars, a pick and place bot, drone frames and RC planes, with the people who made them there to explain how.',
    'On 28 February 1928, C. V. Raman shone light through a liquid and found that a small part of it came back at a different wavelength, shifted by the molecules it had passed through. The Raman effect won him the Nobel Prize in Physics in 1930 and gave chemistry a way to identify a substance from the light it scatters. India has observed National Science Day on that date since 1987.

IIT Jodhpur observes the day institute-wide. The 2026 observance was an Institute Lecture, "Managing Science, Empowering India: The Aswal Model", delivered by Prof. Dinesh Kumar Aswal of the National Disaster Management Authority.

Everything the lab puts on the floor that day was built by students here, not bought in. An RC car, designed and wired from parts rather than assembled from a kit. A pick and place bot running its cycle on the bench, lifting an object and setting it down somewhere else, which sounds trivial right up until you have to solve the kinematics behind it. Drone frames and RC planes, airframes included, cut and put together in this room.

The builds are presented as well as shown. Each one gets a short talk from the people who made it: what the brief was, what the first version got wrong, and what the current one does instead. The laser cutter and the desktop mill keep running through the day, so there are parts being made in front of you and not only finished ones sitting on a table.

It is open to anyone on campus, and to school groups visiting for the day. Nothing needs to be booked. Ask a coordinator if you want a walkthrough rather than a look around.',
    '/images/events/national-science-day.webp',
    'A prism splitting a beam of light into a spectrum across a dark wall.',
    null, null, 1, true
  ),
  (
    'sandstone-summit',
    'Sandstone Summit',
    'campus',
    null, null,
    'Last held 29 and 30 August 2026',
    'IIT Jodhpur',
    'Sandstone is the annual business conclave of IIT Jodhpur, run by the School of Management and Entrepreneurship. The sixth edition ran on 29 and 30 August 2026, bringing industry leaders onto the campus for two days of sessions with students.',
    'Sandstone is the annual business conclave of the School of Management and Entrepreneurship at IIT Jodhpur. The name is read two ways on campus: sandstone is the rock Jodhpur is built from, and it is a stone that forms by cohesion, grain settling onto grain until the thing holds together.

Sandstone Summit 6.0, the most recent edition, ran on 29 and 30 August 2026. Industry leaders and corporate professionals came onto the campus for two days of interactive sessions with students, which is the format the summit has always argued for: not a lecture series delivered at a hall, but people who run companies in a room with the people about to join them.

The summit runs across four verticals. Impressario is the flagship competition track. HR Shastra takes on people and organisation. Praesidium covers strategy and consulting. In Conversation is the interview series, where a figure from industry sits down with the room rather than presenting at it.

For a lab, a business summit is a useful and slightly uncomfortable room to be in. A build that reads well to an examiner does not automatically read well to someone deciding whether it is worth money. Taking a project to Sandstone means answering who needs this, what it costs to make, and what happens after the demonstration ends, which are the questions a working prototype eventually has to survive anyway.

Dates for the seventh edition have not been announced. This page will carry them, and the registration link, when they are.',
    '/images/events/sandstone-summit.webp',
    'The Sandstone Summit monogram: a letter S cut through by a diagonal stratum.',
    null, null, 2, true
  ),
  (
    'robocon',
    'Robocon',
    'outstation',
    null, null,
    'National round, early in the year',
    'Host campus, announced each season',
    'Robocon is the one the team travels for. DD Robocon India is the national stage of ABU Robocon, and the team that wins it represents the country against the rest of the Asia-Pacific.',
    'ABU Robocon is the annual robotics contest of the Asian-Pacific Broadcasting Union. Every season it sets a new task, drawn from the culture of the host country, and every participating nation runs its own qualifier to decide who goes. India''s qualifier is DD Robocon, run by Prasar Bharati with the Software Technology Parks of India and hosted on an IIT campus.

The 2026 national round was held at IIT Delhi on a theme taken from Kung Fu: robots built to duel, scored on speed and control, which in practice meant mechanical precision, computer vision and strategy decided in real time rather than in advance. The winning team went on to the Asia-Pacific round in Hong Kong.

Robocon is listed here as an outstation event because that is the shape of it. The season is eight or nine months of work done on this campus, in this lab, against a rulebook that is deliberately hard to satisfy, and then a few days somewhere else where the robot either does what it was built to do or does not. Machines, stock and bench space come from the lab; the team comes through the Robotics Society, which keeps its Robocon code in the open.

If you want in, the useful time to start is the month the theme is released, not the month before the contest. Talk to a coordinator.',
    '/images/events/robocon.webp',
    'A competition robot on a contest field: aluminium chassis, mecanum wheels and a team number board.',
    'https://ddrobocon.iitd.ac.in/', 'https://github.com/RoboticsClubIITJ', 3, true
  )
on conflict (slug) do update set
  title      = excluded.title,
  kind       = excluded.kind,
  starts_at  = excluded.starts_at,
  ends_at    = excluded.ends_at,
  date_note  = excluded.date_note,
  location   = excluded.location,
  summary    = excluded.summary,
  details    = excluded.details,
  image_url  = excluded.image_url,
  image_alt  = excluded.image_alt,
  link_url   = excluded.link_url,
  repo_url   = excluded.repo_url,
  sort_order = excluded.sort_order,
  published  = excluded.published;


-- ==== supabase/data/projects-2026.sql =============================
-- ============================================================================
-- ARTL — official summer projects (source: the four project briefs, Sep 2026)
-- ============================================================================
-- Run AFTER migration 0009 (adds projects.mentors and projects.image_url).
--
-- Titles, mentors and technical detail come from the mentors' own PDF briefs.
-- Deliberately NOT carried across from those briefs:
--   * coordinator phone numbers — personal contact details do not belong on a
--     public page; route enquiries through the lab instead.
--   * week-by-week timelines and contributor time commitments — these read as
--     recruitment collateral, not as a public project listing.
--
-- The four earlier entries (MiniRover-1 and friends) are pushed below these
-- rather than deleted; unpublish them from /admin if they should not show.
-- ============================================================================

-- Explicit values, not `sort_order + 10`, so re-running this file is a no-op.
update projects set sort_order = 11 where slug = 'minirover-1';
update projects set sort_order = 12 where slug = 'differential-linkage-rig';
update projects set sort_order = 13 where slug = 'gesture-control';
update projects set sort_order = 14 where slug = 'wireless-drive-stack';

insert into projects (slug, title, subtitle, body, tags, year, mentors, image_url, programme, sort_order, published) values
  (
    'swarm-exploration-ros2',
    'Swarm Exploration and Autonomous Mapping',
    'multi-robot SLAM in ROS 2',
    'One robot can map a room; a swarm can map a building. Fleets of TurtleBot3 robots are dropped into unknown Gazebo worlds with no map and no teleoperation. Each robot runs SLAM, merges its local occupancy grid into a shared global one, and pushes toward the nearest frontier until nothing unexplored is left. The build climbs from single-robot SLAM through map merging to coordinated exploration with collision avoidance.',
    array['ROS 2', 'SLAM Toolbox', 'Cartographer', 'Nav2', 'Gazebo', 'TurtleBot3', 'Python']::text[],
    2026, 'Saigirish', '/images/projects/swarm-exploration.webp', 'spark-26', 1, true
  ),
  (
    'not-rocket-science',
    'Not Rocket Science',
    'visual servoing guidance simulator',
    'A camera on a pan-tilt gimbal locks onto a target and refuses to let go. Every frame becomes a line-of-sight measurement, streamed over UDP into a Simulink interceptor flying Pure Pursuit, LOS guidance and Proportional Navigation. Real optics at one end, a simulated vehicle at the other: a seeker-in-the-loop rig built from a Raspberry Pi, two servos and guidance theory worked out from the ground up.',
    array['OpenCV', 'ArUco', 'Visual Servoing', 'Raspberry Pi', 'Simulink', 'UDP', 'Python']::text[],
    2026, 'Amay Shetty and Anjaneya Damle', '/images/projects/visual-servoing-guidance.webp', 'spark-26', 2, true
  ),
  (
    'bob-ross-without-ros',
    'Bob Ross without ROS',
    'a robotic arm that paints',
    'Hand it an image, get back a painting. A three-link planar arm turns contours into brush strokes: paths planned in task space to keep the geometry honest, inverse kinematics solved offline at every waypoint so execution stays cheap, brush angle taken from the local tangent of the curve. Written from first principles rather than pulled off the shelf, validated in simulation, then deployed to an ESP32-driven arm that puts real ink on real canvas.',
    array['Python', 'NumPy', 'SciPy', 'OpenCV', 'Inverse Kinematics', 'Trajectory Planning', 'ESP32']::text[],
    2026, 'Anjaneya Damle and Parv Dixit', '/images/projects/painting-arm.webp', 'spark-26', 3, true
  ),
  (
    'drone-swarm-formation-control',
    'Drone Swarm',
    'trajectory tracking and formation control',
    'Dozens of drones holding formation looks like magic; it is a control law. Three nano-drones, a guidance vector field that provably converges onto a circular trajectory under a Lyapunov condition, and a formation controller that holds the shape when one drone drifts. Proven in Gazebo, then flown for real under motion capture, with ArUco perception, Kalman filtering and optical flow closing the gap between simulation and hardware.',
    array['ROS 2', 'Gazebo', 'Python', 'C++', 'OpenCV', 'Motion Capture', 'Formation Control', 'Lyapunov']::text[],
    2026, 'Krish Jain', '/images/projects/drone-swarm.webp', 'spark-26', 4, true
  )
on conflict (slug) do update set
  title      = excluded.title,
  subtitle   = excluded.subtitle,
  body       = excluded.body,
  tags       = excluded.tags,
  year       = excluded.year,
  mentors    = excluded.mentors,
  programme  = excluded.programme,
  image_url  = excluded.image_url,
  sort_order = excluded.sort_order,
  published  = excluded.published;


-- ==== supabase/data/webp-assets.sql ===============================
-- ============================================================================
-- ARTL — repoint stored asset paths at the WebP versions
-- ============================================================================
-- The photographs under /public were re-encoded as WebP: same pixels, roughly
-- a third fewer bytes, which on a phone over campus wifi is the difference
-- people actually feel. Paths stored in the database have to follow.
--
-- Only rows pointing at /images/ are touched. Anything uploaded through /admin
-- lives on Supabase Storage under a different prefix and is left alone.
-- ============================================================================

update members
   set photo_url = regexp_replace(photo_url, '\.(jpe?g)$', '.webp')
 where photo_url like '/images/%'
   and photo_url ~ '\.(jpe?g)$';

update items
   set image_url = regexp_replace(image_url, '\.(jpe?g)$', '.webp')
 where image_url like '/images/%'
   and image_url ~ '\.(jpe?g)$';

update events
   set image_url = regexp_replace(image_url, '\.(jpe?g)$', '.webp')
 where image_url like '/images/%'
   and image_url ~ '\.(jpe?g)$';

update projects
   set image_url = regexp_replace(image_url, '\.(jpe?g)$', '.webp')
 where image_url like '/images/%'
   and image_url ~ '\.(jpe?g)$';

commit;

select 'published events' as check, count(*)::text as value from events where published
union all select 'events with a banner', count(*)::text from events where image_url is not null
union all select 'banners with alt text', count(*)::text from events where image_alt is not null
union all select 'nsd mentions the builds', (select (details like '%pick and place%')::text from events where slug = 'national-science-day');
