# RileysCrush

«Turning impossibly large integers into art.»

RileysCrush is a small, polished web app built around **Tupper's Self-Referential
Formula** — a single mathematical inequality that can render _any_ 106×17 pixel
image, depending only on the value of one enormous integer. Paste a huge
integer to see the picture hidden inside it, draw your own picture to get the
integer that produces it, and (the actual point of this whole project) discover
a note hidden inside a specific number.

## Features

- **Viewer** — paste an arbitrarily large integer and render its Tupper bitmap:
  zoom, pan, fullscreen, grid overlay, adjustable pixel size, hover coordinates,
  PNG/SVG export, copy-to-clipboard, and decimal/hex/binary/bit-length/digit-count
  readouts with one-click copy.
- **Bitmap Studio** — draw a 106×17 bitmap by hand (pencil, eraser, fill,
  rectangle, line, undo/redo, invert, mirror) and watch the corresponding
  Tupper integer generate live, entirely client-side.
- **Hidden messages** — render an integer that matches an entry in
  `data/crushes.json` and a note fades in beneath the bitmap. No label, no
  "you found an easter egg" — it just appears, like it was always there.
- **Admin** (`/admin`) — no auth (personal-use only): create/edit/delete
  hidden messages, search by name or integer, preview the bitmap live while
  editing, import/export `crushes.json`.
- **Bonus niceties** — drag-and-drop `.txt` integer import, drag-and-drop
  image import into Bitmap Studio, shareable URLs (`?n=...`), recent-integer
  history (localStorage), light/dark theme toggle, a "load the canonical
  Tupper constant" demo button.

## How the math works

Tupper's formula:

```
1/2 < floor(mod(floor(y/17) · 2^(-17·floor(x) - mod(floor(y),17)), 2))
```

Plot every `(x, y)` where this holds, for `0 ≤ x < 106` and `k ≤ y ≤ k+16`, and
you get a bitmap. The trick: `floor(y/17)` is _constant_ across all 17 rows of
that band whenever `k` is a multiple of 17 — call that constant `q`. Then the
formula reduces to "pixel `(x, row)` is on iff bit `17x + row` of `q` is 1".
That means the picture is encoded directly in the bits of `q`, and `k = 17q`.

`shared/tupper.ts` implements exactly this, both directions:

- `integerToGrid(n)` — extracts the 106×17 bitmap encoded in `n`, using the
  literal formula (so it's correct even for integers that _aren't_ multiples
  of 17, not just the "clean" case).
- `gridToInteger(grid)` — the inverse: given a bitmap, produces the integer
  that encodes it.

Everything uses `BigInt`, with no approximation or truncation — the app is
tested against integers with tens of thousands of digits. A dedicated
optimization avoids ever materializing a huge `BigInt` shift: since a render
only ever needs at most two possible values of `floor(y/17)` (the band only
spans 17 consecutive `y`), those two values are masked down to their low 1802
bits once, and every per-pixel bit extraction after that operates on a small
number.

The app also ships the canonical 543-digit constant popularized by Tupper
himself (`CANONICAL_TUPPER_CONSTANT` in `shared/tupper.ts`) — try the "Load
canonical Tupper constant" button on the homepage.

## Tech stack

- **Client**: React + TypeScript + Vite + Tailwind CSS
- **Server**: Node.js + Express + TypeScript (run directly via `tsx`, no
  separate compile step)
- **Shared**: a plain TypeScript module (`/shared`) with no Node- or
  browser-specific APIs, imported directly by both sides
- **Persistence**: flat JSON files in `/data` (no database) — `crushes.json`
  and `config.json`, written atomically (write-to-temp-then-rename) so a
  crash mid-write can never corrupt them

## Project structure

```
client/     React app (Vite + Tailwind)
  src/
    components/   bitmap/, studio/, home/, admin/, layout/, common/
    hooks/        useRender, useBitmapStudio, useTheme, ...
    lib/          api client, clipboard, export, share links, history, ...
    pages/        HomePage, StudioPage, AdminPage
server/     Express API
  src/
    routes/       render.ts, check.ts, crushes.ts, config.ts
    storage/      atomic JSON persistence (crushesStore, configStore, jsonStore)
    app.ts        Express app factory (shared by the standalone server and
                   the Vercel serverless wrapper in /api)
shared/     Tupper math + shared TypeScript types (no framework dependencies)
data/       crushes.json, config.json (created automatically if missing)
api/        Vercel serverless entry point (re-exports the Express app)
```

## Getting started

Requires Node 18+.

