# Green India 🌱

A light, responsive, mobile-first environmental community website. Built with **TypeScript, HTML, CSS, Vite** and optional **Supabase** for shared community reports.

## Features
- Responsive light theme with lightweight CSS illustrations and reduced-motion support.
- Community feed for potholes/road damage, dirty rivers/water, garbage dumping, plastic pollution, broken bins and green spaces.
- Search button and category filters: search by city, state, neighbourhood, street, landmark or address. Shared reports are loaded in pages (up to 20,000 per browser load).
- Report form with title, category, description, address/landmark, city, state, optional photo and optional mobile number.
- Image validation (JPG/PNG/WebP, max 5 MB), input checks and privacy reminders.
- Local eco-habit checklist saved in the visitor's browser.
- 12 practical eco-tips covering water saving, rainwater harvesting, native trees, plant care, composting, plastic reduction, energy, cleaner travel, wildlife and e-waste.
- A dedicated About Green India section explaining the website mission and creator credit.
- Lightweight scroll-reveal animations, floating decorative motion and reduced-motion accessibility support.
- Mobile-first layouts with larger readable tip cards and a single-column layout on small phones.
- School activity ideas and official information links.
- Clearly labelled demo/sample reports.
- Footer credit: **Web Created By Xtreme**.
- Works as a static frontend on Vercel or GitHub Pages. Real public sharing and cross-visitor location search require Supabase setup.

## Important: local demo vs public posts
Without Supabase, reports are saved **only in that browser's local storage**. They do not reach other visitors and cannot appear in other people's public search. With Supabase configured, anyone can view the shared feed and search posts by city, state, area, street, landmark or address. A selected photo is shown on the report for the current browser session only; it is not uploaded and will not remain attached after a refresh. The optional mobile number is not shown on report cards. The static frontend can be built and hosted without filling in any `.env` values. To enable real shared reports and photos, configure Supabase using the steps below.

The example Supabase SQL enables public read/insert for an unauthenticated community form. This is convenient for a prototype but is not a complete production moderation system: add rate limiting/CAPTCHA, report review and removal, abuse controls, privacy policy and a trusted adult/administrator review process before public promotion. Do not collect mobile numbers unless necessary. A public report should not expose a private home address, faces or vehicle registration numbers. The website is not an official complaint portal and does not automatically send complaints to a municipality.

## Run locally
Install Node.js 20.19+ or 22+.

```bash
npm install
npm run dev
```

Open the local URL Vite prints in the terminal.

## Check/build
```bash
npm run typecheck
npm run build
npm run preview
```
Vite outputs the static site into `dist/`.

## Optional: enable shared public reports with Supabase
1. Create a project in Supabase.
2. Open **SQL Editor** and run `supabase/setup.sql`.
3. In project settings, copy the Project URL and the **anon/publishable** key (never use a `service_role` key in the browser).
4. Copy `.env.example` to `.env.local` and fill in:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
   ```
5. Restart Vite and test a report with a non-sensitive test photo.
6. For hosted deployment, add the same two environment variables in the hosting provider's project settings and redeploy.

**Security note:** frontend environment variables are public in the built website. Only use the Supabase anon/publishable key with Row Level Security. Never add private API keys, service-role keys or passwords.

## Deploy to Vercel
1. Push this folder to a GitHub repository.
2. In Vercel, import that repository.
3. Framework preset: **Vite** (or Other).
4. Build command: `npm run build`; output directory: `dist`.
5. Add Supabase environment variables if using shared reports, then deploy.

`vercel.json` is included.

## Deploy to GitHub Pages
This project uses relative asset paths (`base: './'`) so it can be deployed as a static site. Build locally using `npm run build`, then publish the **contents of `dist/`** to GitHub Pages. You can also use a GitHub Actions workflow to build on push. If publishing under a repository subpath, test the deployment URL after publishing.

For shared Supabase reports on GitHub Pages, configure GitHub Actions secrets/variables and make the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` available during the build. Environment variables are baked into the frontend bundle at build time.

## Folder structure
```text
green-india/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── .env.example
├── vercel.json
├── public/
│   └── 404.html
├── src/
│   ├── main.ts
│   ├── types.ts
│   ├── vite-env.d.ts
│   ├── styles.css
│   ├── data/
│   │   └── content.ts
│   ├── services/
│   │   ├── storage.ts
│   │   └── supabase.ts
│   └── ui/
│       ├── app.ts
│       └── icons.ts
└── supabase/
    └── setup.sql
```

## Future improvements worth adding
- Admin moderation dashboard and a remove/report-abuse flow.
- CAPTCHA and server-side rate limiting.
- Verified report statuses and an audit trail.
- Nearby issue map only after carefully considering location privacy.
- Official municipal contact directory by state/city.
- Daily eco-tip rotation and weekly habit history.
- A privacy policy, terms and accessible content review.

## Creator
**Web Created By Xtreme**


### Version 4 visual refresh
- Added a coordinated multi-colour palette using leaf green, teal, sky blue, sunshine yellow, and soft coral accents.
- Added subtle pastel gradients to tip cards, resource cards, community report placeholders, About section, and calls to action.
- Kept contrast, responsive layouts, and reduced-motion preferences in mind.
