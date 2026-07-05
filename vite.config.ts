import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// On GitHub Pages the app is served from /<repo>/, so the CI build sets
// PAGES_BASE (e.g. "/Quran-notes/"). Local dev/build stays at "/".
const base = process.env.PAGES_BASE ?? "/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Precache these static assets (paths relative to the build base).
      includeAssets: ["icons/apple-touch-icon.png", "icons/favicon-32.png"],
      manifest: {
        name: "Quran Notes — study workspace",
        short_name: "Quran Notes",
        description:
          "Mark up the mushaf like paper: draw, highlight, and annotate Qur'an pages, then organise and revisit your reflections.",
        lang: "en",
        dir: "ltr",
        theme_color: "#0f1512",
        background_color: "#0a120d",
        display: "standalone",
        orientation: "any",
        // Relative so it resolves under the Pages sub-path too.
        start_url: ".",
        scope: ".",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // The tldraw app shell is large — precache it fully so the app opens
        // offline once installed.
        globPatterns: ["**/*.{js,css,html,png,svg,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            // Mushaf page images — immutable, so cache-first and keep a big set
            // so pages you've opened stay available offline.
            urlPattern: ({ url }) =>
              url.hostname.endsWith("quran.com") && /\/page\d+\.png$/i.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "mushaf-pages",
              expiration: { maxEntries: 640, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Quran.com API (surah list + translations) — fresh when online,
            // instant + offline-tolerant from cache otherwise.
            urlPattern: ({ url }) => url.hostname === "api.quran.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "quran-api",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // Let us test install/offline behaviour with `npm run dev`.
        enabled: true,
      },
    }),
  ],
  server: { host: true },
});
