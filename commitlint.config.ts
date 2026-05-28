import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "style",
        "refactor",
        "docs",
        "test",
        "perf",
        "ci",
        "build",
        "revert",
      ],
    ],
  },
};

export default config;
