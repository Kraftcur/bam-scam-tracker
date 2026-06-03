import { describe, expect, it } from "vitest";
import { POST } from "../../src/pages/api/submissions";

function request(body: Record<string, unknown>) {
  return new Request("https://example.test/api/submissions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

async function callPost(body: Record<string, unknown>) {
  return POST({
    request: request(body),
    locals: {},
    clientAddress: "127.0.0.1"
  } as Parameters<typeof POST>[0]);
}

describe("submissions api fallback spam checks", () => {
  it("accepts a normal submission when Turnstile is not configured", async () => {
    const response = await callPost({
      title: "New court document",
      url: "https://example.com/document",
      summary: "This public docket document appears relevant to the timeline and should be checked by an editor.",
      suggestedCategory: "document",
      formStartedAt: new Date(Date.now() - 5000).toISOString(),
      website: ""
    });

    expect(response.status).toBe(201);
  });

  it("rejects honeypot submissions", async () => {
    const response = await callPost({
      title: "New court document",
      summary: "This public docket document appears relevant to the timeline and should be checked by an editor.",
      suggestedCategory: "document",
      formStartedAt: new Date(Date.now() - 5000).toISOString(),
      website: "https://spam.example"
    });

    expect(response.status).toBe(403);
  });

  it("rejects submissions that arrive too fast without Turnstile", async () => {
    const response = await callPost({
      title: "New court document",
      summary: "This public docket document appears relevant to the timeline and should be checked by an editor.",
      suggestedCategory: "document",
      formStartedAt: new Date().toISOString(),
      website: ""
    });

    expect(response.status).toBe(403);
  });
});
