import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

/**
 * Clip — a single piece of footage moving through the ReelDesa pipeline.
 *
 * Lifecycle (single-user MVP, one clip at a time):
 *   uploaded  -> the rough source is stored in the uploader service
 *   enhancing -> the upscale/enhance job is running
 *   enhanced  -> a cinematic-grade, editor-ready deliverable is available
 *   failed    -> something went wrong during processing
 */
export type ClipStatus = "uploaded" | "enhancing" | "enhanced" | "failed";

@modelOptions({
  schemaOptions: {
    collection: "tbl_clips",
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Clip extends CommonTypegooseEntity {
  // ── Source (intake) ──────────────────────────────────────────────────
  @prop({ type: String, required: true })
  originalName!: string;

  @prop({ type: String, required: true })
  mimeType!: string;

  @prop({ type: Number, required: true })
  sourceSize!: number; // bytes

  @prop({ type: Number, default: 0 })
  sourceWidth!: number; // px (read client-side)

  @prop({ type: Number, default: 0 })
  sourceHeight!: number; // px

  @prop({ type: Number, default: 0 })
  durationSeconds!: number;

  /** Stored file id at the uploader service. */
  @prop({ type: String, required: true })
  sourcePath!: string;

  /** Proxy URL that serves the stored source through this app. */
  @prop({ type: String, required: true })
  sourceUrl!: string;

  // ── Pipeline ─────────────────────────────────────────────────────────
  @prop({ type: String, default: "uploaded" })
  status!: ClipStatus;

  @prop({ type: Number, default: 4 })
  upscaleFactor!: number;

  @prop({ type: String })
  targetGrade?: string;

  // ── Deliverable (after enhance) ──────────────────────────────────────
  @prop({ type: Number, default: 0 })
  targetWidth!: number;

  @prop({ type: Number, default: 0 })
  targetHeight!: number;

  /** Filename suggested for the editor's timeline. */
  @prop({ type: String })
  deliverableName?: string;

  /** URL the editor downloads the editor-ready clip from. */
  @prop({ type: String })
  deliverableUrl?: string;

  @prop({ type: String })
  enhancementNote?: string;

  @prop({ type: String })
  error?: string;
}

export const ClipModel = getModelForClass(Clip);
