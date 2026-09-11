# Official ARTL data snapshot

Pulled 2026-09-10 from the official site (nafees178/MakerBhawan, live at artinkeringlab.iitj.ac.in).

- `events.json` - GET https://artinkeringlab.iitj.ac.in/api/events (17 records, MongoDB)
- `members.json` + `team/` - the hardcoded roster in `components/sections/TeamSection.tsx` and `public/images/team/`
- Inventory and projects: the official API returns `[]` for both; the database holds none.
