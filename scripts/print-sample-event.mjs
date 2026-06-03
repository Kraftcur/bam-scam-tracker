import fs from 'fs';
const content = fs.readFileSync('src/data/seed.ts', 'utf8');

const startIdx = content.indexOf('  events: [');
const endIdx = content.indexOf('  cases: [');
let eventsSection = content.substring(startIdx, endIdx);

const firstEvent = eventsSection.match(/{[\s\S]*?}/)[0];
console.log(firstEvent);
