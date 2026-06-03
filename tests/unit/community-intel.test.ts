import { describe, expect, it } from "vitest";
import { scoreCommunitySubmission } from "../../src/lib/community-intel";

describe("community submission intelligence", () => {
  it("scores sourced timestamped media leads as timeline-review candidates", () => {
    const result = scoreCommunitySubmission({
      title: "Ammon McNeff police call clip",
      summary: "A public video clip with timestamps appears to show the BAM CEO talking to police about lawsuits, court records, fake documents, the consignment dispute, and whether filings existed against BAM-side parties. It includes enough detail for an editor to compare against dockets and police records.",
      suggestedCategory: "clip",
      url: "https://video.twimg.com/example.mp4"
    });

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.suggestedAction).toBe("timeline-review");
    expect(result.scoreReasons).toContain("has-source-url");
    expect(result.scoreReasons).toContain("media-evidence-lead");
  });

  it("clusters duplicate source URLs instead of creating a new feed item", () => {
    const first = scoreCommunitySubmission({
      title: "Police bodycam clip",
      summary: "A clip with bodycam timestamps should be checked.",
      suggestedCategory: "clip",
      url: "https://example.com/bodycam.mp4"
    });
    const duplicate = scoreCommunitySubmission(
      {
        title: "Same police bodycam clip",
        summary: "This appears to be the same clip with another title.",
        suggestedCategory: "clip",
        url: "https://example.com/bodycam.mp4"
      },
      [],
      [{
        id: "sub-existing",
        title: "Police bodycam clip",
        summary: "A clip with bodycam timestamps should be checked.",
        suggestedCategory: "clip",
        moderationStatus: "triaged",
        createdAt: new Date().toISOString(),
        duplicateKey: first.duplicateKey
      }]
    );

    expect(duplicate.suggestedAction).toBe("duplicate");
    expect(duplicate.scoreReasons).toContain("possible-duplicate");
  });

  it("matches community leads against already published source URLs", () => {
    const duplicate = scoreCommunitySubmission(
      {
        title: "Ammon McNeff police call clip",
        summary: "A public video clip with timestamps should connect to the existing source instead of becoming a second feed item.",
        suggestedCategory: "clip",
        url: "https://video.twimg.com/amplify_video/2062282560475197440/vid/avc1/1276x720/voA3U2BPFfkL48BV.mp4?tag=27"
      },
      [],
      [],
      ["video.twimg.com/amplify_video/2062282560475197440/vid/avc1/1276x720/voA3U2BPFfkL48BV.mp4"]
    );

    expect(duplicate.suggestedAction).toBe("duplicate");
    expect(duplicate.scoreReasons).toContain("possible-duplicate");
  });
});
