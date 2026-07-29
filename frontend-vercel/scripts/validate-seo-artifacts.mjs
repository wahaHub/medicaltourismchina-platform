import path from "node:path";
import process from "node:process";

import { validateSeoArtifacts } from "../seo/artifact-validation.mjs";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const CONTRACTS_DIR = path.join(PROJECT_ROOT, "seo", "contracts");

const result = await validateSeoArtifacts({
  distDir: path.join(PROJECT_ROOT, "dist"),
  protectedUrlsPath: path.join(CONTRACTS_DIR, "protected-urls.json"),
  approvedRemovalsPath: path.join(CONTRACTS_DIR, "approved-url-removals.json"),
  protectedMetadataPath: path.join(
    CONTRACTS_DIR,
    "protected-page-metadata.json",
  ),
});

for (const warning of result.warnings) {
  process.stderr.write(`[seo-contract] WARNING: ${warning}\n`);
}

if (result.errors.length > 0) {
  process.stderr.write(
    `[seo-contract] FAILED with ${result.errors.length} violation(s):\n`,
  );
  for (const error of result.errors.slice(0, 50)) {
    process.stderr.write(`  - ${error}\n`);
  }
  if (result.errors.length > 50) {
    process.stderr.write(
      `  ... ${result.errors.length - 50} additional violation(s) omitted\n`,
    );
  }
  process.exitCode = 1;
} else {
  const {
    sitemapUrls,
    generatedPages,
    indexablePages,
    protectedUrls,
    newUrls,
    protectedMetadataPages,
  } = result.stats;
  process.stdout.write(
    "[seo-contract] PASS "
    + `sitemap=${sitemapUrls}, generated=${generatedPages}, `
    + `indexable=${indexablePages}, protected=${protectedUrls}, `
    + `new=${newUrls}, protected-metadata=${protectedMetadataPages}\n`,
  );
}
