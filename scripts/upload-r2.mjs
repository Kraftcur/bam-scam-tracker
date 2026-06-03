import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { basename } from "node:path";

const [, , filePath, keyArg] = process.argv;

if (!filePath || !existsSync(filePath)) {
  console.error("Usage: npm run r2:upload -- /absolute/path/to/file.pdf optional/key.pdf");
  process.exit(1);
}

const key = keyArg || basename(filePath);
const size = statSync(filePath).size;

execFileSync(
  "npx",
  ["wrangler", "r2", "object", "put", `bam-scam-tracker-archive/${key}`, "--file", filePath],
  { stdio: "inherit" }
);

console.log(`Uploaded ${key} (${size} bytes). Add r2Key="${key}" to the matching document record.`);
