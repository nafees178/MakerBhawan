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

insert into projects (slug, title, subtitle, body, tags, year, mentors, image_url, sort_order, published) values
  (
    'swarm-exploration-ros2',
    'Swarm Exploration and Autonomous Mapping',
    'multi-robot SLAM in ROS 2',
    'One robot can map a room; a swarm can map a building. Fleets of TurtleBot3 robots are dropped into unknown Gazebo worlds with no map and no teleoperation. Each robot runs SLAM, merges its local occupancy grid into a shared global one, and pushes toward the nearest frontier until nothing unexplored is left. The build climbs from single-robot SLAM through map merging to coordinated exploration with collision avoidance.',
    array['ROS 2', 'SLAM Toolbox', 'Cartographer', 'Nav2', 'Gazebo', 'TurtleBot3', 'Python']::text[],
    2026, 'Saigirish', '/images/projects/swarm-exploration.webp', 1, true
  ),
  (
    'not-rocket-science',
    'Not Rocket Science',
    'visual servoing guidance simulator',
    'A camera on a pan-tilt gimbal locks onto a target and refuses to let go. Every frame becomes a line-of-sight measurement, streamed over UDP into a Simulink interceptor flying Pure Pursuit, LOS guidance and Proportional Navigation. Real optics at one end, a simulated vehicle at the other: a seeker-in-the-loop rig built from a Raspberry Pi, two servos and guidance theory worked out from the ground up.',
    array['OpenCV', 'ArUco', 'Visual Servoing', 'Raspberry Pi', 'Simulink', 'UDP', 'Python']::text[],
    2026, 'Amay Shetty and Anjaneya Damle', '/images/projects/visual-servoing-guidance.webp', 2, true
  ),
  (
    'bob-ross-without-ros',
    'Bob Ross without ROS',
    'a robotic arm that paints',
    'Hand it an image, get back a painting. A three-link planar arm turns contours into brush strokes: paths planned in task space to keep the geometry honest, inverse kinematics solved offline at every waypoint so execution stays cheap, brush angle taken from the local tangent of the curve. Written from first principles rather than pulled off the shelf, validated in simulation, then deployed to an ESP32-driven arm that puts real ink on real canvas.',
    array['Python', 'NumPy', 'SciPy', 'OpenCV', 'Inverse Kinematics', 'Trajectory Planning', 'ESP32']::text[],
    2026, 'Anjaneya Damle and Parv Dixit', '/images/projects/painting-arm.webp', 3, true
  ),
  (
    'drone-swarm-formation-control',
    'Drone Swarm',
    'trajectory tracking and formation control',
    'Dozens of drones holding formation looks like magic; it is a control law. Three nano-drones, a guidance vector field that provably converges onto a circular trajectory under a Lyapunov condition, and a formation controller that holds the shape when one drone drifts. Proven in Gazebo, then flown for real under motion capture, with ArUco perception, Kalman filtering and optical flow closing the gap between simulation and hardware.',
    array['ROS 2', 'Gazebo', 'Python', 'C++', 'OpenCV', 'Motion Capture', 'Formation Control', 'Lyapunov']::text[],
    2026, 'Krish Jain', '/images/projects/drone-swarm.webp', 4, true
  )
on conflict (slug) do update set
  title      = excluded.title,
  subtitle   = excluded.subtitle,
  body       = excluded.body,
  tags       = excluded.tags,
  year       = excluded.year,
  mentors    = excluded.mentors,
  image_url  = excluded.image_url,
  sort_order = excluded.sort_order,
  published  = excluded.published;

select sort_order, title, mentors, image_url, published
from projects order by sort_order;
