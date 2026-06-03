import type { APIRoute } from "astro";
import { getTrackerData } from "../lib/data";
import { getEnv } from "../lib/runtime";
import { escapeXml, getSiteUrl } from "../lib/seo";

const staticRoutes = [
  "/",
  "/timeline",
  "/documents",
  "/cases",
  "/claims",
  "/clips",
  "/submit",
  "/about"
];

export const GET: APIRoute = async ({ locals, request }) => {
  const data = await getTrackerData(getEnv(locals));
  const siteUrl = getSiteUrl(new URL(request.url).origin);
  const lastMod =
    data.events[0]?.occurredAt ??
    data.sourceChecks[0]?.checkedAt ??
    new Date().toISOString();

  const urls = staticRoutes
    .map((route) => {
      const priority = route === "/" ? "1.0" : route === "/timeline" || route === "/documents" ? "0.8" : "0.6";
      return `
        <url>
          <loc>${escapeXml(`${siteUrl}${route}`)}</loc>
          <lastmod>${escapeXml(new Date(lastMod).toISOString())}</lastmod>
          <changefreq>${route === "/" ? "hourly" : "daily"}</changefreq>
          <priority>${priority}</priority>
        </url>`;
    })
    .join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
};
