export type StoryStat = {
  label: string;
  value: string;
  note: string;
};

export type StoryAct = {
  id: string;
  date: string;
  kicker: string;
  title: string;
  plainEnglish: string;
  whyItMatters: string;
  receipts: string[];
  leaning: "ben" | "contested" | "official";
};

export type EvidenceThread = {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  evidence: string[];
  openQuestion: string;
  sourceUrl: string;
  sourceLabel: string;
  heat: 1 | 2 | 3 | 4 | 5;
};

export type VideoNode = {
  id: string;
  title: string;
  date: string;
  role: string;
  url: string;
  thumbnail: string;
  watchFor: string[];
  sourceLabel: string;
};

export type DecoderCard = {
  phrase: string;
  translation: string;
  watchOut: string;
};

export const storyStats: StoryStat[] = [
  {
    label: "claimed collection value",
    value: "$200k+",
    note: "The headline number is disputed, but the family and multiple public timelines describe a six-figure Star Wars LEGO collection."
  },
  {
    label: "sets + minifigs claimed",
    value: "780 / 1,200",
    note: "Salem Brick Trials and community summaries cite more than 780 boxed sets and 1,200 minifigures from the family account."
  },
  {
    label: "Ben arc",
    value: "investigation -> arrest",
    note: "The public story jumps from consignment dispute to police encounters, search warrant, arrest, and a lawsuit."
  },
  {
    label: "site stance",
    value: "accountability-first",
    note: "The public evidence strongly explains why viewers side with Ben, while still labeling allegations and contested claims."
  }
];

export const storyActs: StoryAct[] = [
  {
    id: "act-consignment",
    date: "Nov 2023",
    kicker: "The setup",
    title: "A family collection goes into the store.",
    plainEnglish:
      "Bryan Mansell says his family placed a large Star Wars LEGO collection with the Salem-Keizer Bricks & Minifigs store under a consignment-style arrangement: the store could sell items, but the family still owned what had not sold.",
    whyItMatters:
      "If the unsold sets still belonged to the family, the later store takeover becomes the center of the entire fight.",
    receipts: [
      "Salem Brick Trials background summary",
      "Dexerto May 24 explainer",
      "Brick Fanatics statement coverage"
    ],
    leaning: "contested"
  },
  {
    id: "act-takeover",
    date: "Nov 2024",
    kicker: "The break",
    title: "Corporate takes control; ownership gets messy.",
    plainEnglish:
      "BAM says it repossessed a defaulting store and did not know about an unauthorized consignment. Former operators say BAM seized the store and remaining inventory, including Bryan's tagged consigned items.",
    whyItMatters:
      "This is the fork in the story: private consignment dispute, or corporate takeover that swallowed customer property?",
    receipts: [
      "BAM May 28 statement",
      "Law/Gorman complaint archive",
      "Salem Brick Trials timeline"
    ],
    leaning: "contested"
  },
  {
    id: "act-ben-arrives",
    date: "2025-2026",
    kicker: "The pressure campaign",
    title: "Ben turns a civil dispute into public evidence.",
    plainEnglish:
      "RecklessBen's videos document confrontations, calls, store visits, legal-paper attempts, signage stunts, police interactions, and the argument that public pressure was the only thing that made the dispute visible.",
    whyItMatters:
      "This is why viewers are invested: the videos show the gap between what a family could afford to fight privately and what public scrutiny can force into the open.",
    receipts: [
      "Part 1 video timeline references",
      "Reddit video timeline",
      "Salem Brick Trials video catalog"
    ],
    leaning: "ben"
  },
  {
    id: "act-police",
    date: "Mar 2026",
    kicker: "The escalation",
    title: "Police encounters become their own scandal.",
    plainEnglish:
      "Public reports and Ben's videos describe repeated stops, trespass notices, vehicle searches, an Airbnb search warrant, arrests, and accusations that law enforcement focused on Ben's crew while the original property dispute remained unresolved.",
    whyItMatters:
      "The story stops being only about LEGO. It becomes a test of whether police power was used evenly, transparently, and proportionately.",
    receipts: [
      "American Fork police records archive",
      "Tribune May 31 report",
      "Kotaku June 1 report"
    ],
    leaning: "ben"
  },
  {
    id: "act-lawsuit",
    date: "May-Jun 2026",
    kicker: "The counterattack",
    title: "BAM sues Ben and others.",
    plainEnglish:
      "BAM and related plaintiffs filed a Utah civil complaint alleging defamation, harassment, trespass, and related conduct. The complaint is evidence of what BAM alleges, not proof that Ben or anyone else is liable.",
    whyItMatters:
      "The lawsuit makes this tracker necessary: it separates video evidence, public claims, official statements, and court allegations so people can follow the actual record.",
    receipts: [
      "Utah Case No. 260402353 archive",
      "Dexerto June 2 report",
      "BAM official statement"
    ],
    leaning: "official"
  }
];

