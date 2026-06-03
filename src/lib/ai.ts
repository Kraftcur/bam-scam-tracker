import { z } from "zod";

export const extractedCandidateSchema = z.object({
  timelineCandidates: z.array(
    z.object({
      occurredAt: z.string().describe("ISO datetime if known, otherwise best available date at noon UTC"),
      title: z.string(),
      summary: z.string(),
      category: z.enum(["collection", "franchise", "court", "police", "video", "statement", "media", "site"]),
      status: z.enum(["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review"]),
      confidence: z.enum(["high", "medium", "low"])
    })
  ),
  documentCandidates: z.array(
    z.object({
      title: z.string(),
      documentType: z.string(),
      fileType: z.enum(["pdf", "png", "html", "audio", "video", "other"]),
      status: z.enum(["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review"])
    })
  ),
  claimCandidates: z.array(
    z.object({
      claimant: z.string(),
      claimText: z.string(),
      status: z.enum(["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review"]),
      confidence: z.enum(["high", "medium", "low"]),
      editorNote: z.string()
    })
  )
});

export type ExtractedCandidates = z.infer<typeof extractedCandidateSchema>;

const emptyCandidates: ExtractedCandidates = {
  timelineCandidates: [],
  documentCandidates: [],
  claimCandidates: []
};

export async function extractCandidatesWithAi(input: {
  apiKey?: string;
  model?: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceText: string;
}): Promise<ExtractedCandidates> {
  if (!input.apiKey || input.sourceText.trim().length < 80) return emptyCandidates;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${input.apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: input.model || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Extract only source-supported tracker candidates. Do not infer guilt, liability, crimes, motives, or private personal details. Court filings are allegations unless the text says an order or finding was entered."
        },
        {
          role: "user",
          content: `Source title: ${input.sourceTitle}\nSource URL: ${input.sourceUrl}\n\nText:\n${input.sourceText.slice(0, 12000)}`
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "tracker_candidates",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["timelineCandidates", "documentCandidates", "claimCandidates"],
            properties: {
              timelineCandidates: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["occurredAt", "title", "summary", "category", "status", "confidence"],
                  properties: {
                    occurredAt: { type: "string" },
                    title: { type: "string" },
                    summary: { type: "string" },
                    category: {
                      type: "string",
                      enum: ["collection", "franchise", "court", "police", "video", "statement", "media", "site"]
                    },
                    status: {
                      type: "string",
                      enum: ["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review"]
                    },
                    confidence: { type: "string", enum: ["high", "medium", "low"] }
                  }
                }
              },
              documentCandidates: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["title", "documentType", "fileType", "status"],
                  properties: {
                    title: { type: "string" },
                    documentType: { type: "string" },
                    fileType: { type: "string", enum: ["pdf", "png", "html", "audio", "video", "other"] },
                    status: {
                      type: "string",
                      enum: ["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review"]
                    }
                  }
                }
              },
              claimCandidates: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["claimant", "claimText", "status", "confidence", "editorNote"],
                  properties: {
                    claimant: { type: "string" },
                    claimText: { type: "string" },
                    status: {
                      type: "string",
                      enum: ["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review"]
                    },
                    confidence: { type: "string", enum: ["high", "medium", "low"] },
                    editorNote: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI extraction failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };
  const text = payload.output_text ?? payload.output?.flatMap((item) => item.content ?? []).find((item) => item.text)?.text;
  if (!text) return emptyCandidates;
  return extractedCandidateSchema.parse(JSON.parse(text));
}
