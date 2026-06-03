import fs from 'fs';
const content = fs.readFileSync('src/data/seed.ts', 'utf8');

const startIdx = content.indexOf('  events: [');
const endIdx = content.indexOf('  cases: [');
let eventsSection = content.substring(startIdx, endIdx);

let matches = [...eventsSection.matchAll(/title:\s*"([^"]+)",[\s\S]*?category:\s*"([^"]+)"/g)];
matches.forEach(m => console.log(m[2], ':', m[1]));
