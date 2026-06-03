import type { APIRoute } from "astro";
import { getAdminToken, updateSubmissionStatus } from "../../../lib/data";
import { getEnv, isAuthorized, json } from "../../../lib/runtime";
import { z } from "zod";

const reviewInputSchema = z.object({
  id: z.string().min(3),
  moderationStatus: z.enum(["triaged", "approved", "rejected"]),
  reviewerNote: z.string().max(1000).optional()
});

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals);
  if (!isAuthorized(request, getAdminToken(env))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = reviewInputSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: "Invalid review payload.", details: parsed.error.flatten() }, { status: 400 });
  }

  await updateSubmissionStatus(env, parsed.data.id, parsed.data.moderationStatus, parsed.data.reviewerNote);
  return json({ ok: true });
};
