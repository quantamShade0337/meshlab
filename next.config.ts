import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js dev-tools "Rendering…" overlay (dev only; never shipped).
  devIndicators: false,
  // Keep the Gradio client (used server-side for the accurate 360° path) out of
  // the bundler so its dynamic requires resolve correctly at runtime.
  serverExternalPackages: ["@gradio/client"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
