# vertical-explainer

Public repo for rendering 1080×1920 TikTok-style explainer videos using Remotion + ffmpeg on GitHub Actions.

- First pilot: `content/001-silence/` (script: "Pourquoi le silence fait plus peur que le bruit", 121 words, ~40s)
- Design: black & white with `#FF4D2E` accent, Inter font, captions with spring animation, typographic B-roll fallback
- Stack: Remotion 4.0.539, @elevenlabs/cli, zod, Node 24, ffmpeg 6.1.1
- Local preview: `make preview` (540×960, no audio) / `make video` (1080×1920, with audio mix)
- Full pipeline: `node scripts/pipeline.mjs --id 001-silence --scale 0.5`
- Blocked for full production: `PEXELS_API_KEY` (B-roll), `ELEVENLABS_API_KEY` for preferred voice `SomyDQQmnE7TsltdiDgp`, GitHub `gh` auth / PAT
