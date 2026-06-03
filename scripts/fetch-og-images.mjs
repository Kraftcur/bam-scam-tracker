import fs from 'fs';

async function getOgImage(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    const text = await res.text();
    const match = text.match(/<meta property="og:image" content="([^"]+)"/i);
    if (match) return match[1];
    
    // Some sites use name="og:image" or unquoted
    const match2 = text.match(/<meta[^>]*property=['"]og:image['"][^>]*content=['"]([^'"]+)['"]/i);
    if (match2) return match2[1];
    
    return null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const dexerto1 = await getOgImage('https://www.dexerto.com/youtube/dispute-over-200k-lego-star-wars-collection-triggers-lawsuits-and-viral-investigation-3367546/');
  const dexerto2 = await getOgImage('https://www.dexerto.com/youtube/bricks-minifigs-sues-reckless-ben-over-viral-200k-lego-star-wars-investigation-3370801/');
  const brickFanatics = await getOgImage('https://www.brickfanatics.com/competing-accounts-bricks-and-minifigs-stolen-lego-star-wars');
  
  console.log('Dexerto 1:', dexerto1);
  console.log('Dexerto 2:', dexerto2);
  console.log('Brick Fanatics:', brickFanatics);
}

main();
