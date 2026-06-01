import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 3000,
    proxy: {
      "/api/patient": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/api/v2": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 排除大文件目录
          if (assetInfo.name && (
            assetInfo.name.includes('hospital_photos/') ||
            assetInfo.name.includes('_backup_') ||
            assetInfo.name.includes('private/')
          )) {
            return 'excluded/[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    },
  },
  publicDir: 'public', // 启用 public 目录
}));
