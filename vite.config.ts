import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // Development server port
  server: {
    port: 3000,
  },
  // Enable the Remix plugin, which handles everything including CSS attachments.
  plugins: [reactRouter()],
});
