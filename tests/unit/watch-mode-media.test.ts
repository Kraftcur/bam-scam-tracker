import { describe, expect, it } from "vitest";
import { seedData } from "../../src/data/seed";

function youtubeId(url: string) {
  const parsed = new URL(url);
  if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
  if (parsed.pathname.includes("/feeds/")) return "";
  return parsed.searchParams.get("v") ?? parsed.pathname.split("/").filter(Boolean).pop() ?? "";
}

describe("Timeline Watch Mode media", () => {
  it("matches event video URLs to their attached primary video sources", () => {
    const sourceMap = new Map(seedData.sources.map((source) => [source.id, source]));
    const mismatches = seedData.events
      .filter((event) => event.videoUrl)
      .map((event) => {
        const eventVideoId = youtubeId(event.videoUrl ?? "");
        const sourceVideoIds = event.sourceIds
          .map((id) => sourceMap.get(id))
          .filter((source) => source?.sourceType === "video")
          .map((source) => youtubeId(source?.url ?? ""))
          .filter(Boolean);

        if (sourceVideoIds.length === 0 || sourceVideoIds.includes(eventVideoId)) return undefined;
        return `${event.id} uses ${eventVideoId} but sources are ${sourceVideoIds.join(", ")}`;
      })
      .filter(Boolean);

    expect(mismatches).toEqual([]);
  });
});
