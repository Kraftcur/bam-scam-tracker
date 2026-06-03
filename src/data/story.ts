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

export type TimelineBeat = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  benSide: string;
  bamSide: string;
  recordSays: string;
  whyItMatters: string;
  settleIt: string;
  sourceUrl: string;
  sourceLabel: string;
  tone: "origin" | "pressure" | "police" | "court";
  isCurrent?: boolean;
  receipts: Array<{
    label: string;
    href: string;
    kind: "video" | "document" | "statement" | "coverage" | "archive";
  }>;
};

export type EvidenceScene = {
  id: string;
  label: string;
  timeWindow: string;
  headline: string;
  proofLevel: "creator evidence" | "public record" | "official statement" | "court record" | "hot lead";
  tone: "video" | "inventory" | "police" | "court" | "statement";
  imageUrl: string;
  sourceUrl: string;
  sourceLabel: string;
  whatHappened: string;
  benSignal: string;
  counterSignal: string;
  easyRead: string;
  settleIt: string;
  receipts: Array<{
    label: string;
    href: string;
    kind: "video" | "document" | "statement" | "coverage" | "archive";
  }>;
};

export type VerificationLead = {
  id: string;
  title: string;
  status: "watching" | "needs-primary-source" | "ready-to-review";
  whyItMatters: string;
  currentEvidence: string;
  upgradeNeeds: string[];
  sourceUrl: string;
  sourceLabel: string;
};

export type ProofLevel = {
  id: string;
  level: string;
  label: string;
  shortRule: string;
  example: string;
  action: string;
  tone: "lead" | "creator" | "record" | "official" | "finding";
};

