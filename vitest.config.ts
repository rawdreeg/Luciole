import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      DATABASE_URL: "postgresql://testuser:testpassword@testhost:5432/testdb",
      JWT_SECRET: "test-secret",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  deps: {
    inline: ["bcrypt", "jsonwebtoken"],
  },
});