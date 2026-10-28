# Just For You Foundation — Website

**Live site: https://javda4.github.io/JustForYouFoundation/**

The website for the Just For You Foundation, a 501(c)(3) that stands beside
children battling cancer and the families who love them, with comfort,
financial relief and a community that shows up when it matters most.

A single-page static site: plain HTML, CSS and JavaScript with no build step.
Three.js (r128, from cdnjs) powers the "Hands Reaching" scroll transition.
Supabase stores contact-form messages and the partner list.

## Run it locally

```bash
npm install
npm run dev
```

Then open **http://localhost:3004**.

## Features

- **"Golden Hour" hero:** the kids' photos crossfade on the right with a slow
  zoom and pan (Ken Burns), golden fireflies drift up through the scene, and
  the headline sits on the left. Pauses off screen; a still photo with no
  fireflies for visitors who prefer reduced motion
  (`assets/hero/golden-hour.js` + `.css`).
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
| `404.html` | Self-contained "Page Not Found" page, served at the Pages root |
| `assets/hero/` | "Golden Hour" hero (slideshow + fireflies) |
| `assets/gallery/` | Hero photos (`gallery-*.webp`); `gallery.js` is the retired spinning-ring gallery, kept but not loaded |
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

## Deploying with `deploy.sh`

The live site is published only through `deploy.sh`. Run it from this folder
after every change to the site:

```bash
bash deploy.sh "Short description of the change"
```

The message is required and becomes the commit message on the Pages repo.

**Requirements:** `git`, plus push access to `javda4/javda4.github.io` (for
example, signed in with `gh auth login`).

**What it does:**

1. Clones `javda4/javda4.github.io` into a temporary folder.
2. Removes everything in it except `.github/`, which holds the GitHub Pages
   workflow.
3. Writes a root `index.html` that redirects `https://javda4.github.io/` to
   `/JustForYouFoundation/`, and copies `404.html` to the repo root. GitHub
   Pages shows it for any missing URL.
4. Copies the site files into `JustForYouFoundation/`:
   - `index.html`, `styles.css`, `script.js`, `README.md`
   - `transitions/*.js`
   - `assets/hero/*.css` and `assets/hero/*.js`
   - `assets/gallery/gallery-*.webp`
   - `assets/cards/*.jpg`, `assets/people/*`, `assets/legal/*`
5. Commits and pushes to `main`. If nothing changed, it stops without
   committing.
6. GitHub Actions redeploys the site, usually within a minute. The temporary
   folder is deleted automatically.

**Never published:** `.env`, `supabase/`, `scripts/`, `node_modules/`,
`assets/gallery/Cancer/` and the full-resolution stock originals in
`assets/gallery/`. Stock licenses forbid redistributing the source files, and
only the resized copies are used.

**Adding new files:** the script copies an explicit list. If the page starts
referencing a new file or folder, add it to the `cp` lines in `deploy.sh`, or it
will be missing from the live site.

**Checking a deploy:**

```bash
gh run list -R javda4/javda4.github.io -L 1
```

Then open the live URL above and confirm the change. Partner changes made in
Supabase don't need a deploy, because the page loads them on every visit.

**Don't** `git push` this folder to the Pages repo directly. It would replace
the `JustForYouFoundation/` layout and break the live site. Source code goes to
this repo's own `origin`, and the live site goes through `deploy.sh`.

## Image rights

Every externally sourced image is documented in `assets/legal/README.md`, with
credits in the site footer.
