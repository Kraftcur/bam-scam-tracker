import fs from 'fs';
const content = fs.readFileSync('src/data/seed.ts', 'utf8');
const startIdx = content.indexOf('export const seedEvents');
const endIdx = content.indexOf('export const seedCases');
let eventsSection = content.substring(startIdx, endIdx);

console.log("Original instances of publicationRisk:", (eventsSection.match(/publicationRisk/g) || []).length);

eventsSection = eventsSection.replace(/(publicationRisk:\s*"[^"]+")/g, (match) => {
  return `${match},\n      benPerspective: "Ben's side argues this shows clear mismanagement and attempts to cover up the missing collection.",\n      bamPerspective: "BAM and police maintain they followed standard procedure and that creator videos lack verifiable proof.",\n      videoUrl: "https://www.youtube.com/watch?v=cxZPfj8AlmY",\n      imageUrl: "https://i.ytimg.com/vi/cxZPfj8AlmY/hqdefault.jpg"`;
});

console.log("Replaced instances:", (eventsSection.match(/benPerspective/g) || []).length);

const newContent = content.substring(0, startIdx) + eventsSection + content.substring(endIdx);
fs.writeFileSync('src/data/seed.ts', newContent);
