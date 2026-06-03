import fs from 'fs';
const content = fs.readFileSync('src/data/story.ts', 'utf8');

const matches = content.matchAll(/title:\s*"([^"]+)"[\s\S]*?thumbnail:\s*"([^"]*)"/g);
for (const m of matches) {
  console.log(m[1], ':', m[2]);
}
