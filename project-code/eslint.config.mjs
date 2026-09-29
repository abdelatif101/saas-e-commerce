import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: "architecture-boundary-guard",
    files: ["src/core/**/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          name: "**/infrastructure/**",
          message: "Domain may not import infrastructure.",
        },
        {
          name: "**/application/**",
          message: "Domain may not import application services.",
        },
        {
          name: "src/app/**",
          message: "Domain may not import route handlers or UI.",
        },
        {
          name: "src/plugins/**",
          message: "Domain may not import plugin implementations.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
