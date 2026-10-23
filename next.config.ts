import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const PAGE_EXTENSIONS = ["tsx", "ts", "jsx", "js"];
const DEV_PAGE_EXTENSIONS = PAGE_EXTENSIONS.map((ext) => `dev.${ext}`);

export default function config(phase: string): NextConfig {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    cacheComponents: true,
    partialPrefetching: true,
    allowedDevOrigins: ["192.168.*.*"],
    pageExtensions: dev
      ? [...DEV_PAGE_EXTENSIONS, ...PAGE_EXTENSIONS]
      : PAGE_EXTENSIONS,
    turbopack: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      },
    },
  };
}
