import { describe, it, expect } from "vitest";
import {
  PrimerFrontmatter,
  BestPracticeFrontmatter,
  LensFrontmatter,
  StageFrontmatter,
  ReviewerConfigFrontmatter,
  StandardFrontmatter,
  FrontmatterByType,
} from "../src/frontmatter.js";

describe("PrimerFrontmatter", () => {
  it("accepts the seed MCP primer shape", () => {
    const ok = {
      type: "primer",
      primer_name: "mcp",
      category: "tools",
      version: "2.0",
      updated: "2026-04-18",
      status: "draft-v2",
    };
    expect(PrimerFrontmatter.parse(ok).primer_name).toBe("mcp");
  });

  it("rejects missing type", () => {
    expect(PrimerFrontmatter.safeParse({ primer_name: "x" }).success).toBe(false);
  });

  it("rejects non-lowercase-kebab tags", () => {
    const bad = {
      type: "primer",
      primer_name: "x",
      category: "tools",
      version: 1,
      updated: "2026-01-01",
      tags: ["BadTag"],
    };
    expect(PrimerFrontmatter.safeParse(bad).success).toBe(false);
  });

  it("tolerates unknown author-facing fields (passthrough)", () => {
    // M9 schemas use .passthrough() so legacy author metadata (routing,
    // audience notes, supersedes references) doesn't fail validation. The
    // engine only reads the declared fields; extras ride along untouched.
    const extended = {
      type: "primer",
      primer_name: "x",
      category: "tools",
      version: 1,
      updated: "2026-01-01",
      audience: "planners",
      supersedes: "older-primer",
    };
    expect(PrimerFrontmatter.safeParse(extended).success).toBe(true);
  });
});

describe("StageFrontmatter", () => {
  it("accepts a Stage-1 code review entry", () => {
    const ok = {
      type: "review-stage",
      review_type: "code",
      stage: 1,
      stage_name: "fake-complete",
      version: 0.1,
      updated: "2026-04-18",
    };
    expect(StageFrontmatter.parse(ok).stage).toBe(1);
  });

  it("rejects stage > 15 (review_type_create's suggested_step_count cap)", () => {
    expect(
      StageFrontmatter.safeParse({
        type: "review-stage",
        review_type: "code",
        stage: 16,
        stage_name: "x",
        version: 1,
        updated: "2026-01-01",
      }).success,
    ).toBe(false);
  });

  it("accepts a custom kebab-slug review_type (not enum-locked)", () => {
    // 0.7 — config.review.categories is the source of truth for which
    // slugs are routable; the schema only enforces shape (kebab-slug).
    expect(
      StageFrontmatter.safeParse({
        type: "review-stage",
        review_type: "vibe",
        stage: 1,
        version: 0.1,
        updated: "2026-04-30",
      }).success,
    ).toBe(true);
  });

  it("accepts stage_name as optional (agent drafts often emit `title` only)", () => {
    expect(
      StageFrontmatter.safeParse({
        type: "review-stage",
        review_type: "vibe",
        stage: 5,
        version: 0.1,
        updated: "2026-04-30",
      }).success,
    ).toBe(true);
  });
});

describe("FrontmatterByType dispatch", () => {
  it("covers every declared kind", () => {
    expect(Object.keys(FrontmatterByType).sort()).toEqual(
      ["primer", "best-practices", "lens", "review-stage", "reviewer-config", "standard"].sort(),
    );
  });

  it("schemas all parse a known-good object of their type", () => {
    expect(() => StandardFrontmatter.parse({
      type: "standard",
      standard_name: "co",
      version: 0.1,
      updated: "2026-04-18",
    })).not.toThrow();
    expect(() => ReviewerConfigFrontmatter.parse({
      type: "reviewer-config",
      reviewer_type: "code",
      version: 0.1,
      updated: "2026-04-18",
    })).not.toThrow();
    expect(() => LensFrontmatter.parse({
      type: "lens",
      lens_name: "security-surface",
      focus: "attack surface",
      version: 1,
      updated: "2026-04-18",
    })).not.toThrow();
    expect(() => BestPracticeFrontmatter.parse({
      type: "best-practices",
      best_practice_name: "mcp",
      category: "ai",
      version: 1,
      updated: "2026-04-18",
    })).not.toThrow();
  });
});