export const evidenceThreads: EvidenceThread[] = [
  {
    id: "thread-tags",
    title: "Were the remaining sets identifiable?",
    tagline: "Tags matter.",
    summary:
      "Former operators and Bryan's side say remaining consigned inventory was tagged or otherwise identifiable. BAM says it found only a small portion that might relate to the collection and could not verify the broader claim.",
    evidence: [
      "Salem Brick Trials timeline says the former operators allege tags/stickers and photo/video documentation.",
      "BAM's May 28 statement says only a small remnant, estimated at $2k-$5k, appeared similar.",
      "Brick Fanatics reports BAM's offer to return the small set-aside inventory still stood."
    ],
    openQuestion: "Where are the full inventory records, photos, video, POS exports, and tag logs?",
    sourceUrl: "https://salembricktrials.com/bam-timeline",
    sourceLabel: "Salem Brick Trials timeline",
    heat: 5
  },
  {
    id: "thread-small-claims",
    title: "Did anyone really win in court?",
    tagline: "Default is not the whole story.",
    summary:
      "Ben's content discusses small-claims tactics and default-style claims; later discussion questions service, entity names, dismissals, and whether public claims overstated what the court actually decided.",
    evidence: [
      "BAM's timeline cites video timestamps where Ben discusses multiple small claims and says they win by default.",
      "Community/legal posts dispute whether improper service or entity naming undercut those claims.",
      "The tracker treats court filings and docket outcomes as separate from creator narration."
    ],
    openQuestion: "Which filings survived, which were dismissed, and what did the docket actually enter?",
    sourceUrl: "https://salembricktrials.com/bam-timeline",
    sourceLabel: "BAM timeline references",
    heat: 4
  },
  {
    id: "thread-police-stop",
    title: "Was Ben's group targeted by police?",
    tagline: "The stop-sign test.",
    summary:
      "Public commentary argues that the stop-sign justification and later searches look one-sided when compared with the visible video sequence and the original dispute.",
    evidence: [
      "Kotaku summarizes multiple stops, a heroin-tip search, an Airbnb search warrant, and arrests.",
      "Culture of Gaming argues the stop-sign explanation and stolen-LEGO warrant theory need hard records.",
      "BAM's complaint and police statements frame the conduct as stalking, trespass, and residential picketing."
    ],
    openQuestion: "Release dashcam, bodycam, dispatch logs, warrant materials, and redaction logs.",
    sourceUrl: "https://cultureofgaming.com/the-biggest-lies-and-red-flags-in-the-american-fork-police-release-bricks-and-minifigs-scam/",
    sourceLabel: "Police-release critique",
    heat: 5
  },
  {
    id: "thread-leaked-email",
    title: "Was corporate doing crisis control instead of answering facts?",
    tagline: "PR is not evidence.",
    summary:
      "Ben's leaked-email segment and public archive references focus on franchise-network messaging and reputation management after the videos started spreading.",
    evidence: [
      "Salem Brick Trials lists a leaked internal email under written PR/press statements.",
      "Reddit video lists identify Ben's leaked-email video as a follow-up after BAM's response.",
      "BAM's public statements emphasize harassment concerns, franchisee safety, and unauthorized consignment."
    ],
    openQuestion: "Which parts of the internal communications address the actual inventory trail?",
    sourceUrl: "https://salembricktrials.com/documents",
    sourceLabel: "Documents catalog",
    heat: 3
  },
  {
    id: "thread-lawsuit",
    title: "What is BAM trying to prove against Ben?",
    tagline: "A complaint is an allegation engine.",
    summary:
      "BAM's Utah lawsuit packages Ben's videos, stunts, signs, service attempts, and merchandise into claims including defamation, interference, stalking, and related causes of action.",
    evidence: [
      "Dexerto reports the complaint names BAM Franchising and related plaintiffs against Benjamin Schneider / RecklessBen, RecklessBen LLC, Bryan Mansell, Victor Nguyen, and Does.",
      "The public archive lists the verified complaint, TRO, errata, filing receipt, case history, and docket events.",
      "The complaint's allegations are not findings of liability."
    ],
    openQuestion: "Which alleged facts are supported by records, and which are narrative framing?",
    sourceUrl: "https://bamsucks.com/",
    sourceLabel: "Public court archive",
    heat: 4
  }
];

