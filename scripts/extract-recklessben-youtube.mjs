#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const channelId = "UC_UE7maDDe8OqqC8-TtXaKg";
const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
const includeTranscripts = process.argv.includes("--transcripts");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = Number.parseInt(limitArg?.split("=")[1] ?? "10", 10);
const keywordPattern = /\b(lego|legos|brick|bricks|minifigs|bam|police|arrest|ceo)\b/i;
const transcriptTerms = [
  "police",
  "warrant",
  "search",
  "body cam",
  "stop sign",
  "arrest",
  "CEO",
  "questions",
  "Bricks and Minifigs"
];

function decodeEntities(value = "") {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .trim();
}

function tag(block, name) {
  return decodeEntities(block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`))?.[1] ?? "");
}

function attr(block, tagName, attrName) {
  return decodeEntities(block.match(new RegExp(`<${tagName}[^>]*${attrName}="([^"]+)"`))?.[1] ?? "");
}

function parseFeed(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map((match) => {
      const entry = match[1];
      const videoId = tag(entry, "yt:videoId");
      return {
        videoId,
        title: tag(entry, "title"),
        published: tag(entry, "published"),
        updated: tag(entry, "updated"),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: attr(entry, "media:thumbnail", "url") || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        views: Number.parseInt(attr(entry, "media:statistics", "views") || "0", 10),
        description: tag(entry, "media:description")
      };
    })
    .filter((entry) => entry.videoId && keywordPattern.test(`${entry.title} ${entry.description}`))
    .slice(0, Number.isFinite(limit) ? limit : 10);
}

function parseVtt(vtt) {
  const cues = [];
  for (const block of vtt.split(/\n\n+/)) {
    const lines = block.split("\n").filter(Boolean);
    const timing = lines.find((line) => line.includes("-->"));
    if (!timing) continue;
    const start = timing.split("-->")[0].trim().split(".")[0];
    const text = decodeEntities(
      lines
        .slice(lines.indexOf(timing) + 1)
        .join(" ")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
    );
    if (text) cues.push({ start, text });
  }

  return cues.filter((cue, index) => {
    const previous = cues[index - 1]?.text ?? "";
    return cue.text !== previous && !previous.startsWith(cue.text);
  });
}

async function extractTranscriptSnippets(video) {
  const workspace = await mkdtemp(join(tmpdir(), "bam-youtube-"));
  try {
    await execFileAsync("yt-dlp", [
      "--skip-download",
      "--write-auto-subs",
      "--sub-lang",
      "en",
      "--sub-format",
      "vtt",
      video.url
    ], { cwd: workspace, maxBuffer: 1024 * 1024 * 5 });
    const vttFile = (await readdir(workspace)).find((file) => file.endsWith(".vtt"));
    if (!vttFile) return [];
    const cues = parseVtt(await readFile(join(workspace, vttFile), "utf8"));
    const snippets = [];
    for (const term of transcriptTerms) {
      const cue = cues.find((candidate) => candidate.text.toLowerCase().includes(term.toLowerCase()));
      if (cue && !snippets.some((snippet) => snippet.start === cue.start)) {
        snippets.push({
          label: term,
          start: cue.start,
          url: `${video.url}&t=${toSeconds(cue.start)}s`,
          excerpt: cue.text.slice(0, 220)
        });
      }
    }
    return snippets.slice(0, 6);
  } catch (error) {
    return [{ label: "transcript-error", start: "00:00:00", url: video.url, excerpt: error instanceof Error ? error.message : String(error) }];
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
}

function toSeconds(timestamp) {
  return timestamp.split(":").reduce((total, part) => total * 60 + Number.parseInt(part, 10), 0);
}

const response = await fetch(feedUrl, {
  headers: { "user-agent": "BAM Scam Tracker YouTube extractor" }
});

if (!response.ok) {
  throw new Error(`YouTube feed returned HTTP ${response.status}`);
}

const videos = parseFeed(await response.text());
const enriched = [];
for (const video of videos) {
  enriched.push({
    ...video,
    transcriptSnippets: includeTranscripts ? await extractTranscriptSnippets(video) : []
  });
}

console.log(JSON.stringify({
  channelId,
  feedUrl,
  generatedAt: new Date().toISOString(),
  count: enriched.length,
  videos: enriched
}, null, 2));
