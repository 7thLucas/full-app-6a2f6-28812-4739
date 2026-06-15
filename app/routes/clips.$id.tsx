import type { LoaderFunctionArgs } from "react-router";
import { ClipService } from "~/services/clip/clip.service";

/**
 * GET /clips/:id  (React Router resource route)
 *
 * Returns the current pipeline record for a clip (status + deliverable).
 */
export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id;
  if (!id) {
    return Response.json({ success: false, message: "Missing clip id." }, { status: 400 });
  }

  const clip = await ClipService.getById(id);
  if (!clip) {
    return Response.json({ success: false, message: "Clip not found." }, { status: 404 });
  }

  return Response.json({ success: true, data: clip });
}
