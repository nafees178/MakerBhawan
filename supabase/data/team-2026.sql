-- ============================================================================
-- ARTL team 2026–27 — replaces the roster imported from the official site
-- ============================================================================
-- Run once in the Supabase SQL editor. One transaction: all or nothing.
--
--   Faculty Advisors      Dr. Rajit Ranjan, Dr. Bhivraj Suthar
--   Managers              Sambhav Jha, Mrudhul Tula   (existing rows kept: photos, links)
--   Overall Coordinators  Ishita, Nirni               (details pending: placeholders)
-- ============================================================================

begin;

-- 0008, repeated here so this script works on the live database as-is.
alter table members
  add column if not exists github_url  text,
  add column if not exists profile_url text;

-- The managers keep their rows, so their photos and LinkedIn carry over.
delete from members where full_name not in ('Sambhav Jha', 'Mrudhul Tula');

update members set role_label = 'Manager', department = 'Managers', sort_order = 3, is_placeholder = false
 where full_name = 'Sambhav Jha';
update members set role_label = 'Manager', department = 'Managers', sort_order = 4, is_placeholder = false
 where full_name = 'Mrudhul Tula';

-- sort_order also orders the sections on the People page: advisors first.
insert into members (full_name, role_label, department, photo_url, profile_url, email, sort_order, is_placeholder) values
  ('Dr. Rajit Ranjan', 'Faculty Advisor', 'Faculty Advisors',
   '/images/team/rajit-ranjan.jpg',
   'https://www.iitj.ac.in/People/Profile/09759489-697b-41f4-866d-c6fa9429e6d6',
   'rajitranjan@iitj.ac.in', 1, false),
  ('Dr. Bhivraj Suthar', 'Faculty Advisor', 'Faculty Advisors',
   null,  -- no official photo reachable yet; upload in Admin → People
   'https://research.iitj.ac.in/researcher/bhivraj-suthar',
   'bhivraj@iitj.ac.in', 2, false);

insert into members (full_name, role_label, department, sort_order, is_placeholder) values
  ('Ishita', 'Overall Coordinator', 'Overall Coordinators', 5, true),
  ('Nirni',  'Overall Coordinator', 'Overall Coordinators', 6, true);

select full_name, role_label, department, sort_order, is_placeholder,
       photo_url is not null as has_photo
  from members order by sort_order;

commit;
