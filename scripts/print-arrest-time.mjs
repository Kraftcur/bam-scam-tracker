import fs from 'fs';
const content = fs.readFileSync('src/data/story.ts', 'utf8');
const matches = content.matchAll(/cxZPfj8AlmY[^"]*/g);
for (const m of matches) console.log(m[0]);
