import fs from 'fs';
const filePath = 'src/data/seed.ts';
let content = fs.readFileSync(filePath, 'utf8');

const startIdx = content.indexOf('  events: [');
const endIdx = content.indexOf('  cases: [');
let eventsSection = content.substring(startIdx, endIdx);

// We will map exactly what makes sense for each title, explicitly defining timestamps where useful!
const exactMap = {
  'Mansell collection allegedly placed on consignment': {
    vid: 'https://www.youtube.com/watch?v=wscQpkcwgNU&t=81s',
    img: 'https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg'
  },
  'Salem store transition and repossession dispute': {
    vid: '',
    img: 'https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Case-History.png'
  },
  'Law/Gorman case filed in Utah Business and Chancery Court': {
    vid: '',
    img: 'https://bamsucks.com/Bricks-and-Minifigs-Case-260200029-Complaint.pdf'
  },
  'American Fork police records begin appearing in archive': {
    vid: '',
    img: 'https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Docket-Events.png'
  },
  'Bricks & Minifigs publishes community note': {
    vid: '',
    img: 'https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Case-History.png'
  },
  'National entertainment coverage summarizes dispute': {
    vid: 'https://www.youtube.com/watch?v=14ktgvoH4Mc',
    img: '/leonard_french.png'
  },
  'RecklessBen publishes first major LEGO investigation': {
    vid: 'https://www.youtube.com/watch?v=wscQpkcwgNU&t=411s',
    img: 'https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg'
  },
  'RecklessBen responds to BAM\'s public explanation': {
    vid: 'https://www.youtube.com/watch?v=nny2ojTqW3A',
    img: 'https://i.ytimg.com/vi/nny2ojTqW3A/hqdefault.jpg'
  },
  'Leaked-email follow-up expands the PR angle': {
    vid: 'https://www.youtube.com/watch?v=nny2ojTqW3A&t=450s',
    img: 'https://i.ytimg.com/vi/nny2ojTqW3A/hqdefault.jpg'
  },
  'RecklessBen posts CEO-questions livestream': {
    vid: 'https://www.youtube.com/watch?v=IcVmSQpIPRY',
    img: 'https://i.ytimg.com/vi/IcVmSQpIPRY/hqdefault.jpg'
  },
  'BAM publishes detailed official statement': {
    vid: '',
    img: 'https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Case-History.png'
  },
  'RecklessBen details police stops, searches, and arrest': {
    vid: 'https://www.youtube.com/watch?v=cxZPfj8AlmY',
    img: 'https://i.ytimg.com/vi/cxZPfj8AlmY/hqdefault.jpg'
  },
  'Police response becomes a separate evidence fight': {
    vid: 'https://www.youtube.com/watch?v=cxZPfj8AlmY&t=150s',
    img: 'https://i.ytimg.com/vi/cxZPfj8AlmY/hqdefault.jpg'
  },
  'RecklessBen responds to American Fork police': {
    vid: 'https://www.youtube.com/watch?v=cxZPfj8AlmY&t=600s',
    img: 'https://i.ytimg.com/vi/cxZPfj8AlmY/hqdefault.jpg'
  },
  'Utah civil case materials and TRO appear in public archive': {
    vid: '',
    img: 'https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Docket-Events.png'
  },
  'Brick Fanatics reports on competing accounts': {
    vid: '',
    img: '/brick_fanatics.png'
  },
  'BAM statement distributed via GlobeNewswire': {
    vid: '',
    img: 'https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Case-History.png'
  },
  'Dexerto reports BAM lawsuit against Reckless Ben and others': {
    vid: '',
    img: '/dexerto_news.png'
  }
};

eventsSection = eventsSection.replace(/(title:\s*"([^"]+)",[\s\S]*?videoUrl:\s*)"([^"]*)"/g, (match, prefix, title) => {
  if (exactMap[title]) {
    return prefix + `"${exactMap[title].vid}"`;
  }
  return match;
});

eventsSection = eventsSection.replace(/(title:\s*"([^"]+)",[\s\S]*?imageUrl:\s*)"([^"]*)"/g, (match, prefix, title) => {
  if (exactMap[title]) {
    return prefix + `"${exactMap[title].img}"`;
  }
  return match;
});

content = content.substring(0, startIdx) + eventsSection + content.substring(endIdx);
fs.writeFileSync(filePath, content);
console.log("Updated precise media URLs successfully.");
