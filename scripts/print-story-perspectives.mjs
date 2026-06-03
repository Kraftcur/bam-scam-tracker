import fs from 'fs';
const content = fs.readFileSync('src/data/story.ts', 'utf8');

const matches = content.matchAll(/benSignal:\s*"([^"]+)",\s*counterSignal:\s*"([^"]+)"/g);
let i = 1;
for (const m of matches) {
  console.log(`Match ${i++}`);
  console.log("Ben:", m[1]);
  console.log("BAM:", m[2]);
}

const beatMatches = content.matchAll(/benSide:\s*"([^"]+)",\s*bamSide:\s*"([^"]+)"/g);
let j = 1;
for (const m of beatMatches) {
  console.log(`Beat Match ${j++}`);
  console.log("Ben:", m[1]);
  console.log("BAM:", m[2]);
}
