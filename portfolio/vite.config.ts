/// <reference types="vitest" />

import { defineConfig } from "vite";
import analog from "@analogjs/platform";

// ⚠ LANDMINE C1: SSG cannot discover /work/:slug on its own — every concrete
// URL must be enumerated here. The route list is generated from the data file,
// which is why src/app/data/* must stay framework-free (this import runs in
// Node at config-eval time, long before Angular exists).
// After every build: dist/analog/public must contain 13 index.html files
// (4 static routes + 9 project slugs).
import { projects } from "./src/app/data/projects";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    // Allow ngrok (and other tunnel) hostnames when testing on a phone.
    allowedHosts: [".ngrok-free.app", ".ngrok.io", ".ngrok.app"],
  },
  build: {
    target: ["es2020"],
  },
  resolve: {
    mainFields: ["module"],
  },
  plugins: [
    analog({
      static: true,
      prerender: {
        routes: ["/", "/work", "/about", "/gallery", ...projects.map((p) => `/work/${p.slug}`)],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test-setup.ts"],
    include: ["**/*.spec.ts"],
    reporters: ["default"],
  },
  define: {
    "import.meta.vitest": mode !== "production",
  },
}));
