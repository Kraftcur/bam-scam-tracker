import type { APIRoute } from "astro";
import { getTrackerData } from "../../lib/data";
import { getEnv, json } from "../../lib/runtime";

export const GET: APIRoute = async ({ locals, url }) => {
  const data = await getTrackerData(getEnv(locals));
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const events = data.events.filter(
    (event) =>
      (!status || event.status === status) &&
      (!category || event.category === category)
  );
  return json({ events });
};
