# Product Overview

**Name: ReelDesa** — "reel" (film) + *desa* (Indonesian for "village").

## What it is
A footage intake + AI upscaling pipeline that turns low-quality clips shot by local
villagers into sharp, cinematic-grade, editor-ready footage — so authentic material can
sit alongside professionally shot scenes without dragging down the final film.

## Who it's for
- **The user — the editor (single user, MVP):** a freelance video editor who turns everyday
  content into cinematic films, specializing in promoting small Indonesian villages to
  tourists. The editor is the *only* person who uses the app.
- **Footage source — local villagers (not app users):** residents shoot authentic daily clips
  on phones and basic cameras. That footage is the editor's differentiator, but villagers do
  **not** upload into the app themselves — the editor collects and uploads it. Villager-direct
  uploads are intentionally out of MVP scope to keep the solution simple.
- **Downstream beneficiaries:** the villages (tourism promotion) and prospective tourists
  who watch the finished films.

## The problem
Authentic villager footage is the editor's real differentiator — it makes a tourism film
feel alive and organic instead of like stock. But that footage usually arrives low-res and
heavily compressed (old phones, messaging-app re-encodes). Manually upscaling and cleaning
each clip is slow, and it's the bottleneck that caps how many villages the editor can take on.

## The core workflow
1. **Intake** — the editor uploads rough clips into the app (including villager-shot footage).
2. **Upscale & enhance** — the app upscales resolution and improves sharpness/denoise to a
   cinematic standard via an AI upscaling model/service.
3. **Deliver** — the editor downloads editor-ready footage and drops it straight into the timeline.

The **verified operation** this app exists to perform: a rough clip taken from raw to
delivered, editor-ready footage (a "clip upscaled & delivered").

## Positioning & value
- The edge is **authenticity at cinematic quality**: keep the organic, on-the-ground feel
  while meeting the visual bar of a professional film.
- The unlock is **scale**: removing the upscaling bottleneck lets the editor serve more
  villages without compromising quality.

## Brand & tone
Cinematic, organic, warm, grounded in Indonesian village storytelling. Calm, premium,
creator-facing. Visual palette leans into film-grade warmth (golden accent) and lush
natural greens.

## Scope & status
- Scoping complete. **Name: ReelDesa (confirmed).**
- **Initial build: COMPLETE.** The MVP app is live and previewable.
- **MVP = the upscale pipeline**: intake → AI upscale/enhance → download editor-ready clip.
- **Day-one feature (confirmed & shipped):** upload a *single* rough clip → upscale/enhance to
  cinematic grade → download the timeline-ready result. Done brilliantly, nothing more.
  Batching, presets, and color matching are explicitly deferred.
- **Single user (the editor) only.** Villager-direct uploads / multi-contributor accounts are
  out of MVP scope — a possible later phase, not now.

## What shipped (initial build)
- A single-user, one-clip flow with a three-stage stepper: **Intake → Upscale & enhance →
  Deliver**, warm cinematic UI (dark golden-graded stage).
- Native source preview with resolution/duration/size stats; golden progress bar during
  processing; before/after panel showing resolution gained on the reveal.
- Real upload→process→download: source bytes are genuinely stored and streamed back via the
  uploader service; a `Clip` model + `ClipService` persist each job.

## Roadmap (staged next features)
1. **Plug in the production-grade upscaling engine** (top priority — see limitation below).
2. **Batch upscaling** — queue and process several clips from a shoot at once.
3. **One-tap cinematic looks** — named grades/presets applied during enhancement.

## Open questions (to confirm during scoping)
- Volume facts: clips per week, number of villages served, typical clip length/resolution.
- Pricing model and the editor's current hourly value (for ROI).

## Dependencies & uncertainty
- AI video upscaling will likely rely on a third-party upscaling model/API; quality and
  feasibility to be validated by the Engineer.
