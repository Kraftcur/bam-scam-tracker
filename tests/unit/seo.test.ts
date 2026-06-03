import { describe, expect, it } from "vitest";
import { escapeXml, getSiteUrl } from "../../src/lib/seo";

describe("seo helpers", () => {
  it("escapes XML-sensitive characters", () => {
    expect(escapeXml(`Bricks & "Minifigs" <claim> 'update'`)).toBe(
      "Bricks &amp; &quot;Minifigs&quot; &lt;claim&gt; &apos;update&apos;"
    );
  });

  it("normalizes site URLs", () => {
    expect(getSiteUrl("https://example.com/")).toBe("https://example.com");
  });
});
