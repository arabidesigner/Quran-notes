import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// On GitHub Pages the app is served from /<repo>/, so the CI build sets
// PAGES_BASE (e.g. "/Quran-notes/"). Local dev/build stays at "/".
const base = process.env.PAGES_BASE ?? "/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  server: { host: true },
});
