import type { APIRoute } from "astro";
import { getSiteUrl } from "../lib/seo";

export const GET: APIRoute = async ({ request }) => {
  const siteUrl = getSiteUrl(new URL(request.url).origin);
  return new Response(`User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
};
