import type { AppEnv } from "./data";
import { env as cloudflareEnv } from "cloudflare:workers";

type RuntimeLocals = {
  runtime?: {
    env?: AppEnv;
  };
};

export function getEnv(locals: unknown): AppEnv | undefined {
  if (cloudflareEnv) return cloudflareEnv as AppEnv;
  return (locals as RuntimeLocals | undefined)?.runtime?.env;
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {})
    }
  });
}

export function slugId(prefix: string) {
  const random = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

export function isAuthorized(request: Request, adminToken?: string) {
  if (!adminToken) return false;
  const auth = request.headers.get("authorization") ?? "";
  const token = request.headers.get("x-admin-token") ?? "";
  return auth === `Bearer ${adminToken}` || token === adminToken;
}
