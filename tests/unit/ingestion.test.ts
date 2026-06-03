import { describe, expect, it } from "vitest";
import { isAiIngestionEnabled } from "../../src/lib/ingestion";

describe("ingestion cost controls", () => {
  it("keeps AI extraction off by default even when a key exists", () => {
    expect(isAiIngestionEnabled({ OPENAI_API_KEY: "sk-test" })).toBe(false);
    expect(isAiIngestionEnabled({ OPENAI_API_KEY: "sk-test", ENABLE_AI_INGESTION: "false" })).toBe(false);
  });

  it("requires an explicit opt-in flag and API key", () => {
    expect(isAiIngestionEnabled({ ENABLE_AI_INGESTION: "true" })).toBe(false);
    expect(isAiIngestionEnabled({ OPENAI_API_KEY: "sk-test", ENABLE_AI_INGESTION: "true" })).toBe(true);
  });
});