export const videoNodes: VideoNode[] = [
  {
    id: "wscQpkcwgNU",
    title: "I tracked down the thief who stole $200,000 of LEGO",
    date: "May 21, 2026",
    role: "Origin episode",
    url: "https://www.youtube.com/watch?v=wscQpkcwgNU",
    thumbnail: "https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg",
    sourceLabel: "RecklessBen",
    watchFor: [
      "Bryan's ownership story",
      "Store/corporate confrontations",
      "Timestamped complaint references later cited by BAM"
    ]
  },
  {
    id: "cxZPfj8AlmY",
    title: "I got arrested because of legos",
    date: "May 21, 2026",
    role: "Police escalation",
    url: "https://www.youtube.com/watch?v=cxZPfj8AlmY",
    thumbnail: "https://i.ytimg.com/vi/cxZPfj8AlmY/hqdefault.jpg",
    sourceLabel: "RecklessBen",
    watchFor: [
      "Stops and trespass notices",
      "Search warrant / arrest arc",
      "Ben's theory of uneven enforcement"
    ]
  },
  {
    id: "bWg2bnAqW6k",
    title: "Bricks and Minifigs responded to my video",
    date: "May 23, 2026",
    role: "Response breakdown",
    url: "https://www.youtube.com/watch?v=bWg2bnAqW6k",
    thumbnail: "https://i.ytimg.com/vi/bWg2bnAqW6k/hqdefault.jpg",
    sourceLabel: "RecklessBen",
    watchFor: [
      "BAM statement claims",
      "Inventory ownership argument",
      "Ben's rebuttal to unauthorized-consignment framing"
    ]
  },
  {
    id: "nny2ojTqW3A",
    title: "I got Bricks and Minifigs leaked Email",
    date: "May 28, 2026",
    role: "Internal comms",
    url: "https://youtu.be/nny2ojTqW3A",
    thumbnail: "https://i.ytimg.com/vi/nny2ojTqW3A/hqdefault.jpg",
    sourceLabel: "RecklessBen",
    watchFor: [
      "Crisis messaging",
      "Franchise-network posture",
      "What the email does and does not prove"
    ]
  },
  {
    id: "IcVmSQpIPRY",
    title: "Police Official Response",
    date: "May 2026",
    role: "Official response",
    url: "https://www.youtube.com/watch?v=IcVmSQpIPRY",
    thumbnail: "https://i.ytimg.com/vi/IcVmSQpIPRY/hqdefault.jpg",
    sourceLabel: "American Fork PD / YouTube",
    watchFor: [
      "Police explanation",
      "Claims needing bodycam/dashcam verification",
      "Where official framing conflicts with video/community analysis"
    ]
  },
  {
    id: "14ktgvoH4Mc",
    title: "They STOLE his $200k Lego Collection . . . LEGALLY?",
    date: "May 25, 2026",
    role: "Legal analysis",
    url: "https://www.youtube.com/watch?v=14ktgvoH4Mc",
    thumbnail: "https://i.ytimg.com/vi/14ktgvoH4Mc/hqdefault.jpg",
    sourceLabel: "Lawful Masses",
    watchFor: [
      "Consignment law",
      "Civil vs criminal framing",
      "Why legal leverage may be asymmetric"
    ]
  }
];

export const decoderCards: DecoderCard[] = [
  {
    phrase: "Verified complaint",
    translation:
      "A lawsuit document where one side swears to its allegations. It can include exhibits and detailed claims, but it is still one side's opening story.",
    watchOut: "Do not read it as a court finding."
  },
  {
    phrase: "Temporary restraining order",
    translation:
      "A short-term court order meant to preserve the situation or stop specific conduct before a fuller hearing.",
    watchOut: "Read the exact operative terms; headlines often overstate what it means."
  },
  {
    phrase: "Consignment",
    translation:
      "A sell-it-for-me arrangement: one party displays/sells property, but ownership may remain with the original owner until sold.",
    watchOut: "The contract, labels, inventory records, and who knew what are everything."
  },
  {
    phrase: "Default",
    translation:
      "A procedural result that can happen when a party does not respond. It does not automatically prove the public version of every fact.",
    watchOut: "Service, defendant name, jurisdiction, and later dismissal matter."
  },
  {
    phrase: "Civil matter",
    translation:
      "Police often use this phrase when they think a dispute belongs in court rather than immediate criminal enforcement.",
    watchOut: "It can be accurate, but it can also become a shield against investigating property facts."
  }
];
