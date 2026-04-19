import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    clearMocks: true,
    testTimeout: 10_000,
    // Match @kaelith-labs/cli: native bindings + linked test pairs do not play well
    // with vitest's default worker pool. Single forked process is plenty.
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
