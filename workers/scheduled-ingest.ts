import { runScheduledIngestion } from "../src/lib/ingestion";
import type { AppEnv } from "../src/lib/data";
import { isAuthorized } from "../src/lib/runtime";

export default {
  async scheduled(_event: ScheduledEvent, env: AppEnv, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledIngestion(env));
  },

  async fetch(request: Request, env: AppEnv, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname === "/run") {
      if (!isAuthorized(request, env.ADMIN_TOKEN)) {
        return new Response("Unauthorized", { status: 401 });
      }
      ctx.waitUntil(runScheduledIngestion(env));
      return Response.json({ ok: true, queued: true });
    }

    return new Response("BAM Scam Tracker ingestion worker", {
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
};
