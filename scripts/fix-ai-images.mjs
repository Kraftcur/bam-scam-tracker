import fs from 'fs';
const filePath = 'src/data/seed.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the AI images with real ones
content = content.replace(/\/leonard_french\.png/g, 'https://i.ytimg.com/vi/14ktgvoH4Mc/hqdefault.jpg');
content = content.replace(/\/brick_fanatics\.png/g, 'https://www.dexerto.com/cdn-image/wp-content/uploads/2026/06/02/bricks-and-minifigs-lawsuit.jpg');
content = content.replace(/\/dexerto_news\.png/g, 'https://www.dexerto.com/cdn-image/wp-content/uploads/2026/06/02/bricks-and-minifigs-lawsuit.jpg');

fs.writeFileSync(filePath, content);
console.log("Replaced AI generated images with real thumbnails.");
