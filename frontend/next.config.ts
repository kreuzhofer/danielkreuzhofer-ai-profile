import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure pageExtensions to include MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  
  // Empty turbopack config to silence the warning
  // MDX is supported natively in Next.js 16 with Turbopack
  turbopack: {},
};

export default nextConfig;
