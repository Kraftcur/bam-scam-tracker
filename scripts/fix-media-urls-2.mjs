import fs from 'fs';
const filePath = 'src/data/seed.ts';
let content = fs.readFileSync(filePath, 'utf8');

const startIdx = content.indexOf('  events: [');
const endIdx = content.indexOf('  cases: [');
let eventsSection = content.substring(startIdx, endIdx);

const imageMap = {
  'collection': ['https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg', 'https://www.youtube.com/watch?v=wscQpkcwgNU'],
  'franchise': ['https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Case-History.png', undefined],
  'court': ['https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Docket-Events.png', undefined],
  'police': ['https://i.ytimg.com/vi/cxZPfj8AlmY/hqdefault.jpg', 'https://www.youtube.com/watch?v=cxZPfj8AlmY'],
  'video': undefined,
  'statement': ['https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Case-History.png', undefined],
  'media': ['https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg', undefined]
};

const titleMap = {
  'RecklessBen publishes first major LEGO investigation': ['https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg', 'https://www.youtube.com/watch?v=wscQpkcwgNU'],
  'RecklessBen responds to BAM\'s public explanation': ['https://i.ytimg.com/vi/nny2ojTqW3A/hqdefault.jpg', 'https://www.youtube.com/watch?v=nny2ojTqW3A'],
  'Leaked-email follow-up expands the PR angle': ['https://i.ytimg.com/vi/nny2ojTqW3A/hqdefault.jpg', undefined],
  'RecklessBen posts CEO-questions livestream': ['https://i.ytimg.com/vi/IcVmSQpIPRY/hqdefault.jpg', 'https://www.youtube.com/watch?v=IcVmSQpIPRY'],
  'RecklessBen details police stops, searches, and arrest': ['https://i.ytimg.com/vi/cxZPfj8AlmY/hqdefault.jpg', 'https://www.youtube.com/watch?v=cxZPfj8AlmY'],
  'RecklessBen responds to American Fork police': ['https://i.ytimg.com/vi/cxZPfj8AlmY/hqdefault.jpg', 'https://www.youtube.com/watch?v=cxZPfj8AlmY']
};

eventsSection = eventsSection.replace(/({\s*id: "[^"]+",\s*occurredAt: "[^"]+",\s*title: "([^"]+)",[\s\S]*?videoUrl:\s*)"[^"]*"/g, (match, prefix, title) => {
  let catMatch = prefix.match(/category:\s*"([^"]+)"/);
  let category = catMatch ? catMatch[1] : '';

  let img = '';
  let vid = '';
  
  if (titleMap[title]) {
    img = titleMap[title][0];
    vid = titleMap[title][1];
  } else if (imageMap[category]) {
    img = imageMap[category][0];
    vid = imageMap[category][1];
  }

  return prefix + `"${vid || ''}"`;
});

content = content.substring(0, startIdx) + eventsSection + content.substring(endIdx);
fs.writeFileSync(filePath, content);
console.log("Updated video URLs successfully.");
