/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { exec } from "child_process";
import { promisify } from "util";

async function getCommitHash() {
  const execP = promisify(exec);

  const { stdout } = await execP("git rev-parse --short HEAD");

  return stdout;
}

// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode }) => {
  const commitHash = await getCommitHash();

  return {
    build: {
      outDir: "./docs",
    },
    base: "/ifs-editor/",
    plugins: [react()],
    test: {
      includeSource: ["src/**/*.ts*"],
      coverage: {
        reporter: ["text", "json"],
      },
    },
    define: {
      "import.meta.vitest": false,
      __COMMIT_HASH__: JSON.stringify(commitHash),
    },
  };
});
