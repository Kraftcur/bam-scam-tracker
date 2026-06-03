import { describe, expect, it } from "vitest";
import { publicSubmissionInputSchema } from "../../src/lib/schema";

describe("public submissions", () => {
  it("accepts a sourced correction", () => {
    const result = publicSubmissionInputSchema.safeParse({
      title: "Correct case date",
      url: "https://example.com/source",
      summary: "This source lists a different date for the hearing and should be checked against the docket.",
      suggestedCategory: "correction",
      formStartedAt: new Date(Date.now() - 5000).toISOString(),
      website: ""
    });
    expect(result.success).toBe(true);
  });

  it("rejects thin submissions", () => {
    const result = publicSubmissionInputSchema.safeParse({
      title: "Bad",
      summary: "Too short",
      suggestedCategory: "x"
    });
    expect(result.success).toBe(false);
  });
});
