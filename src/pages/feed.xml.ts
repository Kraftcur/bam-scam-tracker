import type { APIRoute } from "astro";
import { getTrackerData } from "../lib/data";
import { getEnv } from "../lib/runtime";
import { escapeXml, getSiteUrl } from "../lib/seo";

export const GET: APIRoute = async ({ locals, request }) => {
  const data = await getTrackerData(getEnv(locals));
  const siteUrl = getSiteUrl(new URL(request.url).origin);
  const events = data.events.slice(0, 25);
  const updated = events[0]?.occurredAt ?? new Date().toISOString();

  const items = events
    .map((event) => {
      const link = `${siteUrl}/timeline?status=${encodeURIComponent(event.status)}#${encodeURIComponent(event.id)}`;
      const description = `${event.summary}\n\nStatus: ${event.status}. Category: ${event.category}.`;
      return `
        <item>
          <title>${escapeXml(event.title)}</title>
          <link>${escapeXml(link)}</link>
          <guid isPermaLink="false">${escapeXml(event.id)}</guid>
          <pubDate>${new Date(event.occurredAt).toUTCString()}</pubDate>
          <category>${escapeXml(event.category)}</category>
          <description>${escapeXml(description)}</description>
        </item>`;
    })
    .join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BAM Scam Tracker Updates</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Latest source-labeled updates from the Bricks &amp; Minifigs / RecklessBen tracker.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=900"
    }
  });
};
