import fs from 'fs';
const content = fs.readFileSync('src/data/story.ts', 'utf8');

const matches = content.matchAll(/label:\s*"([^"]+)",[\s\S]*?sourceUrl:\s*"([^"]+)"/g);
for (const m of matches) {
  console.log(m[1], ':', m[2]);
}
