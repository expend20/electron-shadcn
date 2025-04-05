import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  base: './', // Ensure assets are loaded with relative paths
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure proper sourcemap generation
    sourcemap: true,
    // Force correct asset paths
    assetsDir: 'assets',
    // Optimize for Electron
    rollupOptions: {
      output: {
        format: 'cjs', // Use CommonJS format for better compatibility with Electron
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
});
