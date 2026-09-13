# Anand Rathi Tinkerers' Lab

The site for the Anand Rathi Tinkerers' Lab, the maker space at IIT Jodhpur.

Live: <https://makerbhawan-dev.vercel.app>

Events, projects, equipment and the team are public. Members of the institute
sign in with their IITJ email and a one-time code; coordinators edit the content
from `/admin`.

## Stack

- **Next.js 16** (App Router, server components) with **React 19**
- **Tailwind CSS 3**
- **Supabase** for Postgres, auth and storage. Access is governed by row level
  security in the database, not by checks in the app, so calling the REST API
  directly gets you no further than the site does.
- **Vercel** for hosting, plus Vercel Analytics and Speed Insights

## Running it locally

You need Node 20 or newer and access to the Supabase project.

```bash
git clone https://github.com/nafees178/MakerBhawan.git
cd MakerBhawan
npm install

cp .env.example .env.local   # then fill in the two values
npm run dev                  # http://localhost:3000
```

The two values in `.env.local` come from the Supabase dashboard under
**Project Settings, API**. Both are public by design: Next.js inlines anything
prefixed `NEXT_PUBLIC_` into the browser bundle. Never add the service role key.

Without them the public pages will fail to load, because every page reads its
content from the database rather than from files.

## Setting up a fresh database

Only needed if you are pointing the site at a new Supabase project.

`supabase/` holds numbered migrations and the seed data. If the Supabase CLI
runs on your machine, use it. If it does not, and on Windows with Smart App
Control enabled it will not, paste the SQL into the dashboard editor instead:

1. `node scripts/build-seed.mjs` builds `supabase/bootstrap.sql`, which is every
   migration plus the seed in one transaction.
2. Paste that into the Supabase SQL editor and run it. Click into the editor
   before pasting, or the paste is silently dropped.
3. `supabase/apply-2026-09-13.sql` is the most recent change set on top of that,
   and is safe to run more than once.

The first administrator has to be promoted by hand, because the trigger that
classifies new accounts only ever hands out `student` or `guest`:

```sql
update profiles set role = 'admin' where email = 'you@iitj.ac.in';
```

## Deploying

Production runs on Vercel. The GitHub repository is not connected to the Vercel
project, so a push does not deploy anything by itself. Deploys are made from a
checkout:

```bash
npm install -g vercel
vercel link                       # choose the makerbhawan-dev project
vercel deploy --prod              # add --scope <team> if you belong to several
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the
Vercel project settings for the Production environment first. `.vercelignore`
keeps local `.env*` files out of the upload.

Two things to know about Supabase before a launch:

- The redirect allowlist must contain the deployed origin, or sign-in links
  bounce. It is under **Authentication, URL Configuration**.
- The built-in email sender is capped at **2 emails per hour for the whole
  project**, which makes sign-in unusable at any real volume. Lifting it means
  enabling custom SMTP, which also unlocks edited templates and therefore the
  `{{ .Token }}` code in the sign-in email.

## Checking a change

```bash
npm run typecheck
npm run build
node scripts/shoot.mjs http://localhost:3000/events ./shots events
```

`scripts/shoot.mjs` screenshots a route at 390, 768 and 1440 and fails if any
element sticks out past the viewport. It drives the viewport over the DevTools
protocol rather than through `--window-size`, because headless Chrome clamps its
window to about 500px wide and will quietly render a phone layout at desktop
width if you let it.

## Layout

```
app/
  (pages)/        contained pages: events, projects, inventory, people, admin, legal
  page.tsx        the home page, which runs full bleed
  sitemap.ts      generated from the database, revalidated hourly
  robots.ts
components/
  home/           hero, deck panels, stage, FAQ, scroll motion
  events/         event cards and banners
  projects/       the projects trajectory
  site/           analytics, cookie consent, phone action bar
lib/
  supabase/       browser, server and session-less public clients
  data.ts         every public read
  site.ts         canonical URL, contact details, per-page metadata helper
supabase/
  migrations/     numbered, run in order
  data/           content imported as SQL
public/images/    photographs, WebP
```

## Credits

Original site by Nafees and Harish, IIT Jodhpur.

© Anand Rathi Tinkerers' Lab, IIT Jodhpur.
