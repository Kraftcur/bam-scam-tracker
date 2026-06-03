import type { APIRoute } from "astro";
import { getTrackerData } from "../../lib/data";
import { getEnv, json } from "../../lib/runtime";

export const GET: APIRoute = async ({ locals, url }) => {
  const data = await getTrackerData(getEnv(locals));
  const caseId = url.searchParams.get("caseId");
  const status = url.searchParams.get("status");
  const documents = data.documents.filter(
    (document) =>
      (!caseId || document.caseId === caseId) &&
      (!status || document.status === status)
  );
  return json({ documents });
};
