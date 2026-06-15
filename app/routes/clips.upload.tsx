import type { ActionFunctionArgs } from "react-router";
import { ClipService } from "~/services/clip/clip.service";

/**
 * POST /clips/upload  (React Router resource route)
 *
 * Multipart intake of a single rough clip. Handled by React Router's native
 * request.formData() — outside the Express /api JSON body parser — so video bytes
 * stream through cleanly.
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ success: false, message: "Method not allowed" }, { status: 405 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json({ success: false, message: "No clip provided." }, { status: 400 });
    }

    if (!file.type.startsWith("video/")) {
      return Response.json(
        { success: false, message: "Please upload a video clip." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const width = Number(form.get("width")) || 0;
    const height = Number(form.get("height")) || 0;
    const durationSeconds = Number(form.get("duration")) || 0;
    const upscaleFactor = Number(form.get("upscaleFactor")) || 4;
    const targetGrade = String(form.get("targetGrade") || "Cinematic 4K");

    const clip = await ClipService.intake(
      {
        buffer,
        mimetype: file.type,
        originalname: file.name,
        size: file.size,
      },
      {
        originalName: file.name,
        mimeType: file.type,
        width,
        height,
        durationSeconds,
      },
      upscaleFactor,
      targetGrade,
    );

    return Response.json({ success: true, data: clip }, { status: 201 });
  } catch (err: any) {
    return Response.json(
      { success: false, message: err?.message || "Upload failed." },
      { status: 500 },
    );
  }
}

// Resource route: no default component.
