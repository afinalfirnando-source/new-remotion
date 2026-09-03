# Remotion Laser Show

4K @ 60fps seamless loop multicolor laser light rays — built with [Remotion](https://www.remotion.dev/).

## Preview

[![Render](https://github.com/OWNER/REPO/actions/workflows/render.yml/badge.svg)](../../actions/workflows/render.yml)

Download video dari tab **Actions** → pilih run terakhir → artifact `laser-show-4k` atau `laser-show-1080`.

## Komposisi

| ID | Resolusi | FPS | Durasi | Loop |
|---|---|---|---|---|
| `LaserShow` | 3840×2160 (4K UHD) | 60 | 15 dtk | seamless |
| `LaserShow-1080` | 1920×1080 | 60 | 15 dtk | seamless |

## Lokal

```bash
npm install
npm start              # Studio
npm run build:1080     # render 1080p
npm run build:4k       # render 4K
```

## Konsep Visual

- **42 volumetric rays × 3 layers** dengan multi-blur & drop-shadow
- **Core prism**: conic gradient berputar + dual halo
- **180 partikel orbit** elips dengan twinkle
- **Star layers** BG + FG dengan twinkle
- **Anamorphic lens flare** dengan streak
- **Post-processing**: chromatic aberration, vignette, film grain

Semua animasi periodik dengan `t = frame / totalFrames` — frame terakhir = frame pertama, dijamin seamless.
