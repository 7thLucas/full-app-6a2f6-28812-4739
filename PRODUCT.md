## ReelDesa — Product Spec

**Name:** ReelDesa — "reel" (film) + *desa* (Indonesian for village).

**What it is:** A footage intake + AI upscaling pipeline that turns low-quality, heavily-compressed villager clips into sharp, cinematic-grade, editor-ready footage.

### The single user
A solo freelance video editor who makes cinematic tourism films promoting small Indonesian villages. The editor is the ONLY user. No villager accounts, no multi-contributor uploads, no auth complexity — single-user MVP.

### The ONE day-one flow (do this brilliantly, nothing more)
Upload a single rough, low-quality clip → app upscales/enhances it to cinematic grade → editor downloads the timeline-ready result.

Three stages, surfaced clearly in the UI:
1. **Intake** — drag-and-drop / pick one rough clip. Show source resolution, size, duration.
2. **Upscale & enhance** — processing state with progress; AI upscale of resolution + sharpen/denoise toward a cinematic standard.
3. **Deliver** — preview the result, see before/after stats (resolution gained), download the editor-ready file straight to the timeline.

### Explicitly OUT of scope (keep it lean — do NOT build)
- Batch / multi-clip uploads
- Presets
- Color matching
- Multi-user / villager-direct uploads / accounts / auth

### Tone & voice
Cinematic, organic, warm, grounded in Indonesian village storytelling. Calm, premium, creator-facing. Speaks to a craftsperson editor, not a SaaS buyer. Copy is confident and minimal: "Raw village footage, cinematic quality." Honor the authenticity-at-cinematic-quality positioning.

### Value
The edge is authenticity at cinematic quality. The unlock is scale: removing the upscaling bottleneck lets the editor serve more villages without compromising quality.