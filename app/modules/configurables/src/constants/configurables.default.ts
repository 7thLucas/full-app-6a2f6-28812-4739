/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TPipelineStep = {
  title: string;
  description: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  tagline?: string;
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSubcopy?: string;
  uploadCtaLabel?: string;
  enhanceCtaLabel?: string;
  downloadCtaLabel?: string;
  upscaleFactor?: number;
  targetGrade?: string;
  footerNote?: string;
  steps?: TPipelineStep[];
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "ReelDesa",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#E0A95C",
    secondary: "#3E6B4F",
    accent: "#F2C57C",
  },
  tagline: "Raw village footage, cinematic quality.",
  heroEyebrow: "Footage intake & AI upscaling",
  heroHeadline: "From rough clip to cinematic grade.",
  heroSubcopy:
    "Drop a single rough village clip. ReelDesa upscales and enhances it to an editor-ready, timeline-ready cut — keeping the organic feel, meeting the cinematic bar.",
  uploadCtaLabel: "Choose a clip",
  enhanceCtaLabel: "Upscale to cinematic",
  downloadCtaLabel: "Download editor-ready clip",
  upscaleFactor: 4,
  targetGrade: "Cinematic 4K",
  footerNote: "ReelDesa — authenticity at cinematic quality.",
  steps: [
    {
      title: "Intake",
      description: "Drop one rough, low-res clip. We read its source resolution, size, and length.",
    },
    {
      title: "Upscale & enhance",
      description: "Resolution is scaled up and the frame is sharpened and denoised toward a cinematic standard.",
    },
    {
      title: "Deliver",
      description: "Preview the result, see the resolution gained, and download it straight into your timeline.",
    },
  ],
};
