import type { APIRoute } from "astro";
import { getTrackerData } from "../../lib/data";
import { getEnv, json } from "../../lib/runtime";

export const GET: APIRoute = async ({ locals }) => {
  const data = await getTrackerData(getEnv(locals));
  return json({ cases: data.cases });
};
