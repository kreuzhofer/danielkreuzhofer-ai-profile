import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure pageExtensions to include MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  // Empty turbopack config to silence the warning
  // MDX is supported natively in Next.js 16 with Turbopack
  turbopack: {},

  // Allow the dev server (HMR websocket + /_next assets) to be reached from LAN
  // origins, so the dev site can be previewed on a phone over the network. Without
  // this, Next 16 blocks the cross-origin HMR socket and the page never hydrates
  // (menu/chat dead) even though the SSR HTML renders. Dev-only; ignored in prod.
  // Set DEV_ORIGINS (comma-separated hosts) to override per-LAN; falls back to the
  // current dev IP.
  allowedDevOrigins: (process.env.DEV_ORIGINS ?? "192.168.44.35").split(","),

  // Keep pdf-parse (and its pdfjs-dist dependency) as external Node.js modules
  // so the worker file is resolved from node_modules at runtime
  serverExternalPackages: ["pdf-parse"],

  async headers() {
    return [
      {
        source: "/downloads/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
