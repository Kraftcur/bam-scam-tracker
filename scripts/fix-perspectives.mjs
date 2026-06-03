import fs from 'fs';
const filePath = 'src/data/seed.ts';
let content = fs.readFileSync(filePath, 'utf8');

const startIdx = content.indexOf('  events: [');
const endIdx = content.indexOf('  cases: [');
let eventsSection = content.substring(startIdx, endIdx);

const perspectiveMap = {
  'collection': {
    ben: "Bryan Mansell's side says the family collection was consigned, meaning the unsold sets still belonged to the family and should have been traceable.",
    bam: "BAM says the arrangement was unauthorized at the corporate level and later documentation did not prove the sweeping value claim."
  },
  'franchise': {
    ben: "The Ben/Mansell framing is that corporate control swallowed customer property and nobody with power wanted to unwind it.",
    bam: "BAM frames the takeover as enforcement against a troubled franchise and says it did not knowingly take a verified six-figure customer collection."
  },
  'court': {
    ben: "Ben's side and supporters read the lawsuit as an attempt to punish public scrutiny and shift attention away from the missing-inventory question.",
    bam: "BAM says the campaign caused real harm and asks the court to address alleged defamation, harassment, trespass, interference, and related conduct."
  },
  'police': {
    ben: "Ben argues law enforcement treated his crew as the emergency while the original property dispute remained unresolved.",
    bam: "BAM and police-side documents frame the encounters around trespass, stalking, harassment, residential picketing, and safety concerns."
  },
  'video': {
    ben: "Supporters see Ben exposing a story the family could not force into the open on its own, with aggressive but targeted accountability tactics.",
    bam: "BAM says the videos and tactics crossed into harassment, trespass, defamation, interference, and safety concerns for franchisees and employees."
  },
  'statement': {
    ben: "Ben's side views statements as PR deflection rather than answering the core question about what happened to the specific LEGO inventory.",
    bam: "BAM uses statements to draw a hard line against the creator campaign and frame the issue as a local franchise dispute."
  },
  'media': {
    ben: "Ben's supporters view coverage as proof that the accountability campaign is working to force public answers.",
    bam: "BAM likely sees the coverage as repeating creator-driven narratives without awaiting the civil court process."
  }
};

eventsSection = eventsSection.replace(/(category:\s*"([^"]+)"[\s\S]*?benPerspective:\s*)"[^"]*"/g, (match, prefix, category) => {
  let p = perspectiveMap[category] ? perspectiveMap[category].ben : "Ben's side demands an inspectable chain of custody.";
  return prefix + `"${p.replace(/"/g, '\\"')}"`;
});

eventsSection = eventsSection.replace(/(category:\s*"([^"]+)"[\s\S]*?bamPerspective:\s*)"[^"]*"/g, (match, prefix, category) => {
  let p = perspectiveMap[category] ? perspectiveMap[category].bam : "BAM relies on formal proceedings over internet investigations.";
  return prefix + `"${p.replace(/"/g, '\\"')}"`;
});

content = content.substring(0, startIdx) + eventsSection + content.substring(endIdx);
fs.writeFileSync(filePath, content);
console.log("Updated perspectives successfully.");
