import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const [, , filePath, outPathArg] = process.argv;

if (!filePath || !existsSync(filePath)) {
  console.error("Usage: npm run pdf:extract -- /absolute/path/to/public-redacted.pdf optional/output.txt");
  process.exit(1);
}

const outPath = outPathArg || join(dirname(filePath), `${basename(filePath)}.txt`);

try {
  const text = execFileSync("pdftotext", ["-layout", filePath, "-"], {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024
  });
  writeFileSync(outPath, text);
  console.log(`Extracted text to ${outPath}`);
} catch (error) {
  console.error("Could not run pdftotext. Install poppler, or use another OCR/text extraction tool for this public-redacted PDF.");
  throw error;
}
