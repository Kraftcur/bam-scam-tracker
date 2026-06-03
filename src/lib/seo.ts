const defaultSite = "https://bam-scam-tracker.tomcurrie.workers.dev";

export function getSiteUrl(origin?: string) {
  return (import.meta.env.PUBLIC_SITE_URL || origin || defaultSite).replace(/\/$/, "");
}

export function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
