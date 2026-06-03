import fs from 'fs';
const filePath = 'src/data/seed.ts';
let content = fs.readFileSync(filePath, 'utf8');

const startIdx = content.indexOf('  events: [');
const endIdx = content.indexOf('  cases: [');
let eventsSection = content.substring(startIdx, endIdx);

eventsSection = eventsSection.replace(/(publicationRisk:\s*"[^"]+")/g, (match) => {
  return `${match},\n      benPerspective: "Ben's side argues this shows clear mismanagement and attempts to cover up the missing collection.",\n      bamPerspective: "BAM and police maintain they followed standard procedure and that creator videos lack verifiable proof.",\n      videoUrl: "https://www.youtube.com/watch?v=cxZPfj8AlmY",\n      imageUrl: "https://i.ytimg.com/vi/cxZPfj8AlmY/hqdefault.jpg"`;
});

content = content.substring(0, startIdx) + eventsSection + content.substring(endIdx);
fs.writeFileSync(filePath, content);
console.log("Updated events with robust regex and correct boundaries");
