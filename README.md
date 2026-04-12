# 🎞 FilmSort

**AI-powered movie & series organiser for your local video files.**

FilmSort identifies, enriches, and organises your video files automatically — no matter how messy the filenames are.

---

## Features

- **Advanced Filename Parser** — Strips 60+ noise patterns: codecs, watermarks, fansub tags, CRC checksums, streaming service labels, language/sub flags
- **Smart Type Detection** — Movies, TV shows (S01E05, 1×05, Season X Ep Y), Anime (dash-episode, long episode numbers), OVAs & Specials, multi-episode files, Part 1/Part 2
- **20-Minute Filter** — Files shorter than 20 minutes (trailers, clips, samples) are automatically rejected during scanning
- **TMDB Enrichment** — Posters, backdrops, overviews, ratings, genres, runtime (add your free API key)
- **Netflix-Style UI** — Hero section, horizontal carousels, continue watching, recently added
- **Series Folder View** — TV shows grouped by series + season, episode list modal sorted in order
- **Watch Tracking** — Unwatched / In Progress / Watched status + personal star ratings
- **Smart Folder Paths** — Shows you exactly where to move each file
- **Persistent Library** — Saved to localStorage, survives page refresh

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Then open `http://localhost:5173`

---

## Add TMDB API Key (for posters & metadata)

1. Create a free account at https://www.themoviedb.org/
2. Go to Settings → API → Request an API key
3. Open `src/utils/tmdb.js`
4. Replace `''` on line 2 with your key:

```js
export const TMDB_KEY = 'your_key_here';
```

---

## Supported File Formats

MP4 · MKV · AVI · MOV · WMV · WebM · M4V · TS · M2TS

---

## Filename Examples FilmSort Can Handle

| Filename | Parsed As |
|---|---|
| `The.Dark.Knight.2008.1080p.BluRay.x264.mp4` | Movie: The Dark Knight (2008) |
| `Breaking.Bad.S03E07.WEBRip.AAC.mkv` | TV: Breaking Bad S03E07 |
| `[HorribleSubs] Demon Slayer - 26 [1080p].mkv` | Anime: Demon Slayer Ep 26 |
| `One.Piece.1050.HDTV.mp4` | Anime: One Piece Ep 1050 |
| `Avengers.Endgame.2019.IMAX.HDR.2160p.mkv` | Movie: Avengers Endgame (2019) |
| `Game.of.Thrones.S08E03E04.mkv` | TV: GoT S08E03–E04 (multi-ep) |
| `(nkiri.com)Money.Heist.S01E01.mp4` | TV: Money Heist S01E01 (watermark stripped) |
| `Vinland.Saga.S2.-.24.mkv` | Anime: Vinland Saga S02E24 |
| `Attack.on.Titan.OVA.2.mkv` | Anime: Attack on Titan – OVA 02 |

---

## Tech Stack

- React 18 + Vite
- React Router v6
- localStorage persistence
- TMDB API (optional)
- Claude API (Anthropic) for AI enrichment
- Zero external UI libraries

---

## Project Structure

```
src/
  components/
    Navbar.jsx        — sticky transparent navbar
    Hero.jsx          — full-bleed hero section
    Cards.jsx         — PosterCard, WideCard, SeriesCard, Carousel
    DetailModal.jsx   — full detail + edit modal
    EpisodeModal.jsx  — series episode list
    Onboarding.jsx    — first-run drop zone
    QueuePanel.jsx    — floating processing queue
  hooks/
    useLibrary.js     — all state, processing pipeline
  pages/
    Home.jsx          — Netflix-style home with carousels
    Library.jsx       — grid library with filters
  utils/
    parser.js         — advanced filename parser
    tmdb.js           — TMDB API helpers
```
