/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves the site from /<repo-name>/, so production builds use that base path.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/friends-job-portal/" : "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
  },
}));
