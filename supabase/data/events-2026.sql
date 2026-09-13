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

select sort_order, slug, title, kind, date_note, published from events where published order by sort_order;
select count(*) as unpublished_prometeo_rows from events where not published;