```bash
npm install
npm run dev
```

This starts the API on `http://localhost:4000` and the Vite dev server (with
hot reload) on `http://localhost:5173`, proxying `/api` to the backend.

Other scripts:

```bash
npm run build       # type-checks the server and builds the client to client/dist
npm run start        # runs the production server (serves the built client + API on one port)
npm run lint          # ESLint across the whole repo
npm run format        # Prettier --write across the whole repo
npm run typecheck     # tsc --noEmit for both client and server
```

`data/crushes.json` and `data/config.json` are created automatically on first
run if they don't already exist.

## Personalizing it (Riley's actual use case)

1. Go to **Bitmap Studio**, draw whatever you want (a heart, initials,
   whatever) — the integer generates live in the panel on the right.
2. Copy that integer.
3. Go to **/admin** → **+ New crush**, paste the integer, write your message
   (Markdown, links, and emoji are all supported), save.
4. Send your crush the decimal integer (a text file, a DM, whatever). When
   she pastes it into the homepage and hits Generate, your bitmap renders —
   and your message fades in underneath it, unlabeled.

A starter example is already seeded in `data/crushes.json` (id `2`,
`"Riley's Confession (edit me)"`) — edit or delete it via `/admin`.

## REST API

| Method | Path                  | Body                                             | Notes                                                                      |
| ------ | --------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| POST   | `/api/render`         | `{ integer: string }`                            | Bitmap + decimal/hex/binary/bit-length/digit-count + hidden-message lookup |
| POST   | `/api/check`          | `{ integer: string }`                            | `{ found, message? }` only                                                 |
| GET    | `/api/crushes`        | —                                                | All stored entries                                                         |
| POST   | `/api/crushes`        | `{ name, integer, message, created? }`           | Create                                                                     |
| PUT    | `/api/crushes/:id`    | Partial of the above                             | Update                                                                     |
| DELETE | `/api/crushes/:id`    | —                                                | Delete                                                                     |
| POST   | `/api/crushes/import` | `{ entries: [...], mode: 'merge' \| 'replace' }` | Bulk import                                                                |
| GET    | `/api/config`         | —                                                | Site config (name/tagline/theme)                                           |

Integer matching for hidden messages is exact string equality after trimming
surrounding whitespace — no numeric coercion, so it works for integers far
larger than `Number.MAX_SAFE_INTEGER`.

## Docker

```bash
docker compose up --build
```

Serves the whole app (API + built client) on `http://localhost:4000`.
`./data` is bind-mounted into the container so `crushes.json`/`config.json`
persist across rebuilds.

## Deploying to Vercel

```bash
vercel
```

`vercel.json` builds the client as static output and routes `/api/*` to the
Express app via `api/index.ts` (a thin wrapper that re-exports the same app
used by the standalone server).

**Root Directory must be the repo root.** In the Vercel project's
**Settings → General → Root Directory**, leave it blank (or `./`) — do not
point it at `client/`. Vercel's import flow sometimes auto-guesses `client`
as the root because that's where it finds `vite.config.ts`, but this repo's
`api/`, `shared/`, and `server/` all need to be visible alongside `client/`
for the build and the serverless function to resolve.

The install/build commands (`npm install --prefix client` /
`npm run build --prefix client`) are deliberately workspace-free — `client`
builds standalone off its own `package.json`, so the build can't fail with
`npm error No workspaces found`. If you still see that exact error after
pulling this fix, it means **Settings → Build and Development Settings**
has a manually-entered Install/Build Command (or Root Directory) saved in
the dashboard — those override `vercel.json` and won't update just because
the file changed. Clear the override there (toggle it back to "inherited
from vercel.json") and redeploy.

**Important caveat**: Vercel's serverless functions have a read-only
filesystem (aside from `/tmp`) and are ephemeral across invocations. That
means writes made through the deployed `/admin` UI (creating/editing crush
entries) will **not persist** — each cold start re-reads whatever is in the
deployed `data/crushes.json` at build time. For a fully read-write deployment
where `/admin` edits stick, run the server (see `server/`) on a persistent
host instead — a small VPS, Render, Fly.io, or the provided Docker image all
work. Vercel is a great fit if you only need the _reading_ experience (viewer

- hidden messages) to be live, and you're happy editing `data/crushes.json`
  locally and redeploying.

## Error handling

Invalid integers, empty input, and rendering failures all surface as friendly
inline messages — the app never crashes on bad input. If `crushes.json` or
`config.json` are missing or corrupted, the server recreates them with sane
defaults instead of failing to start.
