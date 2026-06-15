import type { ActionFunctionArgs } from "react-router";
import { ClipService } from "~/services/clip/clip.service";

/**
 * POST /clips/:id/process  (React Router resource route)
 *
 * Runs the upscale & enhance step for a single clip and returns the
 * editor-ready deliverable record.
 */
export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ success: false, message: "Method not allowed" }, { status: 405 });
  }

  const id = params.id;
  if (!id) {
    return Response.json({ success: false, message: "Missing clip id." }, { status: 400 });
  }

  try {
    const clip = await ClipService.enhanceClip(id);
    return Response.json({ success: true, data: clip });
  } catch (err: any) {
    return Response.json(
      { success: false, message: err?.message || "Enhancement failed." },
      { status: 500 },
    );
  }
}
