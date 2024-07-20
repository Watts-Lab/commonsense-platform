import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import {
  defineConfig as defineVitestConfig,
  configDefaults,
} from "vitest/config";

// https://vitejs.dev/config/
const viteConfig = defineViteConfig({
  plugins: [react(), viteTsconfigPaths()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
    port: 5173, // you can replace this port with any port
  },
});

const vitestConfig = defineVitestConfig({
  test: {
    coverage: {
      provider: "v8",
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      include: ["src/**"],
    },
    exclude: [
      ...configDefaults.exclude,
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "./src/config/**",
    ],
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
  },
});

export default mergeConfig(viteConfig, vitestConfig);
