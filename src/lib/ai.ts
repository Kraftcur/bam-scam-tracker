import { z } from "zod";

export const extractedCandidateSchema = z.object({
  timelineCandidates: z.array(
    z.object({
      occurredAt: z.string().describe("ISO datetime if known. Prefer visible recording/bodycam/dashcam timestamps over upload or discovery dates."),
      title: z.string(),
      summary: z.string(),
      category: z.enum(["collection", "franchise", "court", "police", "video", "statement", "media", "site"]),
      status: z.enum(["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review", "community"]),
      confidence: z.enum(["high", "medium", "low"]),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      benPerspective: z.string().optional(),
      bamPerspective: z.string().optional()
    })
  ),
  documentCandidates: z.array(
    z.object({
      title: z.string(),
      documentType: z.string(),
      fileType: z.enum(["pdf", "png", "html", "audio", "video", "other"]),
      status: z.enum(["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review", "community"])
    })
  ),
  claimCandidates: z.array(
    z.object({
      claimant: z.string(),
      claimText: z.string(),
      status: z.enum(["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review", "community"]),
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

  const modelId = input.model || "gemini-3.1-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${input.apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: "Extract only source-supported tracker candidates that are important to public freedom of speech discussions. Do not infer guilt, liability, crimes, motives, or private personal details. Court filings are allegations unless the text says an order or finding was entered.\nFor event dates, prefer the time the underlying thing happened. If source text or video-analysis notes mention a visible bodycam, dashcam, CCTV, phone-recording, or document timestamp, use that timestamp for occurredAt and mention any later upload/surfacing date in the summary. If only publication/upload time is known, use that and say so.\nFor each event, also attempt to extract a 'benPerspective' (how RecklessBen or his supporters frame it), a 'bamPerspective' (how BAM Franchising or police frame it), and any relevant 'imageUrl' or 'videoUrl' if present in the text."
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Source title: ${input.sourceTitle}\nSource URL: ${input.sourceUrl}\n\nText:\n${input.sourceText.slice(0, 12000)}`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            timelineCandidates: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  occurredAt: { type: "STRING" },
                  title: { type: "STRING" },
                  summary: { type: "STRING" },
                  category: {
                    type: "STRING",
                    enum: ["collection", "franchise", "court", "police", "video", "statement", "media", "site"]
                  },
                  status: {
                    type: "STRING",
                    enum: ["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review", "community"]
                  },
                  confidence: { type: "STRING", enum: ["high", "medium", "low"] },
                  imageUrl: { type: "STRING" },
                  videoUrl: { type: "STRING" },
                  benPerspective: { type: "STRING" },
                  bamPerspective: { type: "STRING" }
                },
                required: ["occurredAt", "title", "summary", "category", "status", "confidence"]
              }
            },
            documentCandidates: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  documentType: { type: "STRING" },
                  fileType: { type: "STRING", enum: ["pdf", "png", "html", "audio", "video", "other"] },
                  status: {
                    type: "STRING",
                    enum: ["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review", "community"]
                  }
                },
                required: ["title", "documentType", "fileType", "status"]
              }
            },
            claimCandidates: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  claimant: { type: "STRING" },
                  claimText: { type: "STRING" },
                  status: {
                    type: "STRING",
                    enum: ["court-record", "official-statement", "verified", "alleged", "disputed", "needs-review", "community"]
                  },
                  confidence: { type: "STRING", enum: ["high", "medium", "low"] },
                  editorNote: { type: "STRING" }
                },
                required: ["claimant", "claimText", "status", "confidence", "editorNote"]
              }
            }
          },
          required: ["timelineCandidates", "documentCandidates", "claimCandidates"]
        }
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini extraction failed: ${response.status} ${errText}`);
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return emptyCandidates;
  return extractedCandidateSchema.parse(JSON.parse(text));
}
