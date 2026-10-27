# Just For You Foundation — Website

**Live site: https://javda4.github.io/JustForYouFoundation/**

The website for the Just For You Foundation, a 501(c)(3) that stands beside
children battling cancer and the families who love them, with comfort,
financial relief and a community that shows up when it matters most.

A single-page static site: plain HTML, CSS and JavaScript with no build step.
Three.js (r128, from cdnjs) powers the hero gallery and scroll transition.
Supabase stores contact-form messages and the partner list.

## Run it locally

```bash
npm install
npm run dev
```

Then open **http://localhost:3004**.

## Features

- **Three.js hero gallery:** sixteen curved photo panels orbit the headline,
  passing behind and in front of the text. Falls back to a plain gradient
  without WebGL.
- **"Hands Reaching" scroll transition** (`transitions/hands-reaching.js`).
- **Photo cards** for Who We Are, Impact and Get Involved (`assets/cards/`).
- **Contact form → Supabase + email.** Messages are validated and stored in a
  private database table that visitors can't read, and are emailed to
  info@justforyoufoundation.org (via Resend).
- **Dynamic partners section.** Partner cards (logo, name, link) load from the
  Supabase `partners` table, so adding a partner needs no code change.

## Project layout

| Path | What |
| --- | --- |
| `index.html`, `styles.css`, `script.js` | The page |
| `assets/gallery/` | Hero gallery script and images |
| `transitions/` | Scroll transition |
| `assets/cards/`, `assets/people/` | Card and portrait photos |
| `assets/legal/` | Image licenses and evidence |
| `supabase/migrations/` | Database schema, security rules, email trigger |
| `scripts/add-partner.mjs` | Adds a partner (uploads logo, inserts row) |
| `deploy.sh` | Publishes the site to GitHub Pages |

## Adding a partner

```bash
node scripts/add-partner.mjs "Partner Name" path/to/logo.png https://partner-site.com [sort_order]
```

This uploads the logo to the private `partner-logos` storage bucket, creates a
10-year signed URL and adds the row. The card appears on the live site
immediately. To hide a partner, set `is_active` to `false` in the table.

## Configuration

Copy `.env.example` to `.env` and fill in the Supabase and Resend values.
`.env` is gitignored and never deployed. Only the public Supabase anon key is
used by the page; the service-role key and database URL are for local scripts
only.

## Security

- Contact messages live in a `private` schema that isn't exposed by the API.
  Visitors can only submit, through a validated database function, and can never
  read, edit or delete messages.
- Server-side validation, markup rejection, rate limiting and bot traps.
- A Content-Security-Policy restricts the page to its own scripts, Three.js
  and the Supabase project.

## Deploying

```bash
bash deploy.sh "Short description of the change"
```

This publishes to the `JustForYouFoundation/` folder of the
`javda4/javda4.github.io` repo, which GitHub Pages serves at the live URL above.

## Image rights

Every externally sourced image is documented in `assets/legal/README.md`, with
credits in the site footer.
