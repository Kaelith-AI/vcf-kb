// KB port script — full implementation lands in M1.5.
//
// When finished, this script reads from the repo's legacy `docs/` corpus
// (primers, best-practices, lenses, review-system) and copies into
// `kb/<kind>/`, preserving frontmatter byte-for-byte. CI then diffs the copy
// against source and fails on drift.
//
// For M0 the script is a no-op placeholder that only prints an intentional
// banner so `npm run port` doesn't crash, but also doesn't pretend to work.
process.stderr.write(
  [
    "port-kb: M0 placeholder — port script implemented in M1.5.",
    "         Source: ../docs/{primers,best-practices,lenses,review-system}/",
    "         Target: kb/<kind>/",
  ].join("\n") + "\n",
);
process.exit(0);
