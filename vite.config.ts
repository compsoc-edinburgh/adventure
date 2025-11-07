import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig(({ isSsrBuild }) => ({
  // Development server port
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./server/app.ts",
        }
      : undefined,
  },
  // Enable the Remix plugin, which handles everything including CSS attachments.
  plugins: [reactRouter()],
}));
