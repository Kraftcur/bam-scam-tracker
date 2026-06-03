#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const wranglerFiles = [resolve(root, "wrangler.toml"), resolve(root, "wrangler.ingest.toml")];
const d1Name = process.env.CF_D1_DATABASE_NAME || "bam_scam_tracker";
const r2Bucket = process.env.CF_R2_BUCKET_NAME || "bam-scam-tracker-archive";
const kvTitle = process.env.CF_KV_NAMESPACE_TITLE || "SESSION";
const skipR2 = process.argv.includes("--skip-r2");
const skipSeed = process.argv.includes("--skip-seed");
const skipMigrate = process.argv.includes("--skip-migrate");

function run(args, options = {}) {
  const printable = ["npx", "wrangler", ...args].join(" ");
  console.log(`\n$ ${printable}`);
  try {
    return execFileSync("npx", ["wrangler", ...args], {
      cwd: root,
      encoding: "utf8",
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "pipe"
    });
  } catch (error) {
    const stdout = error.stdout?.toString() ?? "";
    const stderr = error.stderr?.toString() ?? "";
    const detail = [stdout, stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${printable} failed${detail ? `:\n${detail}` : "."}`);
  }
}

function runNpm(script) {
  console.log(`\n$ npm run ${script}`);
  execFileSync("npm", ["run", script], { cwd: root, stdio: "inherit" });
}

function parseJsonOutput(output, fallback = []) {
  try {
    return JSON.parse(output);
  } catch {
    const match = output.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    return match ? JSON.parse(match[1]) : fallback;
  }
}

function parseTomlAssignment(output, key) {
  const match = output.match(new RegExp(`${key}\\s*=\\s*"([^"]+)"`));
  return match?.[1];
}

function listD1Databases() {
  const output = run(["d1", "list", "--json"], { capture: true });
  return parseJsonOutput(output);
}

function listKvNamespaces() {
  const output = run(["kv", "namespace", "list"], { capture: true });
  return parseJsonOutput(output);
}

function listR2Buckets() {
  try {
    const output = run(["r2", "bucket", "list"], { capture: true });
    return parseJsonOutput(output);
  } catch (error) {
    if (/enable R2/i.test(error.message)) {
      console.warn("\nR2 is not enabled on this Cloudflare account. Skipping bucket creation for now.");
      console.warn("The app can deploy without R2 because v1 uses public archive links; enable R2 later for mirrored PDFs/audio.");
      return null;
    }
    throw error;
  }
}

function ensureD1() {
  const existing = listD1Databases().find((database) => database.name === d1Name);
  if (existing?.uuid) {
    console.log(`Using existing D1 database ${d1Name}: ${existing.uuid}`);
    return existing.uuid;
  }

  const output = run(["d1", "create", d1Name], { capture: true });
  const id = parseTomlAssignment(output, "database_id");
  if (!id) {
    throw new Error("Could not parse D1 database_id from Wrangler output.");
  }
  console.log(`Created D1 database ${d1Name}: ${id}`);
  return id;
}

function ensureKv() {
  const existing = listKvNamespaces().find((namespace) => namespace.title === kvTitle);
  if (existing?.id) {
    console.log(`Using existing KV namespace ${kvTitle}: ${existing.id}`);
    return existing.id;
  }

  const output = run(["kv", "namespace", "create", kvTitle], { capture: true });
  const id = parseTomlAssignment(output, "id");
  if (!id) {
    throw new Error("Could not parse KV namespace id from Wrangler output.");
  }
  console.log(`Created KV namespace ${kvTitle}: ${id}`);
  return id;
}

function ensureR2() {
  if (skipR2) {
    console.log("Skipping R2 provisioning because --skip-r2 was provided.");
    return false;
  }

  const buckets = listR2Buckets();
  if (!buckets) {
    return false;
  }
  if (buckets.some((bucket) => bucket.name === r2Bucket)) {
    console.log(`Using existing R2 bucket ${r2Bucket}`);
    return true;
  }

  run(["r2", "bucket", "create", r2Bucket], { capture: true });
  console.log(`Created R2 bucket ${r2Bucket}`);
  return true;
}

function withoutR2Binding(config) {
  return config.replace(/\n\[\[r2_buckets\]\]\n(?:[^\n]*\n){2}/, "\n");
}

function patchWranglerConfigs({ d1Id, kvId, includeR2 }) {
  for (const file of wranglerFiles) {
    let config = readFileSync(file, "utf8");
    config = config.replace(
      /(\[\[d1_databases\]\][\s\S]*?database_id = )"([^"]+)"/,
      `$1"${d1Id}"`
    );
    config = config.replace(
      /(\[\[kv_namespaces\]\][\s\S]*?id = )"([^"]+)"/,
      `$1"${kvId}"`
    );
    if (!includeR2) {
      config = withoutR2Binding(config);
    }
    writeFileSync(file, config);
    console.log(`Patched ${file}`);
  }
}

function main() {
  console.log("Checking Wrangler authentication...");
  try {
    const authOutput = run(["whoami"], { capture: true });
    if (/not authenticated|CLOUDFLARE_API_TOKEN/i.test(authOutput)) {
      throw new Error(authOutput.trim());
    }
  } catch (error) {
    console.error(error.message);
    console.error("\nWrangler is not authenticated. Run `npx wrangler login` or set `CLOUDFLARE_API_TOKEN`, then rerun `npm run cf:provision`.");
    process.exit(1);
  }

  const d1Id = ensureD1();
  const kvId = ensureKv();
  const includeR2 = ensureR2();
  patchWranglerConfigs({ d1Id, kvId, includeR2 });

  if (!skipMigrate) {
    runNpm("db:migrate:remote");
  }
  if (!skipSeed) {
    runNpm("db:seed:remote");
  }

  console.log("\nCloudflare resources are ready. Next run:");
  console.log("  npm run build");
  console.log("  npm run cf:deploy");
  console.log("  npm run cf:deploy:ingest");
}

main();
