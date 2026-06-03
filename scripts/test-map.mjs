import fs from 'fs';
const content = fs.readFileSync('src/data/seed.ts', 'utf8');

const startIdx = content.indexOf('  events: [');
const endIdx = content.indexOf('  cases: [');
let eventsSection = content.substring(startIdx, endIdx);

let matches = [...eventsSection.matchAll(/{\s*id: "[^"]+",\s*occurredAt: "[^"]+",\s*title: "([^"]+)",[\s\S]*?bamPerspective:\s*"[^"]*"\s*}/g)];
console.log("Matched events:", matches.length);
