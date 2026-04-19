import { describe, it, expect } from "vitest";
import { statSync } from "node:fs";
import { resolve } from "node:path";

// M0 smoke: the KB directory scaffold exists and lives beside the package
// manifest. Full frontmatter-validation tests arrive in M1.5; this file just
// guarantees the `files` whitelist in package.json ships a real directory.
const REQUIRED_DIRS = [
  "kb",
  "kb/primers",
  "kb/best-practices",
  "kb/lenses",
  "kb/reviewers",
  "kb/standards",
  "kb/review-system/code",
  "kb/review-system/security",
  "kb/review-system/production",
];

describe("M0 KB layout", () => {
  for (const rel of REQUIRED_DIRS) {
    it(`${rel}/ exists as a directory`, () => {
      const full = resolve(__dirname, "..", rel);
      expect(statSync(full).isDirectory()).toBe(true);
    });
  }
});
