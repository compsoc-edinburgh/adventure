import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

declare module "@remix-run/server-runtime" {
  // or cloudflare, deno, etc.
  // eslint-disable-next-line no-unused-vars
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  // Development server port
  server: {
    port: 3000,
  },
  // Enable the Remix plugin, which handles everything including CSS attachments.
  plugins: [remix({
    appDirectory: "src",
    future: {
      // Enable all future features that warn. Read relevant docs before adding
      // or deleting flags.
      v3_fetcherPersist: true,
      v3_relativeSplatPath: true,
      v3_throwAbortReason: true,
      v3_singleFetch: true,
      v3_lazyRouteDiscovery: true,
    },
  })],
});
