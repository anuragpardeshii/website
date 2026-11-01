import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Stable framework chunks can be reused when business content changes.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id))
            return "react-vendor";
          if (
            /node_modules\/(motion|motion-dom|motion-utils|framer-motion)\//.test(
              id,
            )
          )
            return "motion-vendor";
        },
      },
    },
  },
});
