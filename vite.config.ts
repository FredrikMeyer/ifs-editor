/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "./docs",
  },
  base: "/ifs-editor/",
  plugins: [react()],
  test: {
    includeSource: ["src/**/*.ts*"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
  define: {
    "import.meta.vitest": false,
  },
});
