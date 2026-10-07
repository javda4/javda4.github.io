# Just For You Foundation — Website (threeweb_4)

A fork of `threeweb_3`. New here: every card in **Who We Are** (Comfort,
Financial Relief, Community), **Impact** (Diagnosed Each Year, Lives Lost,
Long-Term Impact) and **Get Involved** (Donate, Partner With Us, Volunteer,
Stay Connected) now has a full-bleed photo background (`assets/cards/`,
styled by the `.card-photo` block at the end of `styles.css`) under a navy
scrim with white/cream/gold type. Seven photos come from the previously
unused files in `assets/gallery/Cancer/`; three are free-to-use images found
online (Financial Relief and Long-Term Impact: Pexels License; Lives Lost:
CC0, Wikimedia Commons), with their
rights documented in `assets/legal/`.

The hero gallery also gained `assets/gallery/gallery-6.webp` (from
`Cancer/bg1.jpeg`), pinned to panel 9 only (the second of the three panels
that showed the two-girls photo) via `PANEL_IMAGE_OVERRIDES` in
`assets/gallery/gallery.js`; the other 15 panels keep the original
five-photo cycle.

---

_Original threeweb_3 notes:_

A fork of `threeweb_2` — same single-page, static site (plain HTML/CSS/JS, no
build step) and the same Three.js hero gallery / scroll transition — but with
copy pulled from the real, live site at [justforyoufoundation.org](http://www.justforyoufoundation.org/),
its About Us, Donation, and Contact pages: the real mission statement, Jason's
founder message, the Mama Luca origin story (new "Our Dream" section), the
sourced childhood-cancer statistics (IARC / WHO), and the real address, phone,
and email in the footer and new Contact section.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```bash
npm run dev
```

Serves on **http://localhost:3004** (see `package.json`).

## Hero gallery

The hero section's background (`#heroGallery`, full-bleed behind the hero
copy) is a live Three.js scene: five photos billboard toward the camera and
slowly orbit (no vertical bob) around the fixed, centered headline/CTA/stats
block (`assets/gallery/gallery.js` + `gallery-1.webp`–`gallery-5.webp`). It's
adapted from `@designcodeio/threeui`'s `Gallery` component into a plain
script (no React or bundler required) so it fits this project's no-build
setup, with a radial scrim (`.hero-scrim`) keeping the text readable as
photos pass behind it. If WebGL is unavailable, the hero falls back to its
plain gradient background.

## What's real vs. still placeholder

- **Real**: hero mission statement, hero/impact statistics (sourced,
  IARC/WHO), Jason's founder message, the Mama Luca "Our Dream" story,
  footer + Contact section address/phone/email, 501(c)(3) status line.
- **Still placeholder**: all photography (search `visual-caption` in
  `index.html`), the "Partners" logo grid (the live site has no partners
  section), and the Donate/Contact/Newsletter forms — all UI-only, not
  wired to a payment processor or email provider yet.
