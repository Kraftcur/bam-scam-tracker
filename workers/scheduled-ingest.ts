import { runScheduledIngestion } from "../src/lib/ingestion";
import type { AppEnv } from "../src/lib/data";

export default {
  async scheduled(_event: ScheduledEvent, env: AppEnv, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledIngestion(env));
  },

  async fetch(_request: Request) {
    return new Response("BAM Scam Tracker ingestion worker", {
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
};
