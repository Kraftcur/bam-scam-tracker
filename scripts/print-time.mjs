import fs from 'fs';
const content = fs.readFileSync('src/data/story.ts', 'utf8');

const matches = content.matchAll(/title:\s*"([^"]+)",[\s\S]*?sourceUrl:\s*"([^"]+)"/g);
for (const m of matches) {
  if (m[2].includes('&t=')) {
    console.log(m[1], ':', m[2]);
  }
}
