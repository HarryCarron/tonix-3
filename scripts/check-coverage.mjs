#!/usr/bin/env node
// Reads coverage/coverage-summary.json (produced by `npm run test:coverage`,
// via vitest's "json-summary" reporter) and warns - via a GitHub Actions
// workflow annotation - when any metric falls below THRESHOLD. Always exits
// 0: this is a warn-only gate, not a build-breaking one. See
// .github/workflows/ci.yml.

import { readFileSync } from "node:fs";

const THRESHOLD = 80;
const SUMMARY_PATH = "coverage/coverage-summary.json";
const METRICS = ["lines", "statements", "functions", "branches"];

function warn(message) {
  console.log(`::warning::${message}`);
}

let raw;
try {
  raw = readFileSync(SUMMARY_PATH, "utf8");
} catch {
  warn(
    `Coverage summary not found at ${SUMMARY_PATH} - skipping the ${THRESHOLD}% coverage check.`,
  );
  process.exit(0);
}

const { total } = JSON.parse(raw);

console.log(`Coverage (threshold ${THRESHOLD}%):`);
const below = [];
for (const metric of METRICS) {
  const pct = total[metric].pct;
  console.log(`  ${metric.padEnd(10)} ${pct}%`);
  if (pct < THRESHOLD) {
    below.push(`${metric} (${pct}%)`);
  }
}

if (below.length > 0) {
  warn(
    `Test coverage is below the ${THRESHOLD}% threshold for: ${below.join(", ")}. This does not fail the build.`,
  );
}