export type VisualExhibit = {
  id: string;
  title: string;
  kicker: string;
  kind: "court-image" | "video-still" | "archive-record";
  imageUrl: string;
  sourceUrl: string;
  sourceLabel: string;
  caption: string;
  whyItMatters: string;
  unresolved: string;
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

export type ClipMoment = {
  id: string;
  sequence: string;
  timestamp: string;
  title: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceLabel: string;
  thumbnail: string;
  proofTag: "creator evidence" | "complaint-cited" | "official response" | "needs corroboration";
  hook: string;
  whatClipShows: string;
  whyItMatters: string;
  carefulRead: string;
};

export type LawsuitLens = {
  id: string;
  label: string;
  legalBucket: string;
  title: string;
  plainEnglish: string;
  bamTheory: string;
  benSidePressureTest: string;
  whatCourtMustDecide: string;
  notAFinding: string;
  sourceUrl: string;
  sourceLabel: string;
  tone: "money" | "speech" | "conduct" | "platform" | "inventory";
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

export const evidenceScenes: EvidenceScene[] = [
  {
    id: "scene-origin",
    label: "Scene 01",
    timeWindow: "May 21, 2026",
    headline: "Ben turns the missing-collection story into something viewers can inspect.",
    proofLevel: "creator evidence",
    tone: "video",
    imageUrl: "https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU",
    sourceLabel: "RecklessBen origin episode",
    whatHappened:
      "The first viral episode frames the Mansell collection as a traceable property problem: who had the sets, who controlled the store, and what inventory proof exists?",
    benSignal:
      "The video gives the public a concrete story to follow: people, locations, claims, attempted answers, and visible pressure instead of an abstract civil dispute.",
    counterSignal:
      "BAM says the consignment was unauthorized, that corporate did not knowingly take a verified six-figure collection, and that most proof still needs documentation.",
    easyRead:
      "This is not yet a verdict. It is the public-pressure ignition point and the reason the inventory trail becomes the core receipt.",
    settleIt:
      "Signed consignment paperwork, tag photos, POS exports, stored-inventory records, and a full before/after item list.",
    receipts: [
      {
        label: "Origin video",
        href: "https://www.youtube.com/watch?v=wscQpkcwgNU",
        kind: "video"
      },
      {
        label: "Salem timeline",
        href: "https://salembricktrials.com/bam-timeline",
        kind: "archive"
      },
      {
        label: "BAM statement",
        href: "https://bricksandminifigs.com/blog/blog/2026/05/28/bricks-minifigs-salem-oregon-clarity-and-resolution/",
        kind: "statement"
      }
    ]
  },
  {
    id: "scene-inventory",
    label: "Scene 02",
    timeWindow: "Nov 2024 -> May 2026",
    headline: "The whole case keeps snapping back to one boring-but-deadly question: where are the logs?",
    proofLevel: "public record",
    tone: "inventory",
    imageUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Case-History.png",
    sourceUrl: "https://bamsucks.com/",
    sourceLabel: "Public document archive",
    whatHappened:
      "BAM's repossession story, the former operator dispute, and the Mansell collection claim all depend on inventory custody: what was in-store, what was offsite, and what was sold before takeover.",
    benSignal:
      "Ben's strongest lane is the demand for an inspectable chain of custody. Viewers side with him because the missing logs are easier to understand than the legal posture.",
    counterSignal:
      "BAM says records it reviewed point away from corporate possession of the claimed collection and toward unauthorized local consignment/offsite storage.",
    easyRead:
      "If the records are clean, show the trail. If the trail is broken, that is the story.",
    settleIt:
      "A public inventory reconciliation tying each claimed set to sale, return, storage, loss, or current possession.",
    receipts: [
      {
        label: "Law/Gorman complaint",
        href: "https://bamsucks.com/Bricks-and-Minifigs-Case-260200029-Complaint.pdf",
        kind: "document"
      },
      {
        label: "Termination exhibit",
        href: "https://bamsucks.com/Bricks-and-Minifigs-Case-260200029-Exhibit-D-Termination-Letter.pdf",
        kind: "document"
      },
      {
        label: "GlobeNewswire statement",
        href: "https://www.globenewswire.com/news-release/2026/06/01/3304463/0/en/bricks-minifigs-issues-comprehensive-public-statement-on-salem-oregon-dispute-reaffirms-offer-to-help-mansell-family.html",
        kind: "statement"
      }
    ]
  },
  {
    id: "scene-police",
    label: "Scene 03",
    timeWindow: "Mar -> Jun 2026",
    headline: "The police arc becomes its own scandal because the enforcement pattern looks louder than the original theft question.",
    proofLevel: "public record",
    tone: "police",
    imageUrl: "https://i.ytimg.com/vi/cxZPfj8AlmY/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=cxZPfj8AlmY",
    sourceLabel: "RecklessBen arrest episode",
    whatHappened:
      "The story moves through stops, trespass warnings, searches, a warrant, arrest paperwork, and competing explanations about stalking, picketing, and safety.",
    benSignal:
      "Ben's footage and narration make the police response feel disproportionate: the people asking for LEGO records appear to become the urgent target.",
    counterSignal:
      "Police/BAM-side records frame the conduct as trespass, harassment, stalking, residential picketing, and safety risk rather than protected investigation.",
    easyRead:
      "The tracker should treat the police arc like a split-screen: visible footage on one side, incident reports and warrant language on the other.",
    settleIt:
      "Full bodycam, dashcam, dispatch logs, warrant affidavits, redaction logs, and exact timeline matching against video cuts.",
    receipts: [
      {
        label: "Arrest episode",
        href: "https://www.youtube.com/watch?v=cxZPfj8AlmY",
        kind: "video"
      },
      {
        label: "Probable cause",
        href: "https://bamsucks.com/American-Fork-Police-26AF02033-Probable-Cause-Statement.pdf",
        kind: "document"
      },
      {
        label: "Police response",
        href: "https://www.youtube.com/watch?v=IcVmSQpIPRY",
        kind: "video"
      }
    ]
  },
  {
    id: "scene-lawsuit",
    label: "Scene 04",
    timeWindow: "May 27 -> now",
    headline: "BAM moves the fight into court, which means allegations now need docket discipline.",
    proofLevel: "court record",
    tone: "court",
    imageUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Docket-Events.png",
    sourceUrl: "https://bamsucks.com/",
    sourceLabel: "Utah case archive",
    whatHappened:
      "A Utah civil case packages the viral campaign, signs, service attempts, videos, merchandise, and harassment claims into formal allegations and requested relief.",
    benSignal:
      "The accountability-first read is that suing the creator risks looking like punishment for public pressure while the inventory trail is still unresolved.",
    counterSignal:
      "BAM says the campaign caused harm and asks the court to restrict alleged defamation, harassment, trespass, impersonation, doxxing, signage, and related conduct.",
    easyRead:
      "A complaint is one side's attack map. Orders and docket entries are the scoreboard.",
    settleIt:
      "Answers, motions, hearing results, injunction terms, dismissal orders, and any actual factual findings.",
    receipts: [
      {
        label: "Verified complaint",
        href: "https://bamsucks.com/Bricks-and-Minifigs-v-Benjamin-Paul-Schneider-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Verified-Complaint.pdf",
        kind: "document"
      },
      {
        label: "TRO",
        href: "https://bamsucks.com/Bricks-and-Minifigs-v-Benjamin-Paul-Schneider-Reckless-Ben-Utah-Case-260402353-Temporary-Restraining-Order-TRO.pdf",
        kind: "document"
      },
      {
        label: "Dexerto lawsuit report",
        href: "https://www.dexerto.com/youtube/bricks-minifigs-sues-reckless-ben-over-viral-200k-lego-star-wars-investigation-3370801/",
        kind: "coverage"
      }
    ]
  },
  {
    id: "scene-platform",
    label: "Scene 05",
    timeWindow: "Jun 2026 watch",
    headline: "The newest hot lead is platform pressure, but it stays quarantined until a primary record lands.",
    proofLevel: "hot lead",
    tone: "statement",
    imageUrl: "https://i.ytimg.com/vi/nny2ojTqW3A/hqdefault.jpg",
    sourceUrl: "https://www.reddit.com/r/videos/comments/1tv6wwv/patron_ceo_take_down_notification_reckless_bens/",
    sourceLabel: "Reddit lead thread",
    whatHappened:
      "Multiple social posts discuss a reported Patreon-related takedown attempt involving Ben's account. The tracker keeps this visible as a lead, not a verified event.",
    benSignal:
      "If primary records confirm it, the dispute expands from court pressure and public statements into creator-platform pressure.",
    counterSignal:
      "Without the actual notice, platform statement, or court order, the safest public label is still unverified lead.",
    easyRead:
      "Interesting? Yes. Timeline fact? Not until the original source is public.",
    settleIt:
      "Primary Patreon/CEO URL, the takedown request, sender identity, date, target content, and any court language.",
    receipts: [
      {
        label: "Lead thread",
        href: "https://www.reddit.com/r/videos/comments/1tv6wwv/patron_ceo_take_down_notification_reckless_bens/",
        kind: "archive"
      },
      {
        label: "Verification queue",
        href: "#lead-queue",
        kind: "archive"
      },
      {
        label: "Leaked email episode",
        href: "https://youtu.be/nny2ojTqW3A",
        kind: "video"
      }
    ]
  }
];

export const proofLevels: ProofLevel[] = [
  {
    id: "proof-lead",
    level: "01",
    label: "Hot lead",
    shortRule: "Interesting, not public fact yet.",
    example: "Reddit posts, private-upload chatter, screenshots without a primary source.",
    action: "Keep visible in the verification queue until a primary source appears.",
    tone: "lead"
  },
  {
    id: "proof-creator",
    level: "02",
    label: "Creator evidence",
    shortRule: "Video/audio proves what was shown or said.",
    example: "RecklessBen episodes, police-response video, timestamped clips.",
    action: "Use timestamps and separate narration from what the camera/audio directly shows.",
    tone: "creator"
  },
  {
    id: "proof-record",
    level: "03",
    label: "Public record",
    shortRule: "A filed or archived document exists.",
    example: "Complaints, exhibits, police reports, warrants, docket screenshots.",
    action: "Quote the record's status; do not treat accusations inside it as true.",
    tone: "record"
  },
  {
    id: "proof-official",
    level: "04",
    label: "Official statement",
    shortRule: "A party or agency owns the claim.",
    example: "BAM statements, police public response, GlobeNewswire release.",
    action: "Label it as that side's position unless independent records support it.",
    tone: "official"
  },
  {
    id: "proof-finding",
    level: "05",
    label: "Court finding",
    shortRule: "The scoreboard actually changed.",
    example: "Orders, hearing results, dismissals, injunction terms, factual findings.",
    action: "Promote to verified only when the docket/order says so.",
    tone: "finding"
  }
];

export const verificationLeads: VerificationLead[] = [
  {
    id: "lead-patreon-takedown",
    title: "Patreon takedown attempt chatter",
    status: "needs-primary-source",
    whyItMatters:
      "If a plaintiff-side request tried to pressure Patreon into removing Ben's creator page or related posts, the dispute expands from a court fight into platform pressure.",
    currentEvidence:
      "Multiple Reddit threads on June 3 describe a Patreon CEO response video and a takedown demand, but the tracker needs the primary Patreon/CEO video, the request itself, or a court filing before treating it as verified.",
    upgradeNeeds: [
      "primary Patreon or CEO statement URL",
      "copy of the takedown notice or legal request",
      "court order language, if one exists",
      "date and target of the requested removal"
    ],
    sourceUrl: "https://www.reddit.com/r/videos/comments/1tv6wwv/patron_ceo_take_down_notification_reckless_bens/",
    sourceLabel: "Reddit lead thread"
  },
  {
    id: "lead-bodycam-full-cut",
    title: "Bodycam/full-cut video claims",
    status: "watching",
    whyItMatters:
      "Police video could upgrade or undercut the strongest claims about stops, searches, arrest force, and whether enforcement looked one-sided.",
    currentEvidence:
      "Community posts reference bodycam compilations and missing footage, while the tracker already has police reports, probable-cause records, and public response links.",
    upgradeNeeds: [
      "official bodycam or dashcam release",
      "complete timestamps and incident numbers",
      "redaction notes or withheld-footage explanation",
      "matchup against probable-cause and warrant records"
    ],
    sourceUrl: "https://www.reddit.com/r/bodycambase/comments/1tt9ac6/afpd_reckless_ben_vs_bricks_minifigs_full_cut/",
    sourceLabel: "Community bodycam lead"
  },
  {
    id: "lead-reopened-store",
    title: "Reopened store / second-channel upload",
    status: "watching",
    whyItMatters:
      "If store operations or ownership posture changed after the lawsuit, that could affect public pressure, customer response, and future evidence gathering.",
    currentEvidence:
      "A Reddit post reports a short-lived or private second-channel upload titled around the store reopening. That is a lead, not a source-backed tracker event.",
    upgradeNeeds: [
      "public video URL or archived copy",
      "store page or official reopening statement",
      "date, location, and ownership/operator details",
      "connection to any active court order"
    ],
    sourceUrl: "https://www.reddit.com/r/RecklessBen/comments/1tv6ljr/did_anyone_see_the_second_channel_upload_that_got/",
    sourceLabel: "Reddit upload lead"
  }
];

export const timelineBeats: TimelineBeat[] = [
  {
    id: "beat-consignment",
    date: "Nov 2023",
    title: "The collection enters the story.",
    subtitle: "A Star Wars LEGO collection is allegedly placed with the Salem store.",
    benSide:
      "Bryan Mansell's side says the family collection was consigned, meaning the unsold sets still belonged to the family and should have been traceable.",
    bamSide:
      "BAM says the arrangement was unauthorized at the corporate level and later documentation did not prove the sweeping value claim.",
    recordSays:
      "Public reports and archives confirm the consignment dispute exists. The exact inventory, value, authorization, and remaining items are still contested.",
    whyItMatters:
      "Everything downstream depends on whether the unsold inventory can be identified and tied back to the family.",
    settleIt:
      "Signed intake paperwork, tag photos, POS exports, storage records, and a chain-of-custody map.",
    sourceUrl: "https://salembricktrials.com/bam-timeline",
    sourceLabel: "Salem Brick Trials timeline",
    tone: "origin",
    receipts: [
      {
        label: "Salem timeline",
        href: "https://salembricktrials.com/bam-timeline",
        kind: "archive"
      },
      {
        label: "Dexerto explainer",
        href: "https://www.dexerto.com/youtube/dispute-over-200k-lego-star-wars-collection-triggers-lawsuits-and-viral-investigation-3367546/",
        kind: "coverage"
      },
      {
        label: "Brick Fanatics coverage",
        href: "https://www.brickfanatics.com/bricks-and-minifigs-dispute-200k-lego-collection",
        kind: "coverage"
      }
    ]
  },
  {
    id: "beat-takeover",
    date: "Nov 2024",
    title: "The store takeover makes ownership explosive.",
    subtitle: "Corporate repossession and former-operator claims collide.",
    benSide:
      "The Ben/Mansell framing is that corporate control swallowed customer property and nobody with power wanted to unwind it.",
    bamSide:
      "BAM frames the takeover as enforcement against a troubled franchise and says it did not knowingly take a verified six-figure customer collection.",
    recordSays:
      "The Law/Gorman matter and BAM statements show competing stories about termination, assets, and what corporate knew.",
    whyItMatters:
      "This is where a local consignment dispute turns into a franchisor accountability fight.",
    settleIt:
      "Termination records, store inventory snapshots, security footage, employee statements, and any set-aside item logs.",
    sourceUrl: "https://bamsucks.com/",
    sourceLabel: "Public document archive",
    tone: "origin",
    receipts: [
      {
        label: "Law/Gorman complaint",
        href: "https://bamsucks.com/Bricks-and-Minifigs-Case-260200029-Complaint.pdf",
        kind: "document"
      },
      {
        label: "Termination letter exhibit",
        href: "https://bamsucks.com/Bricks-and-Minifigs-Case-260200029-Exhibit-D-Termination-Letter.pdf",
        kind: "document"
      },
      {
        label: "BAM May 28 statement",
        href: "https://bricksandminifigs.com/blog/blog/2026/05/28/bricks-minifigs-salem-oregon-clarity-and-resolution/",
        kind: "statement"
      }
    ]
  },
  {
    id: "beat-ben-videos",
    date: "May 2026",
    title: "Ben makes it impossible to ignore.",
    subtitle: "Videos turn a records dispute into a public-pressure campaign.",
    benSide:
      "Supporters see Ben exposing a story the family could not force into the open on its own, with aggressive but targeted accountability tactics.",
    bamSide:
      "BAM says the videos and tactics crossed into harassment, trespass, defamation, interference, and safety concerns for franchisees and employees.",
    recordSays:
      "The videos are primary evidence of what Ben published and did. They are not automatic proof of every claim he narrates.",
    whyItMatters:
      "This is the emotional center of the scandal: public pressure feels like the only lever that moved the story.",
    settleIt:
      "Timestamped clip index, exact alleged false statements, and side-by-side source records for each major claim.",
    sourceUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU",
    sourceLabel: "RecklessBen origin episode",
    tone: "pressure",
    receipts: [
      {
        label: "Origin episode",
        href: "https://www.youtube.com/watch?v=wscQpkcwgNU",
        kind: "video"
      },
      {
        label: "BAM response breakdown",
        href: "https://www.youtube.com/watch?v=bWg2bnAqW6k",
        kind: "video"
      },
      {
        label: "Leaked email episode",
        href: "https://youtu.be/nny2ojTqW3A",
        kind: "video"
      }
    ]
  },
  {
    id: "beat-police",
    date: "Mar-Jun 2026",
    title: "Police become a second scandal.",
    subtitle: "Stops, searches, warrants, arrests, and official explanations become their own evidence fight.",
    benSide:
      "Ben argues law enforcement treated his crew as the emergency while the original property dispute remained unresolved.",
    bamSide:
      "BAM and police-side documents frame the encounters around trespass, stalking, harassment, residential picketing, and safety concerns.",
    recordSays:
      "Police reports, probable-cause records, warrant materials, Ben's videos, and official statements exist, but the full bodycam/dashcam context is still the key missing layer.",
    whyItMatters:
      "If police power was used unevenly, the story is no longer only about LEGO inventory.",
    settleIt:
      "Bodycam, dashcam, dispatch logs, full warrant affidavits, and redaction explanations.",
    sourceUrl: "https://www.youtube.com/watch?v=IcVmSQpIPRY",
    sourceLabel: "American Fork police response",
    tone: "police",
    receipts: [
      {
        label: "Police response video",
        href: "https://www.youtube.com/watch?v=IcVmSQpIPRY",
        kind: "video"
      },
      {
        label: "Probable cause statement",
        href: "https://bamsucks.com/American-Fork-Police-26AF02033-Probable-Cause-Statement.pdf",
        kind: "document"
      },
      {
        label: "Search warrant",
        href: "https://bamsucks.com/American-Fork-Police-Warrant-3352981-Search-Warrant.pdf",
        kind: "document"
      },
      {
        label: "Arrest episode",
        href: "https://www.youtube.com/watch?v=cxZPfj8AlmY",
        kind: "video"
      }
    ]
  },
  {
    id: "beat-lawsuit",
    date: "Now",
    title: "BAM sues Ben, Mansell, and others.",
    subtitle: "The latest live center is the Utah civil case and what the docket does next.",
    benSide:
      "Ben's side and supporters read the lawsuit as an attempt to punish public scrutiny and shift attention away from the missing-inventory question.",
    bamSide:
      "BAM says the campaign caused real harm and asks the court to address alleged defamation, harassment, trespass, interference, and related conduct.",
    recordSays:
      "The complaint and TRO materials are public records of allegations and requested relief. They are not final findings against Ben, Mansell, or anyone else.",
    whyItMatters:
      "This is what is currently happening: the viral fight is now a court fight, and docket updates matter more than rumor.",
    settleIt:
      "New docket entries, hearing dates, orders, answers, motions, and any factual findings from the court.",
    sourceUrl: "https://bamsucks.com/",
    sourceLabel: "Utah case archive",
    tone: "court",
    isCurrent: true,
    receipts: [
      {
        label: "Verified complaint",
        href: "https://bamsucks.com/Bricks-and-Minifigs-v-Benjamin-Paul-Schneider-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Verified-Complaint.pdf",
        kind: "document"
      },
      {
        label: "Temporary restraining order",
        href: "https://bamsucks.com/Bricks-and-Minifigs-v-Benjamin-Paul-Schneider-Reckless-Ben-Utah-Case-260402353-Temporary-Restraining-Order-TRO.pdf",
        kind: "document"
      },
      {
        label: "Docket events image",
        href: "https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Docket-Events.png",
        kind: "document"
      },
      {
        label: "Dexerto lawsuit coverage",
        href: "https://www.dexerto.com/youtube/bricks-minifigs-sues-reckless-ben-over-viral-200k-lego-star-wars-investigation-3370801/",
        kind: "coverage"
      }
    ]
  }
];

export const visualExhibits: VisualExhibit[] = [
  {
    id: "exhibit-docket-events",
    title: "Docket events are the scoreboard, not the rumors.",
    kicker: "Court image",
    kind: "court-image",
    imageUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Docket-Events.png",
    sourceUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Docket-Events.png",
    sourceLabel: "Public docket-events image",
    caption:
      "A docket image helps separate what was actually filed from what creators, companies, and commenters say happened.",
    whyItMatters:
      "When the internet argues about who is winning, the docket is the place to check whether anything actually changed.",
    unresolved:
      "Needs live verification against Utah Xchange before being treated as the current docket."
  },
  {
    id: "exhibit-case-history",
    title: "Case history shows the lawsuit's paper trail.",
    kicker: "Court image",
    kind: "court-image",
    imageUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Case-History.png",
    sourceUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Case-History.png",
    sourceLabel: "Public case-history image",
    caption:
      "The case-history screenshot anchors the BAM v. RecklessBen matter to a concrete Utah case record.",
    whyItMatters:
      "It keeps the tracker grounded in dated records instead of only viral clips and secondhand summaries.",
    unresolved:
      "Future hearing dates and new filings still need official docket checks."
  },
  {
    id: "exhibit-origin-video",
    title: "The viral origin episode made the missing-inventory question unavoidable.",
    kicker: "Video still",
    kind: "video-still",
    imageUrl: "https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU",
    sourceLabel: "RecklessBen origin episode",
    caption:
      "The first major episode frames the dispute around ownership, tags, inventory trails, and corporate accountability.",
    whyItMatters:
      "This is where public sympathy swings hard toward Ben and the Mansell family because the record feels inspectable.",
    unresolved:
      "Video evidence still needs timestamps, corroborating records, and separation between narration and proof."
  },
  {
    id: "exhibit-police-video",
    title: "The arrest arc turned a property dispute into a police-power story.",
    kicker: "Video still",
    kind: "video-still",
    imageUrl: "https://i.ytimg.com/vi/cxZPfj8AlmY/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=cxZPfj8AlmY",
    sourceLabel: "RecklessBen arrest episode",
    caption:
      "Ben's arrest-focused episode is why the tracker treats police records as a core evidence lane, not a side plot.",
    whyItMatters:
      "If police power was used unevenly, the scandal is bigger than the LEGO collection.",
    unresolved:
      "Bodycam, dashcam, warrant, dispatch, and redaction logs are the records that would settle the hardest claims."
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

export const clipMoments: ClipMoment[] = [
  {
    id: "clip-contract-property",
    sequence: "01",
    timestamp: "1:21-1:41",
    title: "The ownership claim in twenty seconds",
    sourceTitle: "I tracked down the thief who stole $200,000 of LEGO",
    sourceUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU&t=81s",
    sourceLabel: "RecklessBen origin episode",
    thumbnail: "https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg",
    proofTag: "creator evidence",
    hook: "If the sets remained family property until sold, every later inventory answer matters.",
    whatClipShows:
      "Bryan's side describes a consignment setup where the collection allegedly remained family property while the store kept a percentage from sales.",
    whyItMatters:
      "This is the simplest way into the whole case: was this ordinary store inventory, or customer property that needed a separate chain of custody?",
    carefulRead:
      "The clip proves the family-side explanation was publicly presented. The contract, inventory, and payment trail still decide the factual record."
  },
  {
    id: "clip-repossession-footage",
    sequence: "02",
    timestamp: "2:20-3:35",
    title: "The takeover footage becomes the first real receipt",
    sourceTitle: "I tracked down the thief who stole $200,000 of LEGO",
    sourceUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU&t=140s",
    sourceLabel: "RecklessBen origin episode",
    thumbnail: "https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg",
    proofTag: "creator evidence",
    hook: "The story stops being abstract when the store takeover is tied to visible footage and immediate inventory questions.",
    whatClipShows:
      "The episode presents the franchise termination/takeover moment and discussion of sets Bryan allegedly had not yet been paid for.",
    whyItMatters:
      "This connects BAM's repossession narrative to the missing-inventory question viewers actually understand.",
    carefulRead:
      "Video context is powerful, but the exact seized inventory still needs records, photos, POS exports, and item-by-item reconciliation."
  },
  {
    id: "clip-store-entry",
    sequence: "03",
    timestamp: "6:51-12:28",
    title: "Ben enters the store and the dispute becomes a confrontation",
    sourceTitle: "I tracked down the thief who stole $200,000 of LEGO",
    sourceUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU&t=411s",
    sourceLabel: "RecklessBen origin episode",
    thumbnail: "https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg",
    proofTag: "complaint-cited",
    hook: "This is where accountability theater and alleged trespass start occupying the same frame.",
    whatClipShows:
      "Ben arrives at the Salem store, asks about Bryan's sets, and the store/police response becomes part of the record.",
    whyItMatters:
      "Supporters read it as pressure after polite channels failed. BAM's lawsuit reads the same conduct as part of a targeted campaign.",
    carefulRead:
      "The clip can show what happened on camera. Whether it was lawful, defamatory, harassing, or protected commentary is a separate legal question."
  },
  {
    id: "clip-ceo-hard-way",
    sequence: "04",
    timestamp: "12:40-14:46",
    title: "The CEO confrontation becomes BAM's extortion frame",
    sourceTitle: "I tracked down the thief who stole $200,000 of LEGO",
    sourceUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU&t=760s",
    sourceLabel: "RecklessBen origin episode",
    thumbnail: "https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg",
    proofTag: "complaint-cited",
    hook: "The same moment reads as leverage to supporters and threat language to BAM.",
    whatClipShows:
      "Ben confronts BAM leadership and frames return/payment as the easy way versus a harder public route.",
    whyItMatters:
      "This clip is a key split-screen: public-pressure strategy on one side, alleged coercive threat on the other.",
    carefulRead:
      "Do not summarize this as a court finding. It is a cited video moment whose legal meaning is what the lawsuit is fighting over."
  },
  {
    id: "clip-brand-stunt",
    sequence: "05",
    timestamp: "26:00-35:59",
    title: "The stunt tactics become both viral fuel and legal risk",
    sourceTitle: "I tracked down the thief who stole $200,000 of LEGO",
    sourceUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU&t=1560s",
    sourceLabel: "RecklessBen origin episode",
    thumbnail: "https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg",
    proofTag: "complaint-cited",
    hook: "The public loved the pressure. The complaint treats the pressure as conduct.",
    whatClipShows:
      "The origin episode depicts altered branding/storefront tactics, a booth outside the store, and identity-switching after police arrived.",
    whyItMatters:
      "This is why the tracker cannot be only pro-Ben vibes: the most entertaining material is also the material BAM points at in court.",
    carefulRead:
      "The clip helps verify what Ben published. It does not by itself prove BAM's legal labels or Ben's defense."
  },
  {
    id: "clip-raffle-police",
    sequence: "06",
    timestamp: "39:39-46:26",
    title: "The raffle sequence tests whether police treat the LEGO dispute as crime or civil mess",
    sourceTitle: "I tracked down the thief who stole $200,000 of LEGO",
    sourceUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU&t=2379s",
    sourceLabel: "RecklessBen origin episode",
    thumbnail: "https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg",
    proofTag: "complaint-cited",
    hook: "This is the clearest 'why won't police act?' moment for viewers.",
    whatClipShows:
      "Ben's group runs a raffle-style setup, brings the winner to the store, and pushes police to treat non-delivery as criminal.",
    whyItMatters:
      "It explains why viewers became angry at law enforcement while also showing why police might frame the dispute as civil.",
    carefulRead:
      "The clip captures the tactic and response; criminal liability, false-pretense theories, and police discretion require records beyond the edit."
  },
  {
    id: "clip-josh-offer",
    sequence: "07",
    timestamp: "49:53-52:04",
    title: "The partial-return offer is the inventory dispute in miniature",
    sourceTitle: "I tracked down the thief who stole $200,000 of LEGO",
    sourceUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU&t=2993s",
    sourceLabel: "RecklessBen origin episode",
    thumbnail: "https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg",
    proofTag: "creator evidence",
    hook: "BAM-side framing says only a small remnant could be identified; Bryan-side framing says the family is nowhere near made whole.",
    whatClipShows:
      "The video points to a limited set-aside/return discussion and Bryan objecting to conditions or partial resolution.",
    whyItMatters:
      "This is the cleanest place to explain the gap between 'we found some sets' and 'where is the full collection?'",
    carefulRead:
      "A partial return offer does not settle ownership, value, sold inventory, missing inventory, or who is responsible for the gap."
  },
  {
    id: "clip-small-claims",
    sequence: "08",
    timestamp: "1:08:14-1:21:39",
    title: "Small-claims wins need docket discipline",
    sourceTitle: "I tracked down the thief who stole $200,000 of LEGO",
    sourceUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU&t=4094s",
    sourceLabel: "RecklessBen origin episode",
    thumbnail: "https://i.ytimg.com/vi/wscQpkcwgNU/hqdefault.jpg",
    proofTag: "needs corroboration",
    hook: "This is where internet scoreboard talk can get sloppy fast.",
    whatClipShows:
      "Ben discusses small-claims strategy, service attempts, default framing, and treating non-response as a win.",
    whyItMatters:
      "The public narrative around 'they lost' or 'we won' needs exact docket outcomes, service facts, dismissals, and defendant names.",
    carefulRead:
      "A default-style clip is not the same thing as a final, collectible, fact-finding judgment. The docket has to carry that weight."
  }
];

export const lawsuitLenses: LawsuitLens[] = [
  {
    id: "lens-enterprise",
    label: "01",
    legalBucket: "RICO / conspiracy",
    title: "BAM is not just saying 'bad videos.' It is saying organized scheme.",
    plainEnglish:
      "The complaint tries to turn Ben's videos, store visits, stunts, filings, posts, and collaborators into one coordinated enterprise instead of isolated creator antics.",
    bamTheory:
      "BAM frames the campaign as racketeering, conspiracy, extortion, threats, and coordinated unlawful activity designed to injure the company and people connected to it.",
    benSidePressureTest:
      "The pro-Ben read is that public pressure was the only tool that got anyone to inspect the missing-inventory story. The hard question is where activism stops and unlawful pressure starts.",
    whatCourtMustDecide:
      "Whether the facts satisfy the legal elements of an enterprise/pattern, or whether the complaint is stacking dramatic labels onto speech and protest conduct.",
    notAFinding:
      "Complaint language is accusation language. Treat the court's TRO findings separately from final liability.",
    sourceUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Benjamin-Paul-Schneider-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Verified-Complaint.pdf",
    sourceLabel: "Verified complaint",
    tone: "money"
  },
  {
    id: "lens-defamation",
    label: "02",
    legalBucket: "Defamation / false light",
    title: "The lawsuit lives or dies on exact statements, not vibes.",
    plainEnglish:
      "BAM says Ben and others falsely told a huge audience that BAM, franchisees, and people around them stole, covered up, or committed crimes.",
    bamTheory:
      "The complaint targets allegedly false video statements, signs, posts, and republication that BAM says harmed reputation, customer trust, franchise relationships, and safety.",
    benSidePressureTest:
      "Ben's strongest lane is receipts: if a statement is true, opinion, fair commentary, or tied to visible records, it is harder for BAM to turn outrage into defamation liability.",
    whatCourtMustDecide:
      "Which statements are factual assertions, which are opinion or rhetoric, which are false, and whether the required fault standard is met.",
    notAFinding:
      "A viral accusation is not proof. A defamation count is also not proof.",
    sourceUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Benjamin-Paul-Schneider-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Verified-Complaint.pdf",
    sourceLabel: "Verified complaint",
    tone: "speech"
  },
  {
    id: "lens-trespass",
    label: "03",
    legalBucket: "Trespass / stalking / nuisance",
    title: "The camera cuts are now being judged as physical-world conduct.",
    plainEnglish:
      "The filing and TRO focus heavily on where Ben's group went, who they approached, whether they blocked customers, and whether homes/stores became targets.",
    bamTheory:
      "BAM argues the campaign crossed into trespass, residential picketing, stalking, nuisance, impersonation, and intimidation at stores, homes, offices, and franchise locations.",
    benSidePressureTest:
      "Supporters see awkward in-person pressure as accountability journalism. The legal pressure test is whether people were warned off, deceived, blocked, harassed, or targeted at private locations.",
    whatCourtMustDecide:
      "Which visits and filming were lawful, which were after notice or deceptive, and whether the pattern justifies ongoing restrictions.",
    notAFinding:
      "Footage can show contact happened; it does not automatically answer trespass, stalking, or harassment elements.",
    sourceUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Benjamin-Paul-Schneider-Reckless-Ben-Utah-Case-260402353-Temporary-Restraining-Order-TRO.pdf",
    sourceLabel: "Temporary restraining order",
    tone: "conduct"
  },
  {
    id: "lens-business",
    label: "04",
    legalBucket: "Business interference",
    title: "BAM says the campaign hit customers, franchisees, staff, and stores.",
    plainEnglish:
      "This bucket is about disruption: customers allegedly diverted, employees solicited, stores interrupted, franchise goodwill damaged, and business relationships chilled.",
    bamTheory:
      "BAM claims the campaign interfered with existing and future economic relationships through videos, stunts, signs, calls, in-person confrontations, and online amplification.",
    benSidePressureTest:
      "The counter-read is that reputational pain can be the consequence of scrutiny. The key is whether the disruption came from protected criticism or unlawful tactics.",
    whatCourtMustDecide:
      "Whether the alleged interference used improper means and whether BAM can prove causation and damages rather than just public backlash.",
    notAFinding:
      "Public anger, customer loss, and brand damage still have to be connected to legally actionable conduct.",
    sourceUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Benjamin-Paul-Schneider-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Verified-Complaint.pdf",
    sourceLabel: "Verified complaint",
    tone: "conduct"
  },
  {
    id: "lens-money",
    label: "05",
    legalBucket: "Money / disgorgement",
    title: "BAM wants more than damages. It wants the campaign money traced.",
    plainEnglish:
      "The complaint seeks damages and also asks for accounting/disgorgement of money allegedly earned from the BAM-related content: platforms, subscriptions, merch, donations, sponsors, and related revenue.",
    bamTheory:
      "BAM says defendants should not profit from allegedly wrongful content and pressure tactics built around the dispute.",
    benSidePressureTest:
      "The pro-Ben response is that creators can earn money from reporting and commentary; the question is whether the underlying content or conduct is legally wrongful.",
    whatCourtMustDecide:
      "Whether any revenue is tied to unlawful conduct, and if so, whether the remedy should reach creator income, donations, merch, or platform revenue.",
    notAFinding:
      "A request for disgorgement is not a ruling that Ben's money belongs to BAM.",
    sourceUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Benjamin-Paul-Schneider-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Verified-Complaint.pdf",
    sourceLabel: "Verified complaint",
    tone: "money"
  },
  {
    id: "lens-takedown",
    label: "06",
    legalBucket: "TRO / takedown",
    title: "The scary part for viewers: the order reaches the videos themselves.",
    plainEnglish:
      "The TRO restrains threats, doxxing, contact, impersonation, signage, customer interference, evidence destruction, and also requires removal of publications tied to the dispute.",
    bamTheory:
      "BAM argues immediate restrictions are needed because money alone cannot repair safety risk, copycat harassment, business disruption, and reputational harm.",
    benSidePressureTest:
      "This is why supporters see a speech fight: stopping harassment is one thing; forcing takedown of creator publications is the part that demands close scrutiny.",
    whatCourtMustDecide:
      "How far temporary relief can go while respecting safety, evidence preservation, defamation law, prior-restraint concerns, and future hearing evidence.",
    notAFinding:
      "A TRO is temporary relief entered early. It is not the same thing as a final trial judgment.",
    sourceUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Benjamin-Paul-Schneider-Reckless-Ben-Utah-Case-260402353-Temporary-Restraining-Order-TRO.pdf",
    sourceLabel: "Temporary restraining order",
    tone: "platform"
  },
  {
    id: "lens-declaratory",
    label: "07",
    legalBucket: "Inventory / declaration",
    title: "BAM also wants the judge to bless its inventory story.",
    plainEnglish:
      "The complaint asks for declarations that BAM/Sale Baker lawfully acquired Salem LLC assets and had no contract duty under the alleged Mansell consignment agreement.",
    bamTheory:
      "BAM wants the court to say the franchisor and replacement operators were not parties to the private consignment and did not inherit Bryan's alleged contract rights.",
    benSidePressureTest:
      "This is the heart of why viewers side with Ben: even if BAM has a contract defense, the public still wants the full item-by-item inventory trail.",
    whatCourtMustDecide:
      "Whether BAM's repossession rights beat the consignment theory, and whether any missing customer property can be traced to BAM, Baker, the former operators, or someone else.",
    notAFinding:
      "A declaration request is BAM asking the scoreboard to change. It has not changed until the court says so.",
    sourceUrl:
      "https://bamsucks.com/Bricks-and-Minifigs-v-Benjamin-Paul-Schneider-Reckless-Ben-Bryan-Mansell-Utah-Case-260402353-Verified-Complaint.pdf",
    sourceLabel: "Verified complaint",
    tone: "inventory"
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
