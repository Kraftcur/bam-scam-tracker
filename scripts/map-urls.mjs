import fs from 'fs';
const content = fs.readFileSync('src/data/story.ts', 'utf8');

const urls = new Set();
const matches = content.matchAll(/imageUrl:\s*"([^"]+)"/g);
for (const m of matches) urls.add(m[1]);
console.log("Found Image URLs:", [...urls]);

const videoUrls = new Set();
const vMatches = content.matchAll(/sourceUrl:\s*"([^"]+)"/g);
for (const m of vMatches) videoUrls.add(m[1]);
console.log("Found Source URLs:", [...videoUrls]);
