import fs from 'fs';
const content = fs.readFileSync('src/data/seed.ts', 'utf8');

const startIdx = content.indexOf('  events: [');
const endIdx = content.indexOf('  cases: [');
let eventsSection = content.substring(startIdx, endIdx);

let matches = [...eventsSection.matchAll(/title:\s*"([^"]+)",[\s\S]*?videoUrl:\s*"([^"]*)",\s*imageUrl:\s*"([^"]*)"/g)];
matches.forEach(m => console.log(m[1], '\n  V:', m[2], '\n  I:', m[3]));
