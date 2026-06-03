import type { APIRoute } from "astro";
import { insertSubmission } from "../../lib/data";
import { publicSubmissionInputSchema } from "../../lib/schema";
import { getEnv, json, slugId } from "../../lib/runtime";
import type { SubmissionRecord } from "../../types";

async function verifyTurnstile(
  secret: string | undefined,
  token: string | undefined,
  remoteIp: string | null
) {
  if (!secret) return true;
  if (!token) return false;

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  if (remoteIp) formData.append("remoteip", remoteIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData
  });
  const payload = (await response.json()) as { success?: boolean };
  return Boolean(payload.success);
}

function fallbackSpamCheck(input: {
  website?: string;
  formStartedAt?: string;
  summary: string;
  title: string;
}) {
  if (input.website) {
    return "Submission rejected.";
  }

  const started = input.formStartedAt ? Date.parse(input.formStartedAt) : Number.NaN;
  if (!Number.isFinite(started) || Date.now() - started < 3500) {
    return "Please take a moment to review the source details before submitting.";
  }

  const combined = `${input.title}\n${input.summary}`;
  const linkCount = combined.match(/https?:\/\//gi)?.length ?? 0;
  if (linkCount > 4) {
    return "Please submit one source or tightly related source bundle at a time.";
  }

  return "";
}

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const env = getEnv(locals);
  const raw = await request.json().catch(() => null);
  const body = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const token = body.turnstileToken || body["cf-turnstile-response"];
  const parsed = publicSubmissionInputSchema.safeParse({ ...body, turnstileToken: token });

  if (!parsed.success) {
    return json({ error: "Submission is missing required fields.", details: parsed.error.flatten() }, { status: 400 });
  }

  const hasTurnstile = Boolean(env?.TURNSTILE_SECRET_KEY);
  const turnstileOk = await verifyTurnstile(env?.TURNSTILE_SECRET_KEY, parsed.data.turnstileToken, clientAddress ?? null);
  if (!turnstileOk) {
    return json({ error: "Verification failed. Please refresh and try again." }, { status: 403 });
  }
  if (!hasTurnstile) {
    const spamError = fallbackSpamCheck(parsed.data);
    if (spamError) {
      return json({ error: spamError }, { status: 403 });
    }
  }

  const submission: SubmissionRecord = {
    id: slugId("sub"),
    submitterName: parsed.data.submitterName || undefined,
    submitterContact: parsed.data.submitterContact || undefined,
    url: parsed.data.url || undefined,
    title: parsed.data.title,
    summary: parsed.data.summary,
    suggestedCategory: parsed.data.suggestedCategory,
    moderationStatus: "new",
    createdAt: new Date().toISOString()
  };

  await insertSubmission(env, submission);
  return json({ submission }, { status: 201 });
};
