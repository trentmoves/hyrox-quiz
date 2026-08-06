# Hyrox Human — Logo Files

Four marks pulled from Brand Board v1, exported as production files. All type is converted to outlines, so nothing depends on Archivo being installed on the machine opening the file.

## What's in here

`svg/` — 20 vector files. Four marks, five colorways each. Use these anywhere you can.

`svg-editable/` — three files with live `<text>` instead of outlines, in case you want to change the wording (swap "Boulder · Colorado" on the badge for "Denver 2026", change letter-spacing, etc). These need Archivo 400/600/800/900 and Space Mono installed or web-loaded. Re-outline before sending to a printer.

`png/` — transparent-background rasters. Wordmarks at 2000–2400px wide, marks at 1200–1600px.

`app-icons/` — 16 through 1024 square, carbon background, plus `favicon.ico` (16/32/48/64 bundled) and `icon-512-maskable.png` with the Android safe-zone padding.

`social/` — 1080 Instagram avatar (carbon and ignite versions), 1200×630 OG image, 1500×500 X header.

`CONTACT-SHEET.png` — everything on light and dark, for a quick visual check.

## The colorways

- `ondark` — bone type, ignite pulse. For carbon or any dark background.
- `onlight` — carbon type, ignite pulse. For bone, white, or light photography.
- `mono-carbon` / `mono-bone` / `mono-ignite` — single color, no exceptions. These are the ones you hand to an embroiderer, a screen printer running one screen, or an engraver. Send the mono files, not a flattened two-color file, or you'll get charged for a second screen you didn't want.

## Which mark, where

The Lockup (03) goes in website headers, email signatures, and anywhere the space is wider than it is tall. It's the workhorse.

The Stack (01) is the hero mark. Hoodie backs, landing page above the fold, race-day banner.

The Pulse Mark (02) is the app icon, favicon, and IG avatar. It's the shape people will actually recognize at thumbnail size, so don't dilute it by using the full wordmark as an avatar.

The Badge (04) is for merch, stickers, and stamps. Swap the bottom line per race or cohort using the editable file.

## Rules that keep it from falling apart

Clear space is already baked into every viewBox: the padding around each mark equals about 6% of its longest side. Don't crop into it, and don't let other elements sit inside it.

Minimum sizes. The Lockup stops being legible below about 120px wide on screen or 1.25in in print. The Badge bottom line (Space Mono at 10pt in the original artboard) goes to mush below 1in, so use the Pulse Mark instead of shrinking the badge.

Never put the ignite pulse on a background that isn't carbon, bone, or white. On mid-tone photography it vibrates. Use `mono-bone` over images instead, with a dark scrim behind it.

Don't recolor the pulse. The heartbeat is the one consistent element across all four marks, and it's ignite or it's monochrome.

Don't stretch, add a drop shadow, outline it, or rebuild the lockup by placing the mark next to typed-out text. The 100px divider and the spacing in `03-lockup` are fixed.

## Next.js

Favicons — drop `favicon.ico`, `icon-192.png`, `icon-512.png`, and `icon-180.png` into `/app` renamed as `favicon.ico`, `icon.png`, and `apple-icon.png`, and the App Router wires them up automatically. For the manifest:

```json
{
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "theme_color": "#14171A",
  "background_color": "#14171A"
}
```

Inline SVG beats `<Image>` for the header lockup: it stays crisp, costs no extra request, and lets you drive the fills off CSS variables if you ever want a light-mode header. Paste the contents of `svg/03-lockup-ondark.svg` into a component and swap `#F6F1E9` for `currentColor`.

OG image — `social/og-image-1200x630.png` works as a static fallback in metadata. If you'd rather generate per-page cards for the race-time predictor results (projected time on the card), that's `next/og` with `ImageResponse`, and the mono SVG drops straight into it.

## Colors

```
Ignite  #FF4127    Carbon  #14171A    Bone  #F6F1E9
Steel   #5B6670    Frost   #38C0E0
```

Frost stays on data. It never appears in a logo file.

## Fonts

Archivo (400/600/800/900) and Space Mono, both on Google Fonts, both free for commercial use under the OFL. In Next.js, use `next/font/google` so they self-host and don't shift layout on load.
